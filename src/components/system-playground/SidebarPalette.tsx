import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, GripVertical, Plus, Search, X } from 'lucide-react';
import { CATEGORY_META, CATEGORY_ORDER } from '../../data/componentCatalog';
import { useAsyncCatalog } from '../../hooks/useAsyncCatalog';
import type { ComponentCategory, ComponentType } from '../../types/system';
import { getComponentIcon } from './iconMap';

interface SidebarPaletteProps {
  onQuickAdd: (type: ComponentType) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const SidebarPalette: React.FC<SidebarPaletteProps> = ({
  onQuickAdd,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { data: componentCatalog } = useAsyncCatalog('system-design-components');
  const [query, setQuery] = useState('');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const groups: { category: ComponentCategory; items: typeof componentCatalog }[] = [];
    for (const cat of CATEGORY_ORDER) {
      const items = componentCatalog.filter((item) => {
        if (item.category !== cat) return false;
        if (!q) return true;
        return (
          item.name.toLowerCase().includes(q) ||
          item.shortSubtitle.toLowerCase().includes(q) ||
          item.type.toLowerCase().includes(q) ||
          CATEGORY_META[cat].label.toLowerCase().includes(q)
        );
      });
      if (items.length > 0) {
        groups.push({ category: cat, items });
      }
    }
    return groups;
  }, [query, componentCatalog]);

  const handleDragStart = (event: React.DragEvent, type: ComponentType) => {
    event.dataTransfer.setData('application/systemforge-component', type);
    event.dataTransfer.effectAllowed = 'move';
  };

  const toggleCat = (cat: ComponentCategory) => {
    setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  return (
    <aside
      aria-label="System Component Palette"
      className={`${
        isOpenMobile ? 'fixed inset-y-0 left-0 z-40 flex' : 'hidden lg:flex'
      } w-64 xl:w-72 shrink-0 flex-col bg-slate-900 border-r border-slate-800 text-slate-100 h-full`}
    >
      <div className="p-3 border-b border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-semibold text-slate-100">Component Palette</h3>
            <p className="text-[11px] text-slate-400">Drag onto canvas or click +</p>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close component palette"
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="relative">
          <Search
            className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Redis, Kafka, LB..."
            aria-label="Search components"
            className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
        {grouped.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No matching components for &ldquo;{query}&rdquo;
          </div>
        ) : (
          grouped.map(({ category, items }) => {
            const meta = CATEGORY_META[category];
            const isCollapsed = Boolean(collapsed[category]) && !query.trim();
            return (
              <div key={category} className="space-y-1">
                <button
                  type="button"
                  onClick={() => toggleCat(category)}
                  className="w-full flex items-center justify-between px-2 py-1.5 rounded-md text-[11px] font-semibold text-slate-300 hover:bg-slate-800/70 transition-colors"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    {isCollapsed ? (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    )}
                    <span className={meta.textAccentClass}>{meta.label}</span>
                  </span>
                  <span className="font-mono tabular-nums text-[10px] text-slate-500">
                    {items.length}
                  </span>
                </button>

                {!isCollapsed && (
                  <div className="space-y-1 pl-1">
                    {items.map((item) => {
                      const Icon = getComponentIcon(item.iconName);
                      return (
                        <div
                          key={item.type}
                          draggable
                          onDragStart={(e) => handleDragStart(e, item.type)}
                          className="group flex items-center justify-between gap-2 px-2 py-2 rounded-lg border border-slate-800/90 bg-slate-950/60 hover:border-slate-600 hover:bg-slate-800/70 cursor-grab active:cursor-grabbing transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <GripVertical
                              className="w-3 h-3 text-slate-600 group-hover:text-slate-400 shrink-0"
                              aria-hidden="true"
                            />
                            <div
                              className={`w-7 h-7 rounded-md border flex items-center justify-center shrink-0 ${meta.headerBgClass}`}
                            >
                              <Icon className={`w-3.5 h-3.5 ${meta.textAccentClass}`} aria-hidden="true" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-medium text-slate-100 truncate leading-tight">
                                {item.name}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate mt-0.5">
                                {item.shortSubtitle}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              onQuickAdd(item.type);
                              onCloseMobile();
                            }}
                            title={`Add ${item.name} to canvas`}
                            aria-label={`Add ${item.name}`}
                            className="p-1 rounded-md text-slate-400 hover:text-sky-300 hover:bg-slate-700/80 transition-colors shrink-0"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
