import { lazy, Suspense } from "react";
import { PageLoader } from "./components/ui";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AuthProvider } from "./contexts";
import { ToastProvider, ProtectedRoute, ErrorBoundary, RouteEffects, DemoToolbar } from "./components";
import { AuthLayout, DashboardLayout } from "./layouts";
import { NotFoundPage } from "./pages/NotFoundPage";
const LoginPage = lazy(() => import("./pages/auth/LoginPage").then((module) => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage").then((module) => ({ default: module.RegisterPage })));
const UserDashboard = lazy(() => import("./pages/user/UserDashboard").then((module) => ({ default: module.UserDashboard })));
const UserVisitsPage = lazy(() => import("./pages/user/UserVisitsPage").then((module) => ({ default: module.UserVisitsPage })));
const CreateTaskPage = lazy(() => import("./pages/user/CreateTaskPage").then((module) => ({ default: module.CreateTaskPage })));
const UserTaskDetail = lazy(() => import("./pages/user/UserTaskDetail").then((module) => ({ default: module.UserTaskDetail })));
const TrackCaptainPage = lazy(() => import("./pages/user/TrackCaptainPage").then((module) => ({ default: module.TrackCaptainPage })));
const CaptainDashboard = lazy(() => import("./pages/captain/CaptainDashboard").then((module) => ({ default: module.CaptainDashboard })));
const AcceptedTasksPage = lazy(() => import("./pages/captain/AcceptedTasksPage").then((module) => ({ default: module.AcceptedTasksPage })));
const CaptainTaskDetail = lazy(() => import("./pages/captain/CaptainTaskDetail").then((module) => ({ default: module.CaptainTaskDetail })));
const UploadEvidencePage = lazy(() => import("./pages/captain/UploadEvidencePage").then((module) => ({ default: module.UploadEvidencePage })));
const CaptainLandingPage = lazy(() => import("./pages/captain/CaptainLandingPage").then((module) => ({ default: module.CaptainLandingPage })));
const RequesterLandingPage = lazy(() => import("./pages/verify/RequesterLandingPage").then((module) => ({ default: module.RequesterLandingPage })));
const LandingPage = lazy(() => import("./pages/LandingPage").then((module) => ({ default: module.LandingPage })));
const AccountPage = lazy(() => import("./pages/AccountPage").then((module) => ({ default: module.AccountPage })));
const VisitReportPage = lazy(() => import("./pages/VisitReportPage").then((module) => ({ default: module.VisitReportPage })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 10000,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <RouteEffects />
          <AuthProvider>
            <ToastProvider>
              <Suspense fallback={<PageLoader />}><Routes>
                {/* Public routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/verify" element={<RequesterLandingPage />} />
                <Route path="/captain" element={<CaptainLandingPage />} />
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/verify/signup" element={<RegisterPage forcedRole="USER" />} />
                  <Route path="/captain/signup" element={<RegisterPage forcedRole="CAPTAIN" />} />
                </Route>

                {/* User routes */}
                <Route path="/user/tasks/:id/report" element={<ProtectedRoute allowedRoles={["USER"]}><VisitReportPage /></ProtectedRoute>} />
                <Route path="/captain/tasks/:id/report" element={<ProtectedRoute allowedRoles={["CAPTAIN"]}><VisitReportPage /></ProtectedRoute>} />
                <Route
                  element={
                    <ProtectedRoute allowedRoles={["USER"]}>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/user" element={<UserDashboard />} />
                  <Route path="/user/account" element={<AccountPage />} />
                  <Route path="/user/create-task" element={<CreateTaskPage />} />
                  <Route path="/user/tasks" element={<UserVisitsPage />} />
                  <Route path="/user/tasks/:id" element={<UserTaskDetail />} />
                  <Route path="/user/track/:id" element={<TrackCaptainPage />} />
                </Route>

                {/* Captain routes */}
                <Route
                  element={
                    <ProtectedRoute allowedRoles={["CAPTAIN"]}>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/captain/dashboard" element={<CaptainDashboard />} />
                  <Route path="/captain/account" element={<AccountPage />} />
                  <Route
                    path="/captain/accepted"
                    element={<AcceptedTasksPage />}
                  />
                  <Route
                    path="/captain/tasks/:id"
                    element={<CaptainTaskDetail />}
                  />
                  <Route
                    path="/captain/tasks/:id/upload"
                    element={<UploadEvidencePage />}
                  />
                </Route>

                {/* Catch-all 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes></Suspense>
              <DemoToolbar />
            </ToastProvider>
          </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </ErrorBoundary>
  );
}

export default App;
