import {
  Activity,
  ArrowLeftRight,
  Boxes,
  BrainCircuit,
  Cloud,
  Cog,
  Cpu,
  Database,
  FileJson,
  GitFork,
  Globe,
  HardDrive,
  KeyRound,
  Landmark,
  Layers,
  LayoutGrid,
  Network,
  Radio,
  Scale,
  ScrollText,
  Search,
  Server,
  Share2,
  Shield,
  ShieldAlert,
  Sparkles,
  Table2,
  Users,
  Waypoints,
  Zap,
  type LucideIcon,
} from 'lucide-react';

export const COMPONENT_ICON_MAP: Record<string, LucideIcon> = {
  Activity,
  ArrowLeftRight,
  Boxes,
  BrainCircuit,
  Cloud,
  Cog,
  Cpu,
  Database,
  FileJson,
  GitFork,
  Globe,
  HardDrive,
  KeyRound,
  Landmark,
  Layers,
  LayoutGrid,
  Network,
  Radio,
  Scale,
  ScrollText,
  Search,
  Server,
  Share2,
  Shield,
  ShieldAlert,
  Sparkles,
  Table2,
  Users,
  Waypoints,
  Zap,
};

export function getComponentIcon(name: string): LucideIcon {
  return COMPONENT_ICON_MAP[name] ?? Server;
}

export function formatRps(rps: number): string {
  if (!Number.isFinite(rps) || rps <= 0) return '0';
  if (rps >= 1_000_000) return `${(rps / 1_000_000).toFixed(2)}M`;
  if (rps >= 10_000) return `${(rps / 1_000).toFixed(1)}k`;
  if (rps >= 1_000) return `${(rps / 1_000).toFixed(2)}k`;
  return String(Math.round(rps));
}
