import { QueryNotice } from "../../components/QueryNotice";
import { useMemo, useState } from "react";
import {
  TaskTable,
  VisitListSkeleton,
  Button,
  PageHeader,
  VisitFilters,
  EmptyState,
} from "../../components";
import { useTaskList } from "../../hooks";
import { SearchIcon } from "../../components/Icons";
import type { Task, TaskStatus } from "../../types";

type VisitTab = "active" | "past";
type StatusFilter = "all" | TaskStatus;

const TABS: { id: VisitTab; label: string }[] = [
  { id: "active", label: "Active" },
  { id: "past", label: "Past" },
];

const ACTIVE_ORDER: Record<TaskStatus, number> = {
  IN_PROGRESS: 0,
  ACCEPTED: 1,
  SUBMITTED: 2,
  OPEN: 3,
  COMPLETED: 4,
  CANCELLED: 5,
};

const ACTIVE_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "All active" },
  { id: "ACCEPTED", label: "To start" },
  { id: "IN_PROGRESS", label: "On the way" },
  { id: "SUBMITTED", label: "Waiting on requester" },
];

export function AcceptedTasksPage() {
  const { data: tasks, isLoading, isError, refetch, isFetching } = useTaskList("accepted");
  const [chosenTab, setChosenTab] = useState<VisitTab | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const allTasks = tasks || [];
  const activeTasks = allTasks
    .filter((task) =>
      ["ACCEPTED", "IN_PROGRESS", "SUBMITTED"].includes(task.status)
    )
    .sort((a, b) => ACTIVE_ORDER[a.status] - ACTIVE_ORDER[b.status]);
  const pastTasks = allTasks
    .filter((task) => task.status === "COMPLETED" || task.status === "CANCELLED")
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  const counts: Record<VisitTab, number> = {
    active: activeTasks.length,
    past: pastTasks.length,
  };
  const tab: VisitTab =
    chosenTab ?? (activeTasks.length === 0 && pastTasks.length > 0 ? "past" : "active");
  const baseTasks: Task[] = tab === "active" ? activeTasks : pastTasks;

  const filterOptions = ACTIVE_FILTERS.map((option) => ({
    ...option,
    count:
      option.id === "all"
        ? activeTasks.length
        : activeTasks.filter((task) => task.status === option.id).length,
  })).filter((option) => option.id === "all" || option.count > 0);

  const visibleTasks = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return baseTasks.filter((task) => {
      if (tab === "active" && statusFilter !== "all" && task.status !== statusFilter) {
        return false;
      }
      if (!needle) return true;
      return (
        task.title.toLowerCase().includes(needle) ||
        task.description.toLowerCase().includes(needle) ||
        task.createdBy.name.toLowerCase().includes(needle)
      );
    });
  }, [baseTasks, query, statusFilter, tab]);

  if (isLoading) return <VisitListSkeleton />;
  if (isError && !tasks) return <QueryNotice retry={() => void refetch()} busy={isFetching} />;

  const hasFilters = query.trim().length > 0 || (tab === "active" && statusFilter !== "all");
  const onTheWay = activeTasks.filter((task) => task.status === "IN_PROGRESS").length;

  const changeTab = (next: VisitTab) => {
    setChosenTab(next);
    setStatusFilter("all");
  };

  return (
    <div className="mx-auto max-w-4xl">
      {isError && <QueryNotice retry={() => void refetch()} busy={isFetching} stale />}
      <PageHeader
        title="My visits"
        description={
          onTheWay > 0
            ? `${onTheWay} visit${onTheWay === 1 ? " is" : "s are"} on the way.`
            : undefined
        }
        actions={
          <Button
            to="/captain/dashboard"
            variant="accent"
            className="max-sm:hidden min-h-11 flex-shrink-0 px-4"
          >
            <SearchIcon size={15} />
            Find work
          </Button>
        }
      />

      <div
        role="tablist"
        aria-label="Visit history"
        className="mt-5 grid grid-cols-2 gap-1.5 rounded-2xl border border-surface-200 bg-white p-1.5 shadow-sm"
      >
        {TABS.map((item, index) => {
          const selected = tab === item.id;
          return (
            <button
              key={item.id}
              id={`captain-visits-tab-${item.id}`}
              type="button"
              role="tab"
              tabIndex={selected ? 0 : -1}
              onKeyDown={(event) => {
                if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
                event.preventDefault();
                const next = event.key === "Home" ? 0 : event.key === "End" ? TABS.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + TABS.length) % TABS.length;
                changeTab(TABS[next].id);
                document.getElementById(`captain-visits-tab-${TABS[next].id}`)?.focus();
              }}
              aria-selected={selected}
              aria-controls="captain-visits-panel"
              onClick={() => changeTab(item.id)}
              className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-[14px] font-bold transition-colors ${
                selected
                  ? "bg-primary-800 text-white"
                  : "text-surface-600 hover:bg-surface-50 hover:text-surface-950"
              }`}
            >
              {item.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[13px] font-extrabold tabular-nums ${
                  selected
                    ? "bg-white/15 text-white"
                    : "bg-surface-100 text-surface-500"
                }`}
              >
                {counts[item.id]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-3">
        <VisitFilters
          query={query}
          onQueryChange={setQuery}
          placeholder="Search visits"
          filters={tab === "active" ? filterOptions : []}
          activeFilter={statusFilter}
          onFilterChange={(id) => setStatusFilter(id as StatusFilter)}
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 text-[13px] font-medium text-surface-500">
        <p>
          {visibleTasks.length} of {baseTasks.length} visit{baseTasks.length === 1 ? "" : "s"}
          {hasFilters ? " match" : ""}
        </p>
        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setStatusFilter("all");
            }}
            className="inline-flex min-h-9 items-center font-bold text-primary-700 hover:text-primary-900"
          >
            Clear filters
          </button>
        )}
      </div>

      <div
        id="captain-visits-panel"
        role="tabpanel"
        aria-labelledby={`captain-visits-tab-${tab}`}
        className="mt-3"
      >
        {visibleTasks.length === 0 && hasFilters ? (
          <EmptyState
            icon={SearchIcon}
            title="No visits match these filters"
            description="Try a different search, or clear the filters to see every visit."
            compact
          >
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setQuery("");
                setStatusFilter("all");
              }}
            >
              Clear filters
            </Button>
          </EmptyState>
        ) : (
          <TaskTable
            tasks={visibleTasks}
            basePath="/captain/tasks"
            showCreatedBy
            emptyMessage={tab === "active" ? "No active visits" : "No past visits yet"}
            emptyDescription={
              tab === "active"
                ? "Accept a request from Find work to start a visit."
                : "Completed visits will appear here with their proof."
            }
            emptyAction={
              tab === "active"
                ? { label: "Find available work", to: "/captain/dashboard" }
                : undefined
            }
          />
        )}
      </div>
    </div>
  );
}
