import { cn } from "@/lib/utils";
import { Flame, TrendingDown, Sparkles, Coffee, Zap } from "lucide-react";

export type ClanFilter = 
  | 'all' 
  | 'most-active' 
  | 'lowest-screen-time' 
  | 'new' 
  | 'casual' 
  | 'competitive';

interface ClanFiltersProps {
  activeFilter: ClanFilter;
  onFilterChange: (filter: ClanFilter) => void;
}

const filters: { id: ClanFilter; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'All', icon: null },
  { id: 'most-active', label: 'Most Active', icon: <Flame className="w-3.5 h-3.5" /> },
  { id: 'lowest-screen-time', label: 'Top Reducers', icon: <TrendingDown className="w-3.5 h-3.5" /> },
  { id: 'new', label: 'New', icon: <Sparkles className="w-3.5 h-3.5" /> },
  { id: 'casual', label: 'Casual', icon: <Coffee className="w-3.5 h-3.5" /> },
  { id: 'competitive', label: 'Competitive', icon: <Zap className="w-3.5 h-3.5" /> },
];

export function ClanFilters({ activeFilter, onFilterChange }: ClanFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
            "border hover:scale-105 active:scale-95",
            activeFilter === filter.id
              ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25"
              : "bg-card/50 text-muted-foreground border-border/50 hover:bg-card hover:text-foreground hover:border-border"
          )}
        >
          {filter.icon}
          {filter.label}
        </button>
      ))}
    </div>
  );
}
