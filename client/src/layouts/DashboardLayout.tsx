import { useCallback, useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useMenuKeyboard } from "../hooks/useMenuKeyboard";
import { useAuth, LiveLocationProvider } from "../contexts";
import { useTaskList } from "../hooks";
import {
  PlusIcon,
  ClipboardIcon,
  LogOutIcon,
  HomeIcon,
  SearchIcon,
  ShieldCheckIcon,
  UserIcon,
  CameraIcon,
} from "../components/Icons";
import { Logo, LogoMark, TaskNotifications } from "../components";
import { formatPhone } from "../utils/phone";
import { InspectorLocationSharing } from "../components/InspectorLocationSharing";

const userNav = [
  { to: "/user", label: "Home", icon: HomeIcon, end: true },
  { to: "/user/create-task", label: "Book a visit", icon: PlusIcon, end: true },
  { to: "/user/tasks", label: "My visits", icon: ClipboardIcon, end: false },
];

const captainNav = [
  { to: "/captain/dashboard", label: "Find work", icon: SearchIcon, end: true },
  { to: "/captain/accepted", label: "My visits", icon: ClipboardIcon, end: false },
];

function isActivePath(pathname: string, to: string, end?: boolean) {
  if (end) return pathname === to;
  return pathname.startsWith(to);
}

type NavItem = (typeof userNav)[number] | (typeof captainNav)[number];

