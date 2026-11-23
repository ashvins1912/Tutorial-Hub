import { IncomingMessage, Server as HttpServer } from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import { createClient } from '@supabase/supabase-js';

export interface PairUser {
  userId: string;
  name: string;
  color: string;
  initials: string;
  cursor: { x: number; y: number } | null;
}

export interface CanvasStroke {
  id: string;
  userId: string;
  color: string;
  width: number;
  points: { x: number; y: number }[];
}

export interface SharedSandboxPayload {
  problemId: string;
  tsMap?: Record<number, number>;
  tsSelected?: number[];
  tsStatus?: string;
  swL?: number;
  swR?: number;
  swBest?: number;
  msIdx?: number;
  msStack?: number[];
  msAns?: number[];
  rwL?: number;
  rwR?: number;
  rwLMax?: number;
  rwRMax?: number;
  rwWaterByBar?: Record<number, number>;
  rwWarning?: string | null;
  ccDp?: (number | null)[];
  ccActiveAmount?: number;
  updatedBy?: string;
}

interface RoomState {
  roomId: string;
  users: Map<string, PairUser>;
  sockets: Map<WebSocket, string>;
  strokes: CanvasStroke[];
  sandboxState: SharedSandboxPayload | null;
}

const rooms = new Map<string, RoomState>();
const verifiedSockets = new WeakMap<IncomingMessage, { userId: string; name: string }>();

function getPairAuthClient() {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const key = (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '').trim();
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } });
}

function rejectUpgrade(socket: import('stream').Duplex, status: number, message: string) {
  if (!socket.destroyed) {
    socket.write('HTTP/1.1 ' + status + ' ' + message + '\r\nConnection: close\r\nContent-Length: 0\r\n\r\n');
    socket.destroy();
  }
}

function getOrCreateRoom(roomId: string): RoomState {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      roomId,
      users: new Map(),
      sockets: new Map(),
      strokes: [],
      sandboxState: null,
    });
  }
  return rooms.get(roomId)!;
}

