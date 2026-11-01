/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
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
} from "../services";
import { connectSocket, disconnectSocket } from "../sockets";

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
    if (!parsedUser.phone) {
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
  const [session, setSession] = useState<AuthSession>(readSavedSession);
  const [authMode, setAuthMode] = useState<AuthMode>("otp");
  const [authModeReady, setAuthModeReady] = useState(false);
  const [demoAccounts, setDemoAccounts] = useState<DemoAccount[]>([]);
  const { user, token } = session;

  // The server is the source of truth for demo mode. In production it always
  // reports "otp", even if AUTH_MODE=demo is set in the environment.
  useEffect(() => {
    let active = true;

    fetchAuthModeApi()
      .then((result) => {
        if (!active) return;
        setAuthMode(result.mode);
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

  // Socket connection is an external system, so it belongs in an effect.
  // The session itself is restored synchronously from localStorage.
  useEffect(() => {
    if (token) {
      connectSocket(token);
    } else {
      disconnectSocket();
    }
  }, [token]);

  const saveSession = useCallback((result: AuthResponse) => {
    setSession({ user: result.user, token: result.token });
    localStorage.setItem("token", result.token);
    localStorage.setItem("user", JSON.stringify(result.user));
  }, []);

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
    setSession({ user: null, token: null });
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading: false,
        authMode,
        authModeReady,
        demoAccounts,
        requestOtp,
        verifyOtp,
        demoLogin,
        resetDemo,
        logout,
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