function MobileTab({
  item,
  pathname,
  badge = 0,
}: {
  item: NavItem;
  pathname: string;
  badge?: number;
}) {
  const Icon = item.icon;
  const active = isActivePath(pathname, item.to, item.end);

  return (
    <NavLink
      to={item.to}
      end={item.end}
      className="flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 focus-visible:ring-inset"
    >
      <span
        className={`relative flex h-8 w-12 items-center justify-center rounded-full transition-colors ${
          active ? "bg-accent-400 text-primary-950" : "text-surface-500"
        }`}
      >
        <Icon size={19} />
        {badge > 0 && (
          <span
            aria-hidden="true"
            className={`absolute -right-1 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-extrabold ${
              active
                ? "bg-primary-950 text-white"
                : "bg-accent-400 text-primary-950"
            }`}
          >
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </span>
      <span
        className={`text-[11.5px] font-bold ${
          active ? "text-primary-950" : "text-surface-500"
        }`}
      >
        {item.label}
      </span>
    </NavLink>
  );
}

function MobileCenterAction({
  to,
  icon: Icon,
  label,
  ariaLabel,
}: {
  to: string;
  icon: NavItem["icon"];
  label: string;
  ariaLabel: string;
}) {
  return (
    <NavLink
      to={to}
      aria-label={ariaLabel}
      className="relative -mt-5 flex w-[84px] flex-col items-center rounded-xl pb-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 focus-visible:ring-offset-2"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-400 text-primary-950 shadow-elevated ring-4 ring-surface-50 transition-transform active:scale-95 motion-reduce:transition-none motion-reduce:active:scale-100">
        <Icon size={23} />
      </span>
      <span className="mt-1 text-[11px] font-extrabold text-primary-900">
        {label}
      </span>
    </NavLink>
  );
}

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [accountMenu, setAccountMenu] = useState({ open: false, path: "" });
  const accountOpen = accountMenu.open && accountMenu.path === location.pathname;
  const setAccountOpen = (open: boolean) =>
    setAccountMenu({ open, path: location.pathname });

  const closeAccountMenu = useCallback(() => setAccountMenu({ open: false, path: location.pathname }), [location.pathname]);
  const { triggerRef: accountTriggerRef, panelRef: accountPanelRef } = useMenuKeyboard(accountOpen, closeAccountMenu);

  const { data: tasks = [] } = useTaskList();

  const isInspector = user?.role === "CAPTAIN";
  const navItems = isInspector ? captainNav : userNav;
  const isCameraFlow = location.pathname.endsWith("/upload");
  const hideMobilePageTitle =
    location.pathname === "/user" ||
    location.pathname === "/captain/dashboard" ||
    location.pathname === "/user/tasks" ||
    location.pathname === "/captain/accepted";

  const activeTasks = tasks.filter(
    (task) => ["ACCEPTED", "IN_PROGRESS", "SUBMITTED"].includes(task.status)
  );
  const needsReview = tasks.filter((task) => task.status === "SUBMITTED").length;
  const availableNow = tasks.filter((task) => task.status === "OPEN").length;
  const inProgressTask = tasks.find((task) => task.status === "IN_PROGRESS") ?? null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const pageTitle = (() => {
    if (location.pathname.endsWith("/account")) return "Your account";
    if (location.pathname === "/user/create-task") return "Book a visit";
    if (location.pathname.startsWith("/user/tasks/")) return "Visit details";
    if (location.pathname.startsWith("/user/track/")) return "Live tracking";
    if (location.pathname.startsWith("/captain/tasks/")) {
      return location.pathname.endsWith("/upload") ? "Submit proof" : "Visit details";
    }
    if (location.pathname === "/captain/accepted") return "My visits";
    if (location.pathname === "/user/tasks") return "My visits";
    return isInspector ? "Find work" : "Home";
  })();

  const roleLabel = isInspector ? "Inspector" : "Requester";
  const initials = user?.name?.charAt(0).toUpperCase() || <UserIcon size={17} />;

  const navBadge = (to: string) => {
    if (to === "/user/tasks" || to === "/captain/accepted") {
      return activeTasks.length;
    }
    if (to === "/captain/dashboard") return availableNow;
    return 0;
  };

  const homePath = isInspector ? "/captain/dashboard" : "/user";
  const mobileNavItems = isInspector ? captainNav : userNav.filter((item) => item.to !== "/user/create-task");

  return (
    <LiveLocationProvider active={isInspector && (!!inProgressTask || location.pathname.endsWith("/upload"))}>
      <div className="app-ambient min-h-screen">
      <a
        href="#main-content"
        className="sr-only z-[200] focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:inline-flex focus:min-h-11 focus:items-center focus:rounded-xl focus:bg-primary-900 focus:px-4 focus:text-[13px] focus:font-bold focus:text-white"
      >
        Skip to content
      </a>

      {/* ─── Sidebar ─── */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[252px] flex-col overflow-y-auto border-r border-surface-200 bg-white lg:flex">
        <div className="flex h-[76px] items-center border-b border-surface-100 px-5">
          <Logo size="sm" to={homePath} />
        </div>

        <div className="px-5 pb-1 pt-6">
          <p className="truncate px-1 text-[12.5px] font-semibold text-surface-500">
            {isInspector ? "Inspector" : "Requester"}
          </p>
        </div>

        <nav className="space-y-1 px-3 pt-2" aria-label="Dashboard navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const badge = navBadge(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `group relative flex min-h-12 items-center gap-3 rounded-xl px-3 text-[13.5px] font-bold transition-colors ${
                    isActive
                      ? "bg-primary-50 text-primary-800"
                      : "text-surface-600 hover:bg-surface-50 hover:text-surface-950"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full bg-primary-700" />
                    )}
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                        isActive
                          ? "bg-white text-primary-700 shadow-sm"
                          : "bg-surface-100 text-surface-500 group-hover:bg-white"
                      }`}
                    >
                      <Icon size={16} />
                    </span>
                    <span className="flex-1">{item.label}</span>
                    {badge > 0 && (
                      <span
                        className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[13px] font-extrabold tabular-nums ${
                          isActive
                            ? "bg-primary-700 text-white"
                            : needsReview > 0 && item.to === "/user/tasks"
                              ? "bg-accent-400 text-primary-950"
                              : "bg-surface-100 text-surface-500"
                        }`}
                      >
                        {badge > 9 ? "9+" : badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <NavLink to={isInspector ? "/captain/account" : "/user/account"} className="mx-3 mt-2 flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-surface-600 hover:bg-surface-50"><UserIcon size={18} />Your account</NavLink>

        <div className="mt-auto">
          <div className="border-t border-surface-100 px-3 py-3">
            <div className="flex items-center gap-2.5 px-1 py-1">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary-800 text-[14px] font-extrabold text-white">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-bold text-surface-900">{user?.name}</p>
                <p className="truncate text-[13px] font-medium text-surface-500">{roleLabel}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-1 flex min-h-10 w-full items-center gap-2.5 rounded-lg px-2 text-[14px] font-semibold text-surface-500 transition-colors hover:bg-danger-50 hover:text-danger-700"
            >
              <LogOutIcon size={15} />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Main area ─── */}
      <div className="flex min-h-screen min-w-0 flex-col lg:pl-[252px]">
        <header className="sticky top-0 z-30 border-b border-surface-200 bg-surface-50/95 pt-safe backdrop-blur-md">
          <div className="flex h-15 items-center justify-between gap-3 px-4 sm:h-[76px] sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-2.5 lg:hidden">
              <LogoMark size="sm" />
              {!hideMobilePageTitle && (
                <span className="truncate text-[1.05rem] font-extrabold tracking-[-0.035em] text-surface-950">
                  {pageTitle}
                </span>
              )}
            </div>

            <div className="hidden min-w-0 lg:block">
              <p className="truncate text-[1.25rem] font-extrabold leading-tight tracking-[-0.03em] text-surface-950">
                {pageTitle}
              </p>
            </div>

            <div className="ml-auto flex items-center gap-2">
              {!isCameraFlow && user && (
                <TaskNotifications
                  key={user.id}
                  tasks={tasks}
                  role={user.role}
                  userId={user.id}
                />
              )}

              <div className="relative">
                <button
                  type="button"
                  ref={accountTriggerRef}
                  onClick={() => setAccountOpen(!accountOpen)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-primary-100 text-[14px] font-extrabold text-primary-800 shadow-sm transition-colors hover:bg-primary-200"
                  aria-label="Account menu"
                  aria-expanded={accountOpen}
                  aria-haspopup="menu"
                >
                  {initials}
                </button>

                {accountOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setAccountOpen(false)}
                      aria-hidden="true"
                    />
                    <div
                      className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-elevated animate-scale-in"
                      ref={accountPanelRef}
                      aria-label="Account"
                      role="menu"
                    >
                      <div className="border-b border-surface-100 px-4 py-3.5">
                        <p className="text-sm font-semibold text-surface-500">{roleLabel}</p>
                        <p className="mt-1 truncate text-[13.5px] font-extrabold text-surface-950">{user?.name}</p>
                        <p className="mt-0.5 truncate text-[13px] text-surface-500">
                          {user?.phone ? formatPhone(user.phone) : null}
                        </p>
                      </div>
                      <NavLink to={isInspector ? "/captain/account" : "/user/account"} onClick={() => setAccountOpen(false)} role="menuitem" className="flex min-h-11 items-center gap-2.5 px-4 text-sm font-semibold text-surface-600 hover:bg-surface-50"><UserIcon size={15} />Your account</NavLink>
                      <NavLink
                        to={isInspector ? "/captain/accepted" : "/user/tasks"}
                        onClick={() => setAccountOpen(false)}
                        role="menuitem"
                        className="flex min-h-11 items-center gap-2.5 px-4 text-[14px] font-semibold text-surface-600 transition-colors hover:bg-surface-50 hover:text-surface-950"
                      >
                        <ClipboardIcon size={15} />
                        My visits
                      </NavLink>
                      <NavLink
                        to={isInspector ? "/captain" : "/verify"}
                        onClick={() => setAccountOpen(false)}
                        role="menuitem"
                        className="flex min-h-11 items-center gap-2.5 px-4 text-[14px] font-semibold text-surface-600 transition-colors hover:bg-surface-50 hover:text-surface-950"
                      >
                        <ShieldCheckIcon size={15} />
                        How PinProof works
                      </NavLink>
                      <button
                        type="button"
                        onClick={handleLogout}
                        role="menuitem"
                        className="flex min-h-11 w-full items-center gap-2.5 border-t border-surface-100 px-4 text-[14px] font-semibold text-surface-600 transition-colors hover:bg-danger-50 hover:text-danger-700"
                      >
                        <LogOutIcon size={15} />
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {isInspector && <InspectorLocationSharing key={user?.id} tasks={tasks} />}

        <main
          id="main-content"
          className={`min-w-0 flex-1 px-4 py-5 animate-fade-in sm:px-6 sm:py-7 lg:px-8 ${
            isCameraFlow ? "pb-8" : "mb-bottom-nav"
          }`}
        >
          <Outlet />
        </main>
      </div>

      {/* ─── Mobile bottom nav ─── */}
      {!isCameraFlow && (
        <nav
          className="fixed inset-x-0 bottom-0 z-40 border-t border-surface-200 bg-white/95 pb-safe backdrop-blur-xl lg:hidden"
          style={{ boxShadow: "var(--shadow-bottom-nav)" }}
          aria-label="Mobile dashboard navigation"
        >
          {isInspector && !inProgressTask ? (
            <div className="mx-auto flex h-16 max-w-md items-stretch">
              {captainNav.map((item) => (
                <MobileTab
                  key={item.to}
                  item={item}
                  pathname={location.pathname}
                  badge={navBadge(item.to)}
                />
              ))}
            </div>
          ) : (
            <div className="mx-auto flex h-[72px] max-w-md items-end px-2">
              <MobileTab
                item={mobileNavItems[0]}
                pathname={location.pathname}
                badge={navBadge(mobileNavItems[0].to)}
              />

              {isInspector ? (
                inProgressTask && (
                  <MobileCenterAction
                    to={`/captain/tasks/${inProgressTask.id}/upload`}
                    icon={CameraIcon}
                    label="Proof"
                    ariaLabel="Submit proof for the active visit"
                  />
                )
              ) : (
                <MobileCenterAction
                  to="/user/create-task"
                  icon={PlusIcon}
                  label="Book"
                  ariaLabel="Book a visit"
                />
              )}

              <MobileTab
                item={mobileNavItems[1]}
                pathname={location.pathname}
                badge={navBadge(mobileNavItems[1].to)}
              />
            </div>
          )}
        </nav>
      )}
      </div>
    </LiveLocationProvider>
  );
}
