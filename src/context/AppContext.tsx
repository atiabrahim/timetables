import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, translations } from "../translations";

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  category: string;
  observation: string;
  email?: string;
  phone?: string;
}

interface Assignment {
  id: string;
  employeeId: string;
  day: number;
  period: string;
  subjectId: string;
  classId: string;
  department: string;
  room?: string;
}

interface PeriodConfig {
  day: number;
  period: string;
  isActive: boolean;
}

interface AcademicClass {
  id: string;
  name: string;
}

interface Subject {
  id: string;
  name: string;
}

interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: "Admin" | "Teacher" | "Student";
  observation: string;
  isActive: boolean;
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  user: User | null;
  systemUsers: User[];
  setSystemUsers: React.Dispatch<React.SetStateAction<User[]>>;
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
  classes: AcademicClass[];
  setClasses: React.Dispatch<React.SetStateAction<AcademicClass[]>>;
  subjects: Subject[];
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
  periodConfigs: PeriodConfig[];
  setPeriodConfigs: React.Dispatch<React.SetStateAction<PeriodConfig[]>>;
  importAllData: (data: any) => void;
  t: any;
  isRTL: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = "academic_scheduler_v2_data";

const DEFAULT_ADMIN: User = { 
  id: "admin-id", 
  username: "Admin", 
  fullName: "مدير النظام", 
  email: "admin@edu.com", 
  role: "Admin", 
  observation: "الحساب الرئيسي", 
  isActive: true 
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>("ar");
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("scheduler_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [systemUsers, setSystemUsers] = useState<User[]>([DEFAULT_ADMIN]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [rooms, setRooms] = useState<string[]>([]);
  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [periodConfigs, setPeriodConfigs] = useState<PeriodConfig[]>([]);

  const isRTL = language === "ar";

  useEffect(() => {
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language, isRTL]);

  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.systemUsers && parsed.systemUsers.length > 0) {
          setSystemUsers(parsed.systemUsers);
        }
        setEmployees(parsed.employees || []);
        setAssignments(parsed.assignments || []);
        setDepartments(parsed.departments || []);
        setRooms(parsed.rooms || []);
        setClasses(parsed.classes || []);
        setSubjects(parsed.subjects || []);
        setPeriodConfigs(parsed.periodConfigs || []);
      } catch (e) {
        console.error("Failed to parse saved data", e);
      }
    }
  }, []);

  useEffect(() => {
    const dataToSave = { systemUsers, employees, assignments, departments, rooms, classes, subjects, periodConfigs };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [systemUsers, employees, assignments, departments, rooms, classes, subjects, periodConfigs]);

  const importAllData = (data: any) => {
    if (!data) return;
    if (data.employees) setEmployees(data.employees);
    if (data.rooms) setRooms(data.rooms);
    if (data.classes) setClasses(data.classes);
    if (data.subjects) setSubjects(data.subjects);
    if (data.assignments) setAssignments(data.assignments);
    if (data.departments) setDepartments(data.departments);
    if (data.periodConfigs && data.periodConfigs.length > 0) setPeriodConfigs(data.periodConfigs);
    if (data.systemUsers) setSystemUsers(data.systemUsers);
  };

  const login = (username: string, role: User["role"]) => {
    const found = systemUsers.find(u => u.username === username);
    const userToLogin = found || { 
      id: Math.random().toString(36).substr(2, 9), 
      username, 
      fullName: username, 
      email: "", 
      role, 
      observation: "", 
      isActive: true 
    };
    setUser(userToLogin);
    localStorage.setItem("scheduler_user", JSON.stringify(userToLogin));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("scheduler_user");
  };

  const t = translations[language];

  return (
    <AppContext.Provider value={{ 
      language, setLanguage, user, systemUsers, setSystemUsers, login, logout, 
      employees, setEmployees, assignments, setAssignments,
      departments, setDepartments, rooms, setRooms,
      classes, setClasses, subjects, setSubjects,
      periodConfigs, setPeriodConfigs,
      importAllData,
      t, isRTL 
    }}>
      <div className={isRTL ? "font-arabic" : ""}>
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