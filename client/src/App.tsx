import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AuthProvider } from "./contexts";
import { ToastProvider, ProtectedRoute, ErrorBoundary, RouteEffects, DemoToolbar } from "./components";
import { AuthLayout, DashboardLayout } from "./layouts";
import { LoginPage, RegisterPage } from "./pages/auth";
import {
  UserDashboard,
  UserVisitsPage,
  CreateTaskPage,
  UserTaskDetail,
  TrackCaptainPage,
} from "./pages/user";
import {
  CaptainDashboard,
  AcceptedTasksPage,
  CaptainTaskDetail,
  UploadEvidencePage,
  CaptainLandingPage,
} from "./pages/captain";
import { RequesterLandingPage } from "./pages/verify";
import { LandingPage, NotFoundPage } from "./pages";

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
              <Routes>
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
                <Route
                  element={
                    <ProtectedRoute allowedRoles={["USER"]}>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/user" element={<UserDashboard />} />
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
              </Routes>
              <DemoToolbar />
            </ToastProvider>
          </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </ErrorBoundary>
  );
}

export default App;
