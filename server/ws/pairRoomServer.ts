import { IncomingMessage, Server as HttpServer } from 'http';
import { WebSocket, WebSocketServer } from 'ws';

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
  const wss = new WebSocketServer({ noServer: true });

  httpServer.on('upgrade', (req: IncomingMessage, socket, head) => {
    const reqUrl = req.url || '/';
    if (!reqUrl.startsWith('/ws/pair')) {
      return;
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, req);
    });
  });

  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    const parsedUrl = new URL(req.url || '/ws/pair', 'http://localhost:3000');
    const roomId = (parsedUrl.searchParams.get('room') || 'default-pair').slice(0, 64);
    const room = getOrCreateRoom(roomId);

    let currentUserId: string | null = null;

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        const { type } = msg;

        if (type === 'user:join' && msg.user?.userId) {
          const user: PairUser = {
            userId: String(msg.user.userId),
            name: String(msg.user.name || 'Developer'),
            color: String(msg.user.color || '#0284c7'),
            initials: String(msg.user.initials || 'DV'),
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
          const existing = room.users.get(currentUserId);
          if (existing) {
            existing.cursor = msg.cursor ?? null;
          }
          broadcast(
            room,
            {
              type: 'cursor:moved',
              userId: currentUserId,
              cursor: msg.cursor ?? null,
            },
            ws
          );
          return;
        }

        if (type === 'stroke:add' && msg.stroke?.id) {
          // Idempotent check to prevent duplicate strokes on reconnect
          if (!room.strokes.some((s) => s.id === msg.stroke.id)) {
            const stroke: CanvasStroke = {
              id: String(msg.stroke.id),
              userId: String(msg.stroke.userId || currentUserId || 'anon'),
              color: String(msg.stroke.color || '#0284c7'),
              width: Number(msg.stroke.width || 2.5),
              points: Array.isArray(msg.stroke.points) ? msg.stroke.points : [],
            };
            room.strokes.push(stroke);
            if (room.strokes.length > 200) {
              room.strokes = room.strokes.slice(-200);
            }
            broadcast(room, { type: 'stroke:added', stroke }, ws);
          }
          return;
        }

        if (type === 'canvas:clear') {
          room.strokes = [];
          broadcast(room, { type: 'canvas:cleared', by: currentUserId }, ws);
          return;
        }

        if (type === 'sandbox:sync' && msg.sandboxState?.problemId) {
          room.sandboxState = msg.sandboxState as SharedSandboxPayload;
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
