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
import { AlertTriangleIcon, PlusIcon, SearchIcon } from "../../components/Icons";
import { isActiveStatus, sortForRequester } from "../../utils/task";
import type { TaskStatus } from "../../types";

type VisitTab = "active" | "past";
type StatusFilter = "all" | TaskStatus;

const TABS: { id: VisitTab; label: string }[] = [
  { id: "active", label: "Active" },
  { id: "past", label: "Past" },
];

const ACTIVE_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "All active" },
  { id: "OPEN", label: "Waiting" },
  { id: "ACCEPTED", label: "Assigned" },
  { id: "IN_PROGRESS", label: "On the way" },
  { id: "SUBMITTED", label: "Proof ready" },
];

export function UserVisitsPage() {
  const { data: tasks, isLoading, isError, refetch } = useTaskList();
  const [chosenTab, setChosenTab] = useState<VisitTab | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const allTasks = tasks || [];
  const activeTasks = sortForRequester(
    allTasks.filter((task) => isActiveStatus(task.status))
  );
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
  const baseTasks = tab === "active" ? activeTasks : pastTasks;

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
        (task.acceptedBy?.name ?? "").toLowerCase().includes(needle)
      );
    });
  }, [baseTasks, query, statusFilter, tab]);

  if (isLoading) return <VisitListSkeleton />;

  if (isError && !tasks) return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="My visits" description="Track your visits and review proof in one place." />
      <div className="mt-5">
        <EmptyState icon={AlertTriangleIcon} title="Couldn’t load your visits" description="Check your connection and try again. Your existing visits have not been removed.">
          <Button type="button" onClick={() => void refetch()}>Try again</Button>
        </EmptyState>
      </div>
    </div>
  );

  const hasFilters = query.trim().length > 0 || (tab === "active" && statusFilter !== "all");
  const needsAction = activeTasks.filter((task) => task.status === "SUBMITTED").length;

  const changeTab = (next: VisitTab) => {
    setChosenTab(next);
    setStatusFilter("all");
  };

  return (
    <div className="mx-auto max-w-4xl">
      {isError && tasks && <QueryNotice retry={() => void refetch()} stale />}
      <PageHeader
        title="My visits"
        description={
          needsAction > 0
            ? `${needsAction} proof${needsAction === 1 ? " is" : "s are"} ready to review.`
            : undefined
        }
        actions={
          <Button
            to="/user/create-task"
            variant="accent"
            size="sm"
            className="max-sm:hidden min-h-11 flex-shrink-0 px-3.5"
          >
            <PlusIcon size={15} />
            Book a visit
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
              id={`user-visits-tab-${item.id}`}
              type="button"
              role="tab"
              tabIndex={selected ? 0 : -1}
              onKeyDown={(event) => {
                if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
                event.preventDefault();
                const next = event.key === "Home" ? 0 : event.key === "End" ? TABS.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + TABS.length) % TABS.length;
                changeTab(TABS[next].id);
                document.getElementById(`user-visits-tab-${TABS[next].id}`)?.focus();
              }}
              aria-selected={selected}
              aria-controls="user-visits-panel"
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
        id="user-visits-panel"
        role="tabpanel"
        aria-labelledby={`user-visits-tab-${tab}`}
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
            basePath="/user/tasks"
            showAcceptedBy
            emptyMessage={tab === "active" ? "No active visits" : "No past visits yet"}
            emptyDescription={
              tab === "active"
                ? "Book a property visit and follow its progress here."
                : "Completed visits and their proof will appear here."
            }
            emptyAction={
              tab === "active"
                ? { label: "Book a visit", to: "/user/create-task" }
                : undefined
            }
          />
        )}
      </div>
    </div>
  );
}
