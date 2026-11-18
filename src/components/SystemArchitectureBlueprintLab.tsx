import { useMemo, useState } from 'react';
import { Activity, AlertTriangle, ArrowRight, BookOpen, Gauge, Layers3, Play, RotateCcw, ShieldCheck, Workflow } from 'lucide-react';

type NodeSpec = { id: string; title: string; sub: string; x: number; y: number; kind?: 'store' | 'edge' | 'worker' };
type Blueprint = {
  id: string; name: string; problem: string; principle: string; nodes: NodeSpec[];
  edges: [string, string, string][];
  flow: { title: string; detail: string; active: string[] }[];
  components: { name: string; responsibility: string; decision: string; failure: string }[];
  scale: string[]; tradeoffs: string[];
  cache: number; dbCapacity: number; queueCapacity: number; baseLatency: number;
};

const blueprints: Blueprint[] = [
  {
    id: 'shortener', name: 'URL shortener', problem: 'Create short links and redirect billions of reads with predictable latency.',
    principle: 'Separate the write path (key allocation and durable mapping) from the read-heavy redirect path. Cache hot mappings at the edge and keep the mapping store optimised for key lookups.',
    nodes: [
      { id: 'client', title: 'Client', sub: 'Browser / app', x: 30, y: 112, kind: 'edge' },
      { id: 'edge', title: 'Edge CDN', sub: 'TLS · WAF · cache', x: 190, y: 112, kind: 'edge' },
      { id: 'api', title: 'Redirect API', sub: 'Validate · resolve', x: 350, y: 112 },
      { id: 'cache', title: 'Redis', sub: 'Hot key → URL', x: 510, y: 42, kind: 'store' },
      { id: 'db', title: 'Mapping DB', sub: 'Durable key-value', x: 510, y: 182, kind: 'store' },
      { id: 'analytics', title: 'Event stream', sub: 'Click events', x: 690, y: 112, kind: 'worker' },
    ],
    edges: [['client','edge','HTTPS'],['edge','api','GET /{code}'],['api','cache','1 · lookup'],['cache','db','2 · cache miss'],['api','analytics','3 · async click']],
    flow: [
      { title: 'Resolve the short code', detail: 'The edge terminates TLS, applies WAF/rate limits and may serve a cached redirect. A miss reaches the redirect service.', active: ['client','edge','api'] },
      { title: 'Read-through cache', detail: 'The service checks Redis. A hit returns the destination immediately; a miss reads the durable mapping and populates the cache with a bounded TTL.', active: ['api','cache','db'] },
      { title: 'Return redirect', detail: 'The API returns 301 or 302 according to product semantics. Avoid caching mutable destinations forever; invalidate or version mappings.', active: ['edge','api','client'] },
      { title: 'Record analytics asynchronously', detail: 'Publish a compact click event. Do not make the redirect wait for dashboards, aggregation or warehouse writes.', active: ['api','analytics'] },
    ],
    components: [
      { name: 'Edge / CDN', responsibility: 'TLS, WAF, abuse controls, geographic routing and optional hot redirect cache.', decision: 'Cache only when redirect mutability and invalidation semantics are clear.', failure: 'Origin shield, multi-region routing and a short-lived fallback policy.' },
      { name: 'Redirect service', responsibility: 'Validate code, resolve destination, apply tenant rules and issue redirect response.', decision: 'Keep this path stateless so it can scale horizontally.', failure: 'Timeout budget, circuit breaker and bounded retries only for safe reads.' },
      { name: 'Redis cache', responsibility: 'Absorb repeated reads for popular short codes.', decision: 'Use TTL + explicit invalidation; monitor hit ratio and memory eviction.', failure: 'Cache miss must fall back to DB; protect DB with request coalescing and rate limits.' },
      { name: 'Mapping database', responsibility: 'Durable unique code → destination mapping.', decision: 'Choose partition key around code; enforce uniqueness at write time.', failure: 'Replicas, backups, restore drills and tested failover.' },
      { name: 'Event stream', responsibility: 'Decouple click analytics from user-facing redirect.', decision: 'At-least-once delivery means consumers must be idempotent.', failure: 'Retain events, retry with DLQ and alert on consumer lag.' },
    ],
    scale: ['Start with one stateless API tier and a relational table with a unique index on short_code.', 'Add Redis for hot keys; measure hit ratio before increasing cache size.', 'Partition the mapping store only when measured storage or throughput limits justify it.', 'Move click analytics to a durable stream and independent consumers.', 'Add multi-region reads with explicit replication-lag and failover semantics.'],
    tradeoffs: ['301 can be cached aggressively by browsers; 302 gives more control when destinations may change.', 'A globally unique ID strategy avoids central coordination but can leak creation volume or require encoding.', 'Asynchronous analytics improves redirect latency but makes dashboards eventually consistent.'],
    cache: 92, dbCapacity: 1800, queueCapacity: 900, baseLatency: 22,
  },
  {
    id: 'feed', name: 'News feed', problem: 'Build a personalised home feed for users following many creators.',
    principle: 'Use a hybrid fan-out model: precompute feeds for ordinary accounts, but merge high-follower creators at read time to avoid write amplification.',
    nodes: [
      { id: 'client', title: 'Mobile client', sub: 'Cursor pagination', x: 30, y: 112, kind: 'edge' },
      { id: 'gateway', title: 'API gateway', sub: 'Auth · quotas', x: 190, y: 112, kind: 'edge' },
      { id: 'feed', title: 'Feed service', sub: 'Merge · rank', x: 350, y: 112 },
      { id: 'cache', title: 'Feed cache', sub: 'Per-user timeline', x: 510, y: 42, kind: 'store' },
      { id: 'posts', title: 'Post store', sub: 'Canonical content', x: 510, y: 182, kind: 'store' },
      { id: 'fanout', title: 'Fan-out workers', sub: 'Queue · retries', x: 690, y: 112, kind: 'worker' },
    ],
    edges: [['client','gateway','GET /feed'],['gateway','feed','identity + cursor'],['feed','cache','read timeline'],['feed','posts','hydrate posts'],['fanout','cache','write followers']],
    flow: [
      { title: 'Publish a post', detail: 'Persist the canonical post first, then emit a PostCreated event using an outbox or equivalent reliable-publish pattern.', active: ['posts','fanout'] },
      { title: 'Fan out to followers', detail: 'Workers append post IDs to follower timelines. Use idempotency keys, batching, backpressure and a dead-letter queue.', active: ['fanout','cache'] },
      { title: 'Read the feed', detail: 'The API reads a cursor page of candidate IDs, hydrates canonical post data and applies visibility and ranking rules.', active: ['client','gateway','feed','cache','posts'] },
      { title: 'Merge celebrity posts', detail: 'For very high-follower creators, avoid writing to millions of timelines. Merge their recent posts at read time and deduplicate.', active: ['feed','posts','cache'] },
    ],
    components: [
      { name: 'Post service + store', responsibility: 'Own canonical posts, edits, deletes and visibility.', decision: 'Timeline stores post IDs, not copies of the full post payload.', failure: 'Use tombstones or visibility checks so deleted/private posts do not leak from stale timelines.' },
      { name: 'Event outbox', responsibility: 'Publish PostCreated reliably after database commit.', decision: 'Avoid dual-write loss between database and message broker.', failure: 'Replay unpublished outbox rows and make consumers idempotent.' },
      { name: 'Fan-out workers', responsibility: 'Write post IDs into follower timelines.', decision: 'Hybrid fan-out: push for normal accounts, pull for celebrities.', failure: 'Bound queue lag, autoscale workers and apply per-creator throttles.' },
      { name: 'Feed cache', responsibility: 'Store ordered IDs and cursors per user.', decision: 'Use bounded timeline windows and stable cursor semantics.', failure: 'Rebuild cache from events or canonical data; tolerate stale ranking, never stale privacy.' },
      { name: 'Ranking service', responsibility: 'Score candidates with freshness, affinity and quality signals.', decision: 'Keep ranking explainable and latency-budgeted; fall back to chronological order.', failure: 'Serve a safe cached or chronological feed when ranking times out.' },
    ],
    scale: ['Start with chronological queries over indexed follows and posts for a small product.', 'Introduce asynchronous fan-out when read-time joins become expensive.', 'Use hybrid push/pull for creators with huge follower counts.', 'Separate candidate generation from ranking and hydration.', 'Add cache rebuild, event replay and privacy revalidation before multi-region expansion.'],
    tradeoffs: ['Fan-out-on-write makes reads fast but amplifies writes and queue volume.', 'Fan-out-on-read keeps writes cheap but makes reads expensive for users following many accounts.', 'Ranking quality competes with latency; use staged candidate retrieval and a fallback path.'],
    cache: 75, dbCapacity: 1250, queueCapacity: 1400, baseLatency: 48,
  },
  {
    id: 'chat', name: 'Real-time chat', problem: 'Deliver low-latency messages to online users while preserving history and reconnect behaviour.',
    principle: 'Separate persistent message acceptance from best-effort live delivery. The message log is the source of truth; WebSocket gateways are replaceable delivery infrastructure.',
    nodes: [
      { id: 'client', title: 'Chat clients', sub: 'WebSocket / HTTPS', x: 30, y: 112, kind: 'edge' },
      { id: 'gateway', title: 'WS gateway', sub: 'Connections · rooms', x: 190, y: 112, kind: 'edge' },
      { id: 'message', title: 'Message API', sub: 'Auth · idempotency', x: 350, y: 112 },
      { id: 'log', title: 'Message log', sub: 'Ordered per room', x: 510, y: 42, kind: 'store' },
      { id: 'broker', title: 'Pub / Sub', sub: 'Room fan-out', x: 510, y: 182, kind: 'worker' },
      { id: 'push', title: 'Push service', sub: 'Offline devices', x: 690, y: 112, kind: 'worker' },
    ],
    edges: [['client','gateway','send / receive'],['gateway','message','authenticated command'],['message','log','persist first'],['log','broker','MessageCreated'],['broker','push','online + offline delivery']],
    flow: [
      { title: 'Authenticate connection', detail: 'A WebSocket gateway validates the session, tracks connection ownership and joins the user to authorised room channels.', active: ['client','gateway'] },
      { title: 'Accept and persist message', detail: 'The API checks membership and idempotency key, assigns a room sequence and commits the message before acknowledging success.', active: ['gateway','message','log'] },
      { title: 'Fan out to online members', detail: 'A durable event or transactional outbox feeds room subscribers. Delivery acknowledgements are separate from persistence acknowledgement.', active: ['log','broker','gateway'] },
      { title: 'Reconnect and catch up', detail: 'On reconnect, clients send their last seen sequence and fetch missing messages from the durable log; push notifications are only a wake-up hint.', active: ['client','gateway','log','push'] },
    ],
    components: [
      { name: 'WebSocket gateway', responsibility: 'Maintain long-lived connections and route room events to connected clients.', decision: 'Keep connection state ephemeral and externalise presence where needed.', failure: 'Reconnect with jitter, connection draining and client sequence catch-up.' },
      { name: 'Message API', responsibility: 'Authorise sender, validate room membership and enforce idempotency.', decision: 'Persist before acknowledging; allocate monotonic sequence per room where ordering is required.', failure: 'Retry with same idempotency key to avoid duplicate sends.' },
      { name: 'Message store', responsibility: 'Durable history and replay by room + sequence.', decision: 'Partition around room or conversation ID; define retention and archival.', failure: 'Replicas, backups and replay after gateway/broker outages.' },
      { name: 'Broker', responsibility: 'Distribute committed messages to gateway nodes and downstream consumers.', decision: 'Partition by room to preserve local ordering where possible.', failure: 'Consumer offsets, bounded retries, DLQ and lag alarms.' },
      { name: 'Presence / push', responsibility: 'Track approximate online state and notify offline devices.', decision: 'Presence is usually soft state with TTL, not a source of truth.', failure: 'Missed push must not lose messages; reconnect always reads durable history.' },
    ],
    scale: ['Begin with a single region, durable message table and WebSocket gateway.', 'Separate gateways from persistence so connection count does not dictate database scaling.', 'Introduce a broker partitioned by conversation or room.', 'Add sequence-based reconnect, idempotency and delivery receipts.', 'Shard large rooms and isolate hot conversations; define retention and compliance controls.'],
    tradeoffs: ['Exactly-once delivery across network boundaries is not a realistic end-to-end guarantee; design at-least-once plus idempotent processing.', 'A single ordered stream per room simplifies ordering but hot rooms can become partition bottlenecks.', 'Presence can be eventually consistent; message history cannot be treated as ephemeral presence state.'],
    cache: 35, dbCapacity: 950, queueCapacity: 1200, baseLatency: 35,
  },
];

