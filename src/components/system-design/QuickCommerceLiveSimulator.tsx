import { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  CloudRain,
  MapPin,
  PackageCheck,
  RotateCcw,
  ShieldCheck,
  Truck,
  Zap,
} from 'lucide-react';

type TrafficCondition = 'normal' | 'surge-rain';

interface StoreSku {
  skuId: number;
  name: string;
  bin: string;
  zone: 'Ambient' | 'Chilled' | 'Frozen';
  qty: number;
}

const INITIAL_SKUS: StoreSku[] = [
  { skuId: 1001, name: 'Farm Fresh Milk 1L', bin: 'C-02', zone: 'Chilled', qty: 1 },
  { skuId: 2045, name: 'Hass Avocado (1 pc)', bin: 'A-04', zone: 'Ambient', qty: 1 },
  { skuId: 3088, name: 'Artisan Vanilla Tub', bin: 'F-01', zone: 'Frozen', qty: 5 },
  { skuId: 4012, name: 'Sourdough Bread', bin: 'A-01', zone: 'Ambient', qty: 8 },
];

export function QuickCommerceLiveSimulator() {
  const [condition, setCondition] = useState<TrafficCondition>('normal');
  const [skus, setSkus] = useState<StoreSku[]>(INITIAL_SKUS);
  const [activeStore, setActiveStore] = useState<string>('Store #14 (1.6 km · Primary)');
  const [pickProgress, setPickProgress] = useState<number>(0); // 0..3 (Ambient -> Chilled -> Frozen)
  const [riderAssigned, setRiderAssigned] = useState<boolean>(false);
  const [clubbedOrders, setClubbedOrders] = useState<number>(1);
  const [events, setEvents] = useState<string[]>([
    'H3 Resolution-9 mapped user GPS -> Dark Store #14 (1.6 km). Picker queue healthy (4 active orders). Promised ETA: 8m 40s.',
  ]);

  const logEvent = (msg: string) => setEvents((prev) => [msg, ...prev.slice(0, 5)]);

  const handleToggleCondition = (next: TrafficCondition) => {
    setCondition(next);
    if (next === 'surge-rain') {
      setActiveStore('Store #15 (2.1 km · Auto-Failover!)');
      logEvent(
        '[MONSOON + IPL SURGE] Store #14 picker queue hit 165 orders! H3 Serviceability Router auto-failed over to adjacent Store #15 + added +4 min rain ETA padding.'
      );
    } else {
      setActiveStore('Store #14 (1.6 km · Primary)');
      logEvent(
        '[NORMAL EVENING] Traffic normalized. H3 Router restored Store #14 (1.6 km) with 8m 40s doorstep SLA.'
      );
    }
  };

  const handleLastUnitRace = () => {
    const milk = skus.find((s) => s.skuId === 1001);
    if (!milk || milk.qty <= 0) {
      logEvent(
        '[CHECKOUT GUARD] 0 units left for Farm Fresh Milk 1L! Atomic check `available_qty >= 1` blocked oversell cleanly -> showing "Notify Me / Substitute" in <8ms.'
      );
      return;
    }
    setSkus((prev) =>
      prev.map((s) => (s.skuId === 1001 ? { ...s, qty: Math.max(0, s.qty - 1) } : s))
    );
    logEvent(
      '[2-NEIGHBOR RACE RESOLVED] Order A won single-shard ACID lock (`available_qty 1 -> 0`) and enqueued WMS Pick Task via Outbox. Order B matched 0 rows 1ms later -> zero oversell!'
    );
  };

  const handlePickerStep = () => {
    const next = pickProgress >= 3 ? 3 : pickProgress + 1;
    setPickProgress(next);
    if (next === 1) {
      logEvent(
        '[PICKER WMS · T+24s] Zone 1 (Ambient): Scanned Sourdough Bread (Bin A-01) & Avocado (Bin A-04) via handheld barcode.'
      );
    } else if (next === 2) {
      logEvent(
        '[PICKER WMS · T+56s] Zone 2 (Chilled): Scanned Farm Fresh Milk (Bin C-02). JIT Dispatcher pre-pinged nearest rider 30s early!'
      );
    } else {
      logEvent(
        '[PICKER WMS · T+82s] Zone 3 (Frozen LAST!): Scanned Vanilla Tub (Bin F-01) so ice cream never melts! Bag sealed & moved to Handover Pigeonhole #7 (<90s SLA met!).'
      );
    }
  };

  const handlePhysicalDrift = () => {
    setSkus((prev) => prev.map((s) => (s.skuId === 2045 ? { ...s, qty: 0 } : s)));
    logEvent(
      '[PHYSICAL SHELF MISMATCH] Picker flagged Bin A-04 Avocado as bruised! DB instantly zeroed `available_qty = 0` (stops ghost orders), issued automatic idempotent partial refund ($2.40), and kept remaining 3 items on 9-min delivery!'
    );
  };

  const handleJitDispatch = () => {
    setRiderAssigned(true);
    setClubbedOrders(2);
    logEvent(
      '[JIT RIDER DISPATCH + CLUBBING] Rider #884 arrived at Store Gate at T+85s (3s wait!), picked up 2 same-bearing orders (cutting delivery cost 35%), and opened live WebSocket GPS stream!'
    );
  };

  const handleReset = () => {
    setCondition('normal');
    setSkus(INITIAL_SKUS);
    setActiveStore('Store #14 (1.6 km · Primary)');
    setPickProgress(0);
    setRiderAssigned(false);
    setClubbedOrders(1);
    setEvents([
      'Reset Dark Store #14 simulator. All shelf counts restored & 10-minute delivery clock ready.',
    ]);
  };

  const checkoutSec = 10;
  const pickSec = condition === 'normal' ? 82 : 145;
  const handoverSec = riderAssigned ? 22 : 45;
  const rideSec = condition === 'normal' ? 380 : 540;
  const totalSec = checkoutSec + pickSec + handoverSec + rideSec;
  const totalMinStr = `${Math.floor(totalSec / 60)}m ${String(totalSec % 60).padStart(2, '0')}s`;

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            Interactive 10-Minute Dark-Store &amp; SLA Simulator (Zepto / Blinkit / Instamart)
          </p>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
            Test Atomic Last-Unit Lock, 90s Zone Picking, Shelf Drift Recovery &amp; Monsoon Failover
          </h4>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => handleToggleCondition('normal')}
            className={`px-2.5 py-1.5 rounded-lg border font-medium ${
              condition === 'normal'
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-semibold'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            Normal Evening
          </button>
          <button
            type="button"
            onClick={() => handleToggleCondition('surge-rain')}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border font-medium ${
              condition === 'surge-rain'
                ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 font-semibold'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            IPL + Monsoon Surge
          </button>
          <button
            type="button"
            onClick={handleReset}
            aria-label="Reset quick-commerce simulator"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Live 10-Minute SLA Breakdown Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 font-mono tabular-nums text-xs">
        <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
          <div className="text-[9.5px] text-slate-500 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-sky-600" /> SERVING STORE
          </div>
          <div className="text-[11px] font-semibold text-slate-900 dark:text-slate-100 mt-0.5 truncate">
            {activeStore}
          </div>
        </div>
        <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
          <div className="text-[9.5px] text-slate-500">1. PICK &amp; PACK</div>
          <div className="font-semibold text-sky-700 dark:text-sky-400 mt-0.5">{pickSec}s</div>
        </div>
        <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
          <div className="text-[9.5px] text-slate-500">2. GATE HANDOVER</div>
          <div className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
            {handoverSec}s
          </div>
        </div>
        <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
          <div className="text-[9.5px] text-slate-500">3. ROAD RIDE (1.8km)</div>
          <div className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
            {Math.floor(rideSec / 60)}m {rideSec % 60}s
          </div>
        </div>
        <div className="p-2.5 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30">
          <div className="text-[9.5px] text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
            <Clock className="w-3 h-3" /> PROMISED ETA
          </div>
          <div className="font-bold text-emerald-800 dark:text-emerald-300 mt-0.5">
            {totalMinStr} {riderAssigned ? `(Clubbed x${clubbedOrders})` : ''}
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleLastUnitRace}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40 text-xs font-semibold text-sky-800 dark:text-sky-300"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          1. Simulate 2-Neighbor Last-Milk Race
        </button>
        <button
          type="button"
          onClick={handlePickerStep}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-xs font-semibold text-emerald-800 dark:text-emerald-300"
        >
          <PackageCheck className="w-3.5 h-3.5" />
          2. Advance 90s Picker Route ({pickProgress}/3 Zones)
        </button>
        <button
          type="button"
          onClick={handlePhysicalDrift}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-xs font-semibold text-amber-900 dark:text-amber-300"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Inject Bruised Bin (Auto Partial Refund)
        </button>
        <button
          type="button"
          onClick={handleJitDispatch}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-semibold hover:bg-sky-700"
        >
          <Truck className="w-3.5 h-3.5" />
          3. JIT Rider Dispatch + Club Orders
        </button>
      </div>

      {/* Live Store Shelf Grid + Event Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
          <div className="px-3.5 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[11px] font-mono text-slate-600 dark:text-slate-400">
            Dark Store Shard: `dark_store_inventory` (S-Shape Zone Order)
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-800 text-xs font-mono">
            {skus.map((sku) => {
              const picked =
                (sku.zone === 'Ambient' && pickProgress >= 1) ||
                (sku.zone === 'Chilled' && pickProgress >= 2) ||
                (sku.zone === 'Frozen' && pickProgress >= 3);
              return (
                <div
                  key={sku.skuId}
                  className="px-3.5 py-2 flex items-center justify-between gap-2 bg-slate-50/30 dark:bg-slate-950/30"
                >
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {sku.name}
                    </span>
                    <span className="text-[10px] text-slate-500 ml-2">
                      Bin {sku.bin} · {sku.zone}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 tabular-nums">
                    <span
                      className={`font-semibold ${
                        sku.qty === 0
                          ? 'text-rose-700 dark:text-rose-400'
                          : 'text-emerald-700 dark:text-emerald-400'
                      }`}
                    >
                      qty={sku.qty}
                    </span>
                    {picked && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
          <div className="px-3.5 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[11px] font-mono text-slate-600 dark:text-slate-400">
            Live Quick-Commerce Event Stream (Outbox + WMS + Dispatch)
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
            {events.map((ev, i) => (
              <div
                key={i}
                className="px-3.5 py-2 text-slate-700 dark:text-slate-300 bg-slate-50/30 dark:bg-slate-950/30 leading-relaxed"
              >
                {ev}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
