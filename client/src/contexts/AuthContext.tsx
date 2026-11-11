/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import type {
  AuthMode,
  AuthResponse,
  DemoAccount,
  DemoResetResponse,
  OtpRequestResponse,
  Role,
  User,
  VerifyOtpResponse,
} from "../types";
import {
  demoLoginApi,
  fetchAuthModeApi,
  requestOtpApi,
  resetDemoApi,
  verifyOtpApi,
  fetchProfileApi,
  updateProfileApi,
} from "../services";

interface VerifyOtpOptions {
  name?: string;
  role?: Role;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authMode: AuthMode;
  authModeReady: boolean;
  phoneSignInEnabled: boolean;
  demoAccounts: DemoAccount[];
  requestOtp: (phone: string) => Promise<OtpRequestResponse>;
  verifyOtp: (
    phone: string,
    code: string,
    options?: VerifyOtpOptions
  ) => Promise<VerifyOtpResponse>;
  demoLogin: (role: Role) => Promise<AuthResponse>;
  resetDemo: () => Promise<DemoResetResponse>;
  logout: () => void;
  updateProfile: (input: { name: string; email: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthSession {
  user: User | null;
  token: string | null;
}

/** Read a saved phone-auth session once, before the first render. */
function readSavedSession(): AuthSession {
  const savedToken = localStorage.getItem("token");
  const savedUser = localStorage.getItem("user");

  if (!savedToken || !savedUser) {
    return { user: null, token: null };
  }

  try {
    const parsedUser = JSON.parse(savedUser) as User;
    // Sessions created before phone-first auth are discarded.
    const payload = JSON.parse(atob(savedToken.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    if (!parsedUser.id || !parsedUser.phone || !["USER", "CAPTAIN"].includes(parsedUser.role) || !payload.exp || payload.exp * 1000 <= Date.now()) {
      throw new Error("Legacy session");
    }
    return { user: parsedUser, token: savedToken };
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return { user: null, token: null };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<AuthSession>(readSavedSession);
  const [authMode, setAuthMode] = useState<AuthMode>("otp");
  const [authModeReady, setAuthModeReady] = useState(false);
  const [phoneSignInEnabled, setPhoneSignInEnabled] = useState(true);
  const [demoAccounts, setDemoAccounts] = useState<DemoAccount[]>([]);
  const { user, token } = session;

  useEffect(() => {
    const syncSession = (event: StorageEvent) => {
      if (event.key !== "token" && event.key !== "user" && event.key !== null) return;
      queryClient.clear();
      setSession(readSavedSession());
    };
    window.addEventListener("storage", syncSession);
    return () => window.removeEventListener("storage", syncSession);
  }, [queryClient]);

  useEffect(() => {
    if (!token) return;
    let active = true;
    void fetchProfileApi().then((profile) => {
      if (!active || localStorage.getItem("token") !== token) return;
      setSession({ token, user: profile });
      localStorage.setItem("user", JSON.stringify(profile));
    }).catch(() => { /* API handles expired sessions; connection failures keep the saved session. */ });
    return () => { active = false; };
  }, [token]);

  // The server is the source of truth for explicitly enabled demo deployments.
  useEffect(() => {
    let active = true;

    fetchAuthModeApi()
      .then((result) => {
        if (!active) return;
        setAuthMode(result.mode);
        setPhoneSignInEnabled(result.phoneSignInEnabled !== false);
        setDemoAccounts(result.demo);
        setAuthModeReady(true);
      })
      .catch(() => {
        if (!active) return;
        setAuthMode("otp");
        setDemoAccounts([]);
        setAuthModeReady(true);
      });

    return () => {
      active = false;
    };
  }, []);

  const saveSession = useCallback((result: AuthResponse) => {
    queryClient.clear();
    setSession({ user: result.user, token: result.token });
    localStorage.setItem("token", result.token);
    localStorage.setItem("user", JSON.stringify(result.user));
  }, [queryClient]);

  const requestOtp = useCallback(async (phone: string) => {
    return requestOtpApi(phone);
  }, []);

  const verifyOtp = useCallback(
    async (phone: string, code: string, options: VerifyOtpOptions = {}) => {
      const result = await verifyOtpApi({ phone, code, ...options });
      if ("token" in result) {
        saveSession(result);
      }
      return result;
    },
    [saveSession]
  );

  const demoLogin = useCallback(
    async (role: Role) => {
      const result = await demoLoginApi(role);
      saveSession(result);
      return result;
    },
    [saveSession]
  );

  const resetDemo = useCallback(async () => {
    return resetDemoApi();
  }, []);

  const logout = useCallback(() => {
    queryClient.clear();
    setSession({ user: null, token: null });
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }, [queryClient]);

  const updateProfile = useCallback(async (input: { name: string; email: string }) => {
    const profile = await updateProfileApi(input);
    if (localStorage.getItem("token") !== token) return;
    localStorage.setItem("user", JSON.stringify(profile));
    setSession({ user: profile, token });
    void queryClient.invalidateQueries({ queryKey: ["tasks"] });
  }, [token, queryClient]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading: false,
        authMode,
        authModeReady,
        phoneSignInEnabled,
        demoAccounts,
        requestOtp,
        verifyOtp,
        demoLogin,
        resetDemo,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
