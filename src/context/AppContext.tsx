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
  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [periodConfigs, setPeriodConfigs] = useState<PeriodConfig[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load initial data
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setEmployees(parsed.employees || []);
      setAssignments(parsed.assignments || []);
      setDepartments(parsed.departments || []);
      setRooms(parsed.rooms || []);
      setClasses(parsed.classes || []);
      setSubjects(parsed.subjects || []);
      setPeriodConfigs(parsed.periodConfigs || []);
    } else {
      // Default data if empty
      setDepartments(["مصلحة التكوين", "مصلحة التمهين"]);
      setRooms(["قاعة 01", "قاعة 02"]);
      setPeriodConfigs(Array.from({ length: 5 }).flatMap((_, day) => [
        { day, period: "Morning", isActive: true },
        { day, period: "Afternoon", isActive: true }
      ]));
    }
    setIsInitialized(true);
  }, []);

  // Save data whenever it changes
  useEffect(() => {
    if (isInitialized) {
      const dataToSave = { employees, assignments, departments, rooms, classes, subjects, periodConfigs };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    }
  }, [employees, assignments, departments, rooms, classes, subjects, periodConfigs, isInitialized]);

  const importAllData = (data: any) => {
    setEmployees(data.employees || []);
    setAssignments(data.assignments || []);
    setDepartments(data.departments || []);
    setRooms(data.rooms || []);
    setClasses(data.classes || []);
    setSubjects(data.subjects || []);
    setPeriodConfigs(data.periodConfigs || []);
    
    // Force immediate save to localStorage
    const dataToSave = { 
      employees: data.employees || [], 
      assignments: data.assignments || [], 
      departments: data.departments || [], 
      rooms: data.rooms || [], 
      classes: data.classes || [], 
      subjects: data.subjects || [], 
      periodConfigs: data.periodConfigs || [] 
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  };

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
      departments, setDepartments, rooms, setRooms,
      classes, setClasses, subjects, setSubjects,
      periodConfigs, setPeriodConfigs,
      importAllData,
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