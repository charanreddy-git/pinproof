import { SearchIcon, XIcon } from "./Icons";

export interface VisitFilterOption {
  id: string;
  label: string;
  count: number;
}

interface VisitFiltersProps {
  query: string;
  onQueryChange: (value: string) => void;
  placeholder?: string;
  filters?: VisitFilterOption[];
  activeFilter?: string;
  onFilterChange?: (id: string) => void;
  label?: string;
}

/** Search + horizontally scrollable status chips shared by both visit lists. */
export function VisitFilters({
  query,
  onQueryChange,
  placeholder = "Search visits",
  filters = [],
  activeFilter,
  onFilterChange,
  label = "Filter visits",
}: VisitFiltersProps) {
  return (
    <div className="space-y-2.5">
      <div className="relative">
        <SearchIcon
          size={16}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="h-12 w-full rounded-xl border border-surface-300 bg-white pl-10 pr-12 text-base text-surface-900 placeholder:text-surface-400 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
        />
        {query && (
          <button
            type="button"
            onClick={() => onQueryChange("")}
            className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-700"
            aria-label="Clear search"
          >
            <XIcon size={14} />
          </button>
        )}
      </div>

      {filters.length > 0 && onFilterChange && (
        <div
          className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5"
          role="group"
          aria-label={label}
        >
          {filters.map((option) => {
            const selected = activeFilter === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onFilterChange(option.id)}
                aria-pressed={selected}
                className={`inline-flex min-h-11 flex-shrink-0 items-center gap-1.5 rounded-lg border px-3 text-[13px] font-semibold transition-colors ${
                  selected
                    ? "border-primary-800 bg-primary-800 text-white"
                    : "border-surface-200 bg-white text-surface-600 hover:border-primary-300 hover:text-primary-800"
                }`}
              >
                {option.label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[13px] font-extrabold tabular-nums ${
                    selected
                      ? "bg-white/15 text-white"
                      : "bg-surface-100 text-surface-500"
                  }`}
                >
                  {option.count}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
