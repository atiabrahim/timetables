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
  id: string;
  username: string;
  role: "Admin" | "Teacher" | "Student";
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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>("ar");
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("scheduler_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [systemUsers, setSystemUsers] = useState<User[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [rooms, setRooms] = useState<string[]>([]);
  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [periodConfigs, setPeriodConfigs] = useState<PeriodConfig[]>([]);

  // تحميل البيانات عند بدء التشغيل
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setSystemUsers(parsed.systemUsers || [
          { id: "1", username: "admin", role: "Admin" }
        ]);
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
    } else {
      // مستخدم افتراضي إذا لم توجد بيانات
      setSystemUsers([{ id: "1", username: "admin", role: "Admin" }]);
    }
  }, []);

  // حفظ البيانات عند أي تغيير
  useEffect(() => {
    const dataToSave = { systemUsers, employees, assignments, departments, rooms, classes, subjects, periodConfigs };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [systemUsers, employees, assignments, departments, rooms, classes, subjects, periodConfigs]);

  const importAllData = (data: any) => {
    if (!data) return;
    
    setSystemUsers(data.systemUsers || []);
    setEmployees(data.employees || []);
    setDepartments(data.departments || []);
    setRooms(data.rooms || []);
    setClasses(data.classes || []);
    setSubjects(data.subjects || []);
    setPeriodConfigs(data.periodConfigs || []);
    setAssignments(data.assignments || []);
    
    const dataToSave = {
      systemUsers: data.systemUsers || [],
      employees: data.employees || [],
      departments: data.departments || [],
      rooms: data.rooms || [],
      classes: data.classes || [],
      subjects: data.subjects || [],
      periodConfigs: data.periodConfigs || [],
      assignments: data.assignments || []
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  };

  const login = (username: string, role: User["role"]) => {
    const newUser = { id: Math.random().toString(36).substr(2, 9), username, role };
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
      language, setLanguage, user, systemUsers, setSystemUsers, login, logout, 
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