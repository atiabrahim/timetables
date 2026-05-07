import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, translations } from "../translations";

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  category: string;
  observation: string;
}

interface Assignment {
  id: string;
  employeeId: string;
  day: number;
  period: string;
  subject: string;
  department: string;
  room?: string;
}

interface PeriodConfig {
  day: number;
  period: string;
  isActive: boolean;
}

interface User {
  username: string;
  role: "Admin" | "Teacher" | "Student";
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  user: User | null;
  login: (username: string, role: User["role"]) => void;
  logout: () => void;
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  assignments: Assignment[];
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>;
  departments: string[];
  setDepartments: React.Dispatch<React.SetStateAction<string[]>>;
  rooms: string[];
  setRooms: React.Dispatch<React.SetStateAction<string[]>>;
  periodConfigs: PeriodConfig[];
  setPeriodConfigs: React.Dispatch<React.SetStateAction<PeriodConfig[]>>;
  t: any;
  isRTL: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = "academic_scheduler_data";

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>("ar");
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("scheduler_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [rooms, setRooms] = useState<string[]>([]);
  const [periodConfigs, setPeriodConfigs] = useState<PeriodConfig[]>([]);

  // تحميل البيانات عند بدء التشغيل
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setEmployees(parsed.employees || []);
      setAssignments(parsed.assignments || []);
      setDepartments(parsed.departments || []);
      setRooms(parsed.rooms || []);
      setPeriodConfigs(parsed.periodConfigs || []);
    } else {
      // بيانات افتراضية إذا لم يوجد شيء محفوظ
      const initialData = {
        employees: [
          { id: "1", firstName: "الزين,", lastName: "إبراهيم", category: "Full-time", observation: "aSc Import" },
          { id: "2", firstName: "اللبي,", lastName: "عماد", category: "Full-time", observation: "aSc Import" }
        ],
        departments: ["مصلحة التكوين", "مصلحة التمهين", "مصلحة المالية"],
        rooms: ["قاعة 01", "قاعة 02", "مخبر الإعلام الآلي"],
        periodConfigs: Array.from({ length: 5 }).flatMap((_, day) => [
          { day, period: "Morning", isActive: true },
          { day, period: "Afternoon", isActive: true }
        ]),
        assignments: []
      };
      setEmployees(initialData.employees);
      setDepartments(initialData.departments);
      setRooms(initialData.rooms);
      setPeriodConfigs(initialData.periodConfigs);
    }
  }, []);

  // حفظ البيانات عند أي تغيير
  useEffect(() => {
    if (employees.length > 0 || departments.length > 0) {
      const dataToSave = { employees, assignments, departments, rooms, periodConfigs };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    }
  }, [employees, assignments, departments, rooms, periodConfigs]);

  const login = (username: string, role: User["role"]) => {
    const newUser = { username, role };
    setUser(newUser);
    localStorage.setItem("scheduler_user", JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("scheduler_user");
  };

  const t = translations[language];
  const isRTL = language === "ar";

  return (
    <AppContext.Provider value={{ 
      language, setLanguage, user, login, logout, 
      employees, setEmployees, assignments, setAssignments,
      departments, setDepartments, rooms, setRooms, periodConfigs, setPeriodConfigs,
      t, isRTL 
    }}>
      <div dir={isRTL ? "rtl" : "ltr"} className={isRTL ? "font-arabic" : ""}>
        {children}
      </div>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};