function broadcast(room: RoomState, data: unknown, excludeSocket?: WebSocket) {
  const payload = JSON.stringify(data);
  for (const client of room.sockets.keys()) {
    if (client !== excludeSocket && client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

export function attachPairWebSocketServer(httpServer: HttpServer) {
  const wss = new WebSocketServer({ noServer: true, maxPayload: 64 * 1024 });

  httpServer.on('upgrade', (req: IncomingMessage, socket, head) => {
    const reqUrl = req.url || '/';
    if (!reqUrl.startsWith('/ws/pair')) {
      return;
    }

    const parsedUrl = new URL(reqUrl, 'http://localhost');
    const token = parsedUrl.searchParams.get('access_token') || '';
    const authClient = getPairAuthClient();
    if (!authClient) {
      rejectUpgrade(socket, 503, 'Service Unavailable');
      return;
    }
    if (!token || token.length > 8192) {
      rejectUpgrade(socket, 401, 'Unauthorized');
      return;
    }
    void authClient.auth.getUser(token).then(({ data, error }) => {
      if (error || !data.user) {
        rejectUpgrade(socket, 401, 'Unauthorized');
        return;
      }
      const metadata = data.user.user_metadata || {};
      const name = String(metadata.full_name || metadata.name || data.user.email?.split('@')[0] || 'Developer').slice(0, 60);
      verifiedSockets.set(req, { userId: data.user.id, name });
      if (socket.destroyed) return;
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req);
      });
    }).catch(() => rejectUpgrade(socket, 503, 'Service Unavailable'));
  });

  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    const parsedUrl = new URL(req.url || '/ws/pair', 'http://localhost:3000');
    const requestedRoomId = parsedUrl.searchParams.get('room') || '';
    const identity = verifiedSockets.get(req);
    if (!identity || !/^[a-zA-Z0-9_-]{22,64}$/.test(requestedRoomId)) {
      ws.close(1008, 'Invalid authenticated room');
      return;
    }
    const roomId = requestedRoomId;
    const room = getOrCreateRoom(roomId);

    let currentUserId: string | null = null;

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        const { type } = msg;

        if (type === 'user:join' && !currentUserId) {
          const user: PairUser = {
            userId: identity.userId,
            name: identity.name,
            color: '#0284c7',
            initials: identity.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'DV',
            cursor: null,
          };
          currentUserId = user.userId;
          room.sockets.set(ws, user.userId);
          room.users.set(user.userId, user);

          // Initial full state sync for joining client
          ws.send(
            JSON.stringify({
              type: 'room:init',
              roomId,
              users: Array.from(room.users.values()),
              strokes: room.strokes,
              sandboxState: room.sandboxState,
            })
          );

          // Notify other peers in room
          broadcast(
            room,
            {
              type: 'user:joined',
              user,
              users: Array.from(room.users.values()),
            },
            ws
          );
          return;
        }

        if (type === 'cursor:move' && currentUserId) {
          const cursor = msg.cursor;
          if (cursor !== null && (!cursor || !Number.isFinite(cursor.x) || !Number.isFinite(cursor.y) || cursor.x < 0 || cursor.x > 1 || cursor.y < 0 || cursor.y > 1)) return;
          const existing = room.users.get(currentUserId);
          if (existing) {
            existing.cursor = msg.cursor ?? null;
          }
          broadcast(
            room,
            {
              type: 'cursor:moved',
              userId: currentUserId,
              cursor: cursor ?? null,
            },
            ws
          );
          return;
        }

        if (type === 'stroke:add' && currentUserId && msg.stroke?.id && Array.isArray(msg.stroke.points) && msg.stroke.points.length >= 2 && msg.stroke.points.length <= 2000) {
          // Idempotent check to prevent duplicate strokes on reconnect
          if (!room.strokes.some((s) => s.id === msg.stroke.id)) {
            const stroke: CanvasStroke = {
              id: String(msg.stroke.id),
              userId: currentUserId,
              color: String(msg.stroke.color || '#0284c7'),
              width: Number.isFinite(msg.stroke.width) ? Math.min(12, Math.max(1, Number(msg.stroke.width))) : 2.5,
              points: msg.stroke.points.filter((point: any) => point && Number.isFinite(point.x) && Number.isFinite(point.y) && point.x >= 0 && point.x <= 1 && point.y >= 0 && point.y <= 1),
            };
            room.strokes.push(stroke);
            if (room.strokes.length > 200) {
              room.strokes = room.strokes.slice(-200);
            }
            broadcast(room, { type: 'stroke:added', stroke }, ws);
          }
          return;
        }

        if (type === 'canvas:clear' && currentUserId) {
          room.strokes = [];
          broadcast(room, { type: 'canvas:cleared', by: currentUserId }, ws);
          return;
        }

        if (type === 'sandbox:sync' && currentUserId && typeof msg.sandboxState?.problemId === 'string' && msg.sandboxState.problemId.length <= 120) {
          room.sandboxState = { ...msg.sandboxState, updatedBy: currentUserId } as SharedSandboxPayload;
          broadcast(
            room,
            {
              type: 'sandbox:synced',
              sandboxState: room.sandboxState,
              by: currentUserId,
            },
            ws
          );
        }
      } catch {
        // ignore malformed websocket payloads
      }
    });

    ws.on('close', () => {
      room.sockets.delete(ws);
      if (currentUserId) {
        // Keep user only if another socket in this room uses same userId
        const stillActive = Array.from(room.sockets.values()).includes(currentUserId);
        if (!stillActive) {
          room.users.delete(currentUserId);
          broadcast(room, {
            type: 'user:left',
            userId: currentUserId,
            users: Array.from(room.users.values()),
          });
        }
      }
      if (room.sockets.size === 0 && room.strokes.length === 0) {
        rooms.delete(roomId);
      }
    });
  });

  return wss;
}
