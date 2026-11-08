import { QueryNotice } from "../../components/QueryNotice";
import { Link } from "react-router-dom";
import {
  DashboardSkeleton,
  Button,
  PageHeader,
  EmptyState,
} from "../../components";
import { useAuth } from "../../contexts";
import { useTaskList } from "../../hooks";
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  PlusIcon,
} from "../../components/Icons";
import { REQUESTER_SERVICES } from "../../content/marketing";
import { VISIT_PLANS, visitPriceLabel } from "../../content/visitPlans";
import { isActiveStatus, sortForRequester } from "../../utils/task";
import { formatRelativeTime, greeting } from "../../utils/time";
import type { Task, TaskStatus } from "../../types";

const STATUS_LABEL: Record<TaskStatus, string> = {
  OPEN: "Finding inspector",
  ACCEPTED: "Assigned",
  IN_PROGRESS: "On the way",
  SUBMITTED: "Proof ready",
  COMPLETED: "Completed",
};

function activeCopy(task: Task): { note: string; cta: string; to: string } {
  const inspector = task.acceptedBy?.name;

  if (task.status === "SUBMITTED") {
    return {
      note: "Photo and GPS are ready.",
      cta: "Review proof",
      to: `/user/tasks/${task.id}#evidence`,
    };
  }

  if (task.status === "IN_PROGRESS") {
    return {
      note: `${inspector ?? "Your inspector"} is on the way.`,
      cta: "Track live",
      to: `/user/track/${task.id}`,
    };
  }

  if (task.status === "ACCEPTED") {
    return {
      note: `${inspector ?? "Your inspector"} is assigned.`,
      cta: "View visit",
      to: `/user/tasks/${task.id}`,
    };
  }

  return {
    note: "Finding a nearby inspector.",
    cta: "View request",
    to: `/user/tasks/${task.id}`,
  };
}

