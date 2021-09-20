import React from "react";

interface AuthContextValues {
  authInfo: AuthInfo;
  isAuthenticated: boolean;
  setAuthInfo: (authInfo: AuthInfo) => void;
}

export const AuthContext = React.createContext<undefined | AuthContextValues>(
  undefined
);
const Provider = AuthContext.Provider;

interface Props {
  children: React.ReactNode;
}

interface AuthInfo {
  token: string | null;
  userPk: number | null;
}

export function AuthProvider({ children }: Props) {
  const [authInfo, setAuthInfo] = React.useState<AuthInfo>({
    token: null,
    userPk: null
  });

  const isAuthenticated = authInfo.token !== null;

  return (
    <Provider
      value={{
        authInfo,
        isAuthenticated,
        setAuthInfo,
      }}
    >
      {children}
    </Provider>
  );
}

export function useAuthContext() {
  const context = React.useContext(AuthContext);

  if (context === undefined) {
    // handle
    throw new Error("useAuthContext should be used within an AuthProvider.");
  }
  return context;
}