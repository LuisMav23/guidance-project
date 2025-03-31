"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { User } from "@/models/user";
import { Data } from "@/models/data";
import { Record } from "@/models/record";

interface GlobalContextType {
  user: User;
  setUser: (user: User) => void;
  data: Data | null;
  setData: (data: Data | null) => void;
  records: Record[];
  setRecords: (records: Record[]) => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const defaultUser: User = {
  id: "",
  username: "",
  first_name: "",
  last_name: "",
  user_type: "",
};

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(defaultUser);
  const [data, setData] = useState<Data | null>(null);
  const [records, setRecords] = useState<Record[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, []);

  return (
    <GlobalContext.Provider value={{ user, setUser, data, setData, records, setRecords }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useGlobalContext must be used within a GlobalProvider");
  }
  return context;
};
