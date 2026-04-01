import { createContext, useCallback, useContext, useEffect, useState } from "react";

import type { IUser } from "@/types";
import { getCurrentUser } from "@/lib/appwrite/api";
import { pickUserBio, pickUserProfileImageUrl } from "@/lib/appwrite/config";

export const INITIAL_USER = {
  id: "",
  name: "",
  username: "",
  email: "",
  imageUrl: "",
  bio: "",
};

const INITIAL_STATE = {
  user: INITIAL_USER,
  isLoading: false,
  isAuthenticated: false,
  isAuthReady: false,
  setUser: () => {},
  setIsAuthenticated: () => {},
  checkAuthUser: async () => false as boolean,
};

type IContextType = {
  user: IUser;
  isLoading: boolean;
  isAuthReady: boolean;
  setUser: React.Dispatch<React.SetStateAction<IUser>>;
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  checkAuthUser: () => Promise<boolean>;
};

const AuthContext = createContext<IContextType>(INITIAL_STATE);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<IUser>(INITIAL_USER);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const checkAuthUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentAccount = await getCurrentUser();
      if (currentAccount) {
        const doc = currentAccount as unknown as Record<string, unknown>;
        setUser({
          id: currentAccount.$id,
          name: currentAccount.name,
          username: currentAccount.username,
          email: currentAccount.email,
          imageUrl: pickUserProfileImageUrl(doc),
          bio: pickUserBio(doc),
        });
        setIsAuthenticated(true);

        return true;
      }

      setIsAuthenticated(false);
      return false;
    } catch (error) {
      console.error(error);
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsLoading(false);
      setIsAuthReady(true);
    }
  }, []);

  useEffect(() => {
    void checkAuthUser();
  }, [checkAuthUser]);

  const value = {
    user,
    setUser,
    isLoading,
    isAuthReady,
    isAuthenticated,
    setIsAuthenticated,
    checkAuthUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useUserContext = () => useContext(AuthContext);