function ActiveVisitCard({ task }: { task: Task }) {
  const copy = activeCopy(task);
  const price = visitPriceLabel(task.visitPlan, task.quotedPricePaise);

  return (
    <section className="rounded-3xl bg-primary-950 p-4 text-white shadow-elevated sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11.5px] font-bold">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              task.status === "SUBMITTED" ? "bg-success-400" : "bg-accent-400"
            } ${task.status === "OPEN" || task.status === "IN_PROGRESS" ? "animate-pulse-soft motion-reduce:animate-none" : ""}`}
            aria-hidden="true"
          />
          {STATUS_LABEL[task.status]}
        </span>
        {price && (
          <span className="rounded-full bg-accent-400 px-2.5 py-1 text-[11.5px] font-extrabold tabular-nums text-primary-950">
            {price} quote
          </span>
        )}
      </div>

      <h2 className="mt-3 line-clamp-2 text-[1.25rem] font-extrabold leading-tight tracking-[-0.02em] text-white sm:text-[1.4rem]">
        {task.title}
      </h2>
      <p className="mt-1.5 text-[12.5px] leading-relaxed text-primary-200">
        {copy.note}
      </p>

      <Button
        to={copy.to}
        variant="accent"
        className="mt-4 min-h-12 w-full justify-between px-4"
      >
        {copy.cta}
        <ArrowRightIcon size={15} />
      </Button>
    </section>
  );
}

function BookSection() {
  return (
    <section>
      <div className="flex items-end justify-between gap-3">
        <h2 className="text-[1.05rem] font-extrabold tracking-[-0.02em] text-surface-950">
          Book a visit
        </h2>
        <span className="text-[12px] font-medium text-surface-500">
          From ₹{VISIT_PLANS.STANDARD.price.toLocaleString("en-IN")}
        </span>
      </div>

      <div className="mt-2.5 grid grid-cols-3 gap-2">
        {REQUESTER_SERVICES.map(({ icon: Icon, title }) => (
          <Link
            key={title}
            to={`/user/create-task?propertyType=${encodeURIComponent(title)}`}
            className="flex min-h-[78px] flex-col items-center justify-center gap-1.5 rounded-2xl border border-surface-200 bg-white px-1.5 py-2.5 text-center transition-colors hover:border-surface-300 hover:bg-surface-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 focus-visible:ring-offset-2 active:bg-surface-100"
          >
            <Icon size={20} className="text-primary-700" />
            <span className="text-[11.5px] font-semibold leading-tight text-surface-800">
              {title}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function RecentVisitRow({ task }: { task: Task }) {
  const price = visitPriceLabel(task.visitPlan, task.quotedPricePaise);

  return (
    <Link
      to={`/user/tasks/${task.id}`}
      className="flex min-h-14 items-center justify-between gap-3 rounded-2xl border border-surface-200 bg-white px-3.5 transition-colors hover:border-surface-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 focus-visible:ring-offset-2 active:bg-surface-50"
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-bold text-surface-900">
          {task.title}
        </span>
        <span className="mt-0.5 block text-[11.5px] font-medium text-surface-500">
          Completed {formatRelativeTime(task.updatedAt)}
          {price ? ` · ${price} quote` : ""}
        </span>
      </span>
      <ArrowRightIcon size={14} className="flex-shrink-0 text-surface-400" />
    </Link>
  );
}

export function UserDashboard() {
  const { data: tasks, isLoading, isError, refetch } = useTaskList();
  const { user } = useAuth();

  if (isLoading) return <DashboardSkeleton />;

  if (isError && !tasks) {
    return (
      <div className="mx-auto max-w-2xl">
        <PageHeader
          title="Your visits"
          description="Track your property visits and proof here."
        />
        <div className="mt-5">
          <EmptyState
            icon={AlertTriangleIcon}
            title="Could not load your visits"
            description="Check your connection and try again."
          >
            <Button type="button" onClick={() => void refetch()}>
              Try again
            </Button>
          </EmptyState>
        </div>
      </div>
    );
  }

  const allTasks = tasks || [];
  const activeTasks = sortForRequester(
    allTasks.filter((task) => isActiveStatus(task.status))
  );
  const completedTasks = allTasks
    .filter((task) => task.status === "COMPLETED")
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  const featuredTask = activeTasks[0] ?? null;
  const needsReview = activeTasks.filter(
    (task) => task.status === "SUBMITTED"
  ).length;
  const firstName = user?.name?.split(" ")[0] || "there";

  const subtitle = (() => {
    if (activeTasks.length > 0) {
      const active = `${activeTasks.length} active visit${activeTasks.length === 1 ? "" : "s"}`;
      return needsReview > 0
        ? `${active} · ${needsReview} proof ready`
        : active;
    }
    if (completedTasks.length > 0) {
      return `${completedTasks.length} past visit${completedTasks.length === 1 ? "" : "s"}`;
    }
    return "Book a property visit in a few taps.";
  })();

  return (
    <div className="mx-auto max-w-2xl">
      {isError && tasks && <QueryNotice retry={() => void refetch()} stale />}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[1.4rem] font-extrabold leading-tight tracking-[-0.03em] text-surface-950 sm:text-[1.6rem]">
            {greeting()}, {firstName}
          </h1>
          <p className="mt-1 text-[12.5px] leading-relaxed text-surface-500">
            {subtitle}
          </p>
        </div>
        <Button
          to="/user/create-task"
          variant="accent"
          size="sm"
          className="max-sm:hidden min-h-10 flex-shrink-0 px-3.5"
        >
          <PlusIcon size={15} />
          Book
        </Button>
      </div>

      <div className="mt-4 space-y-5">
        {featuredTask && <ActiveVisitCard task={featuredTask} />}

        <BookSection />

        {!featuredTask && completedTasks.length > 0 && (
          <section>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[1.05rem] font-extrabold tracking-[-0.02em] text-surface-950">
                Recent
              </h2>
              <Link
                to="/user/tasks"
                className="inline-flex min-h-9 items-center rounded-full px-2 text-[12px] font-bold text-primary-700 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700"
              >
                See all
              </Link>
            </div>
            <div className="mt-2 space-y-2">
              {completedTasks.slice(0, 2).map((task) => (
                <RecentVisitRow key={task.id} task={task} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
