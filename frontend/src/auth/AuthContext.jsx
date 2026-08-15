import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  clearAuthSession,
  getCurrentUser,
  getStoredToken,
  getStoredUser,
  loginUser,
  registerUser,
  storeAuthSession,
} from "../services/authApi";


const AuthContext =
  createContext(null);


export function AuthProvider({
  children,
}) {
  const [
    user,
    setUser,
  ] = useState(
    getStoredUser()
  );

  const [
    token,
    setToken,
  ] = useState(
    getStoredToken()
  );

  const [
    isAuthLoading,
    setIsAuthLoading,
  ] = useState(
    Boolean(
      getStoredToken()
    )
  );


  const logout =
    useCallback(() => {
      clearAuthSession();

      setToken(null);

      setUser(null);
    }, []);


  const refreshUser =
    useCallback(
      async () => {
        const storedToken =
          getStoredToken();

        if (!storedToken) {
          setIsAuthLoading(
            false
          );

          return null;
        }

        try {
          const currentUser =
            await getCurrentUser();

          setUser(
            currentUser
          );

          localStorage.setItem(
            "palmistry_tarot_user",
            JSON.stringify(
              currentUser
            )
          );

          return currentUser;
        } catch (error) {
          console.error(
            "Session validation failed:",
            error
          );

          logout();

          return null;
        } finally {
          setIsAuthLoading(
            false
          );
        }
      },
      [logout]
    );


  useEffect(() => {
    refreshUser();
  }, [refreshUser]);


  const login =
    useCallback(
      async (
        email,
        password
      ) => {
        const response =
          await loginUser(
            email,
            password
          );

        storeAuthSession(
          response.access_token,
          response.user
        );

        setToken(
          response.access_token
        );

        setUser(
          response.user
        );

        return response.user;
      },
      []
    );


  const register =
    useCallback(
      async (
        registrationData
      ) => {
        const response =
          await registerUser(
            registrationData
          );

        storeAuthSession(
          response.access_token,
          response.user
        );

        setToken(
          response.access_token
        );

        setUser(
          response.user
        );

        return response.user;
      },
      []
    );


  const value =
    useMemo(
      () => ({
        user,
        token,

        isAuthenticated:
          Boolean(
            token &&
            user
          ),

        isAuthLoading,

        login,
        register,
        logout,
        refreshUser,
      }),
      [
        user,
        token,
        isAuthLoading,
        login,
        register,
        logout,
        refreshUser,
      ]
    );


  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  const context =
    useContext(
      AuthContext
    );

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
}