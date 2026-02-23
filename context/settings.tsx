import { createContext, ReactNode, useContext, useState } from "react";

type SettingsContextType = {
  autoSend: boolean;
  setAutoSend: (v: boolean) => void;
};

const SettingsContext = createContext<SettingsContextType>({
  autoSend: false,
  setAutoSend: () => {},
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [autoSend, setAutoSend] = useState(false);
  return (
    <SettingsContext.Provider value={{ autoSend, setAutoSend }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