const nodeColor = (kind?: NodeSpec['kind']) => kind === 'store' ? '#dbeafe' : kind === 'worker' ? '#dcfce7' : kind === 'edge' ? '#fef3c7' : '#ede9fe';

export function SystemArchitectureBlueprintLab() {
  const [selectedId, setSelectedId] = useState(blueprints[0].id);
  const [flowStep, setFlowStep] = useState(0);
  const [qps, setQps] = useState(1200);
  const [cacheHit, setCacheHit] = useState(blueprints[0].cache);
  const [dbReplicas, setDbReplicas] = useState(2);
  const [workers, setWorkers] = useState(4);
  const [dbDown, setDbDown] = useState(false);
  const [cacheDown, setCacheDown] = useState(false);
  const [brokerDown, setBrokerDown] = useState(false);

  const blueprint = blueprints.find(item => item.id === selectedId) ?? blueprints[0];
  const flow = blueprint.flow[flowStep] ?? blueprint.flow[0];
  const dbDemand = qps * (cacheDown ? 0 : (100 - cacheHit) / 100);
  const dbCapacity = dbReplicas * blueprint.dbCapacity;
  const queueDemand = qps * (blueprint.id === 'shortener' ? 0.12 : blueprint.id === 'feed' ? 0.85 : 0.65);
  const queueCapacity = workers * blueprint.queueCapacity;
  const dbUtil = dbDown ? 100 : Math.round(dbDemand / dbCapacity * 100);
  const queueUtil = brokerDown ? 100 : Math.round(queueDemand / queueCapacity * 100);
  const overloaded = dbDown || dbUtil > 85 || (!brokerDown && queueUtil > 90);
  const estimatedLatency = dbDown ? 3000 : blueprint.baseLatency + Math.max(0, dbUtil - 50) * 4 + (cacheDown ? 85 : 0) + (brokerDown ? 0 : Math.max(0, queueUtil - 65) * 1.8);
  const [expandedComponent, setExpandedComponent] = useState<string | null>(blueprint.components[0].name);

  const bottlenecks = useMemo(() => {
    const list: string[] = [];
    if (dbDown) list.push('Primary data store is unavailable: reads/writes need replica failover or a controlled degraded mode.');
    else if (dbUtil > 85) list.push('Database demand is near capacity: add read replicas, improve indexes, batch writes or reduce cache misses.');
    if (cacheDown) list.push('Cache is unavailable: protect the database with request coalescing, admission control and load shedding.');
    if (brokerDown) list.push('Broker is unavailable: durable writes may continue only if the outbox is retained and delivery is delayed.');
    else if (queueUtil > 90) list.push('Async consumers are falling behind: add workers, batch, throttle producers and inspect poison messages.');
    if (!list.length) list.push('No modeled bottleneck is above its warning threshold. Validate with production telemetry and failure drills.');
    return list;
  }, [dbDown, dbUtil, cacheDown, brokerDown, queueUtil]);

  const selectBlueprint = (id: string) => {
    const next = blueprints.find(item => item.id === id) ?? blueprints[0];
    setSelectedId(id); setFlowStep(0); setCacheHit(next.cache); setQps(1200);
    setDbReplicas(2); setWorkers(4); setDbDown(false); setCacheDown(false); setBrokerDown(false);
    setExpandedComponent(next.components[0].name);
  };

  const reset = () => { setQps(1200); setDbReplicas(2); setWorkers(4); setCacheHit(blueprint.cache); setDbDown(false); setCacheDown(false); setBrokerDown(false); };

  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-slate-950 p-5 text-white sm:p-7">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-sky-300"><Layers3 className="h-4 w-4" /> Production architecture field guide</div>
        <h3 className="mt-2 text-2xl font-bold">From requirements to failure-tested architecture</h3>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-300">Study a complete reference design, trace each request by hand, inspect component responsibilities and trade-offs, then change traffic and inject failures to see where the design bends.</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {blueprints.map(item => <button key={item.id} type="button" onClick={() => selectBlueprint(item.id)} className={`rounded-lg border px-3 py-2 text-xs font-semibold ${selectedId === item.id ? 'border-sky-400 bg-sky-500 text-slate-950' : 'border-white/15 bg-white/5 text-slate-200 hover:bg-white/10'}`}>{item.name}</button>)}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="text-[10px] font-bold uppercase tracking-wider text-sky-600">Hand-authored reference diagram · {blueprint.name}</div><h3 className="mt-1 text-lg font-bold">{blueprint.problem}</h3><p className="mt-2 max-w-4xl text-xs leading-relaxed text-slate-600 dark:text-slate-300">{blueprint.principle}</p></div><Workflow className="h-6 w-6 text-sky-500" /></div>
        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-[#fbfdff] p-2 dark:border-slate-700 dark:bg-slate-950">
          <svg viewBox="0 0 830 270" role="img" aria-label={`${blueprint.name} hand-authored system architecture diagram`} className="min-w-[760px] w-full">
            <defs><marker id="arch-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#64748b" /></marker></defs>
            {blueprint.edges.map(([from,to,label]) => {
              const a = blueprint.nodes.find(n => n.id === from)!; const b = blueprint.nodes.find(n => n.id === to)!;
              const x1 = a.x + 62, y1 = a.y + 25, x2 = b.x + 62, y2 = b.y + 25;
              const midX = (x1+x2)/2, midY = (y1+y2)/2 - (y1===y2?12:0);
              return <g key={`${from}-${to}`}><path d={`M ${x1} ${y1} L ${x2} ${y2}`} stroke="#64748b" strokeWidth="2" fill="none" markerEnd="url(#arch-arrow)" strokeDasharray={from==='fanout'?'5 4':'none'} /><text x={midX} y={midY} fontSize="10" textAnchor="middle" fill="#475569">{label}</text></g>;
            })}
            {blueprint.nodes.map(node => {
              const active = flow.active.includes(node.id);
              return <g key={node.id} opacity={active?1:0.72}><rect x={node.x} y={node.y} width="124" height="54" rx="10" fill={nodeColor(node.kind)} stroke={active?'#0284c7':'#94a3b8'} strokeWidth={active?3:1.3} /><text x={node.x+62} y={node.y+22} fontSize="12" fontWeight="700" textAnchor="middle" fill="#0f172a">{node.title}</text><text x={node.x+62} y={node.y+39} fontSize="9" textAnchor="middle" fill="#334155">{node.sub}</text>{active&&<circle cx={node.x+113} cy={node.y+9} r="4" fill="#0284c7" />}</g>;
            })}
            <text x="20" y="250" fontSize="10" fill="#64748b">Blue outline = active in current walkthrough · Dashed arrow = asynchronous / worker path</text>
          </svg>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><div><div className="text-xs font-bold">Request / event walkthrough · step {flowStep+1} of {blueprint.flow.length}</div><p className="mt-1 text-xs font-semibold text-sky-700 dark:text-sky-300">{flow.title}</p><p className="mt-1 max-w-3xl text-xs leading-relaxed text-slate-600 dark:text-slate-300">{flow.detail}</p></div><div className="flex gap-2"><button type="button" onClick={()=>setFlowStep(s=>(s-1+blueprint.flow.length)%blueprint.flow.length)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs dark:border-slate-700">Previous</button><button type="button" onClick={()=>setFlowStep(s=>(s+1)%blueprint.flow.length)} className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white dark:bg-sky-500 dark:text-slate-950">Next hop <ArrowRight className="h-3 w-3" /></button></div></div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-sky-600" /><h3 className="text-sm font-bold">Component deep dive</h3></div>
          <p className="mt-1 text-xs text-slate-500">Open each block to learn its contract, design decision and failure behaviour.</p>
          <div className="mt-3 space-y-2">{blueprint.components.map(item=><div key={item.name} className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700"><button type="button" onClick={()=>setExpandedComponent(expandedComponent===item.name?null:item.name)} className="flex w-full items-center justify-between gap-3 p-3 text-left text-xs font-semibold"><span>{item.name}</span><span className="text-sky-600">{expandedComponent===item.name?'−':'+'}</span></button>{expandedComponent===item.name&&<div className="grid gap-3 border-t border-slate-100 p-3 text-xs dark:border-slate-800 md:grid-cols-3"><div><b className="text-slate-800 dark:text-slate-100">Responsibility</b><p className="mt-1 leading-relaxed text-slate-600 dark:text-slate-300">{item.responsibility}</p></div><div><b className="text-slate-800 dark:text-slate-100">Design decision</b><p className="mt-1 leading-relaxed text-slate-600 dark:text-slate-300">{item.decision}</p></div><div><b className="text-slate-800 dark:text-slate-100">Failure behaviour</b><p className="mt-1 leading-relaxed text-slate-600 dark:text-slate-300">{item.failure}</p></div></div>}</div>)}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2"><Gauge className="h-4 w-4 text-sky-600" /><h3 className="text-sm font-bold">Stress-test simulator</h3></div>
          <p className="mt-1 text-xs text-slate-500">Illustrative capacity model for learning—not a benchmark or production capacity forecast.</p>
          <div className="mt-4 space-y-4 text-xs">
            <div><div className="flex justify-between"><label htmlFor="arch-qps">Incoming requests / events per second</label><b>{qps.toLocaleString()} / sec</b></div><input id="arch-qps" type="range" min="100" max="10000" step="100" value={qps} onChange={e=>setQps(Number(e.target.value))} className="mt-2 w-full accent-sky-600" /></div>
            <div><div className="flex justify-between"><label htmlFor="arch-cache">Cache hit ratio</label><b>{cacheHit}%</b></div><input id="arch-cache" type="range" min="0" max="99" value={cacheHit} onChange={e=>setCacheHit(Number(e.target.value))} className="mt-2 w-full accent-sky-600" /></div>
            <div><div className="flex justify-between"><label htmlFor="arch-db">Database replicas</label><b>{dbReplicas}</b></div><input id="arch-db" type="range" min="1" max="12" value={dbReplicas} onChange={e=>setDbReplicas(Number(e.target.value))} className="mt-2 w-full accent-sky-600" /></div>
            <div><div className="flex justify-between"><label htmlFor="arch-workers">Async workers</label><b>{workers}</b></div><input id="arch-workers" type="range" min="1" max="20" value={workers} onChange={e=>setWorkers(Number(e.target.value))} className="mt-2 w-full accent-sky-600" /></div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2"><div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800"><div className="text-[10px] text-slate-500">DB demand / capacity</div><div className="mt-1 text-lg font-bold tabular-nums">{dbDemand.toFixed(0)} / {dbCapacity.toLocaleString()}</div><div className="mt-1 h-1.5 rounded bg-slate-200 dark:bg-slate-700"><div className="h-full rounded bg-sky-500" style={{width:`${Math.min(100,dbUtil)}%`}} /></div><div className="mt-1 text-[10px] text-slate-500">{dbUtil}% utilisation</div></div><div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800"><div className="text-[10px] text-slate-500">Queue demand / capacity</div><div className="mt-1 text-lg font-bold tabular-nums">{queueDemand.toFixed(0)} / {queueCapacity.toLocaleString()}</div><div className="mt-1 h-1.5 rounded bg-slate-200 dark:bg-slate-700"><div className="h-full rounded bg-emerald-500" style={{width:`${Math.min(100,queueUtil)}%`}} /></div><div className="mt-1 text-[10px] text-slate-500">{queueUtil}% utilisation</div></div></div>
          <div className="mt-3 space-y-2"><div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Inject failures</div><div className="grid grid-cols-3 gap-2">{[{label:'DB down',value:dbDown,set:setDbDown},{label:'Cache down',value:cacheDown,set:setCacheDown},{label:'Broker down',value:brokerDown,set:setBrokerDown}].map(f=><button key={f.label} type="button" onClick={()=>f.set(!f.value)} className={`rounded-lg border px-2 py-2 text-[10px] font-semibold ${f.value?'border-rose-400 bg-rose-50 text-rose-800 dark:bg-rose-950/30 dark:text-rose-300':'border-slate-200 dark:border-slate-700'}`}>{f.value?'● ':'○ '}{f.label}</button>)}</div></div>
          <div className={`mt-3 rounded-xl border p-3 ${overloaded?'border-rose-300 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/30':'border-emerald-300 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30'}`}><div className="flex items-center justify-between gap-2"><b className="text-xs">{overloaded?'Capacity / resilience warning':'Within modeled thresholds'}</b><span className="text-[10px] font-mono">Illustrative p95 ≈ {Math.round(estimatedLatency)} ms</span></div><ul className="mt-2 space-y-1 text-[11px] leading-relaxed">{bottlenecks.map(item=><li key={item}>• {item}</li>)}</ul></div>
          <button type="button" onClick={reset} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-sky-600"><RotateCcw className="h-3 w-3" /> Reset simulation</button>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><h3 className="flex items-center gap-2 text-sm font-bold"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Scale-up roadmap</h3><ol className="mt-3 space-y-3">{blueprint.scale.map((item,index)=><li key={item} className="flex gap-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-[10px] font-bold text-sky-800 dark:bg-sky-950 dark:text-sky-200">{index+1}</span>{item}</li>)}</ol></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><h3 className="flex items-center gap-2 text-sm font-bold"><AlertTriangle className="h-4 w-4 text-amber-600" /> Trade-offs to defend in an interview</h3><ul className="mt-3 space-y-3">{blueprint.tradeoffs.map(item=><li key={item} className="border-l-2 border-amber-400 pl-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{item}</li>)}</ul></div>
      </section>
      <p className="flex items-start gap-2 text-[11px] leading-relaxed text-slate-500"><Activity className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Simulator capacity values and latency formula are deliberately simplified teaching assumptions. Real systems require load tests, production traces, queue-age monitoring, database query plans, tail-latency analysis and failure-injection drills.</p>
    </div>
  );
}
