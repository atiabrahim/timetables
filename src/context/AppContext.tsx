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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>("ar");
  const [user, setUser] = useState<User | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [rooms, setRooms] = useState<string[]>([]);
  const [periodConfigs, setPeriodConfigs] = useState<PeriodConfig[]>([]);

  useEffect(() => {
    const initialData = {
      "employees": [
        { "firstName": "الزين,", "lastName": "إبراهيم", "category": "Full-time", "observation": "aSc Import", "id": "1" },
        { "firstName": "اللبي,", "lastName": "عماد", "category": "Full-time", "observation": "aSc Import", "id": "2" },
        { "firstName": "بدة,", "lastName": "الهاشمي", "category": "Full-time", "observation": "aSc Import", "id": "3" },
        { "firstName": "بريبش,", "lastName": "العايش", "category": "Full-time", "observation": "aSc Import", "id": "4" },
        { "firstName": "بوخزنة,", "lastName": "ربيع", "category": "Full-time", "observation": "aSc Import", "id": "5" },
        { "firstName": "بوزيان,", "lastName": "حدة", "category": "Full-time", "observation": "aSc Import", "id": "6" },
        { "firstName": "بوطبيلة,", "lastName": "حبيبة", "category": "Full-time", "observation": "aSc Import", "id": "7" },
        { "firstName": "تريكي,", "lastName": "عبد القادر", "category": "Full-time", "observation": "aSc Import", "id": "8" },
        { "firstName": "حريز,", "lastName": "شعبان", "category": "Full-time", "observation": "aSc Import", "id": "9" },
        { "firstName": "حكيم,", "lastName": "رضواني", "category": "Full-time", "observation": "aSc Import", "id": "10" }
      ],
      "periodConfigs": [
        { "day": 0, "period": "Morning", "isActive": true },
        { "day": 0, "period": "Afternoon", "isActive": true },
        { "day": 1, "period": "Morning", "isActive": true },
        { "day": 1, "period": "Afternoon", "isActive": true },
        { "day": 2, "period": "Morning", "isActive": true },
        { "day": 2, "period": "Afternoon", "isActive": true },
        { "day": 3, "period": "Morning", "isActive": true },
        { "day": 3, "period": "Afternoon", "isActive": true },
        { "day": 4, "period": "Morning", "isActive": true },
        { "day": 4, "period": "Afternoon", "isActive": true }
      ],
      "departments": ["مصلحة التكوين", "مصلحة التمهين", "مصلحة المالية"],
      "rooms": ["قاعة 01", "قاعة 02", "مخبر الإعلام الآلي", "المدرج الكبير"],
      "assignments": [
        { "id": "a1", "employeeId": "1", "day": 0, "period": "Morning", "subject": "تسيير", "department": "مصلحة التكوين", "room": "قاعة 01" },
        { "id": "a2", "employeeId": "2", "day": 1, "period": "Afternoon", "subject": "إعلام آلي", "department": "مصلحة التمهين", "room": "مخبر الإعلام الآلي" },
        { "id": "a3", "employeeId": "3", "day": 2, "period": "Morning", "subject": "محاسبة", "department": "مصلحة المالية", "room": "قاعة 02" }
      ]
    };
    setEmployees(initialData.employees);
    setPeriodConfigs(initialData.periodConfigs);
    setDepartments(initialData.departments);
    setRooms(initialData.rooms);
    setAssignments(initialData.assignments);
  }, []);

  const login = (username: string, role: User["role"]) => {
    setUser({ username, role });
  };

  const logout = () => {
    setUser(null);
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