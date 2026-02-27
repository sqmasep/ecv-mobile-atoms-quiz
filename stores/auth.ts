import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => void;
  hydrate: () => Promise<void>;
}

export const useAuth = create<AuthState>()(
  persist(
    set => ({
      user: null,
      isLoading: false,

      signIn: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          // Fake sign-in: validate email format and password length
          if (!email.includes("@") || password.length < 6) {
            throw new Error("Invalid email or password");
          }
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          const user: User = {
            id: `user_${Date.now()}`,
            email,
            name: email.split("@")[0],
          };
          set({ user, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      signUp: async (email: string, password: string, name: string) => {
        set({ isLoading: true });
        try {
          // Fake sign-up: validate inputs
          if (!email.includes("@") || password.length < 6 || !name.trim()) {
            throw new Error("Invalid input");
          }
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          const user: User = {
            id: `user_${Date.now()}`,
            email,
            name,
          };
          set({ user, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      signOut: () => {
        set({ user: null });
      },

      hydrate: async () => {
        // This is called on app start to restore persisted state
        // zustand persist middleware handles this automatically
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
