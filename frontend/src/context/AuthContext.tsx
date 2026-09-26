import { createContext, type ReactNode, useContext, useState } from "react";

type User = {
  loginId: string;
  fullName: string;
};

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const value: AuthContextValue = {
    user,
    isAuthenticated: user !== null,
    signOut: () => setUser(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
