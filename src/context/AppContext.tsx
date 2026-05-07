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
  data: any;
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  assignments: Assignment[];
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>;
  t: any;
  isRTL: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>("ar");
  const [user, setUser] = useState<User | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Initial data load from the provided JSON structure
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
        { "firstName": "حكيم,", "lastName": "رضواني", "category": "Full-time", "observation": "aSc Import", "id": "10" },
        { "firstName": "سعداني,", "lastName": "فتحي", "category": "Full-time", "observation": "aSc Import", "id": "11" },
        { "firstName": "سعيدة,", "lastName": "كير", "category": "Full-time", "observation": "aSc Import", "id": "12" },
        { "firstName": "سليمة,", "lastName": "حثروبي", "category": "Full-time", "observation": "aSc Import", "id": "13" },
        { "firstName": "صحراوي,", "lastName": "زهيرة", "category": "Full-time", "observation": "aSc Import", "id": "14" },
        { "firstName": "طليبة,", "lastName": "جميلة", "category": "Full-time", "observation": "aSc Import", "id": "15" },
        { "firstName": "علال,", "lastName": "معتز", "category": "Full-time", "observation": "aSc Import", "id": "16" },
        { "firstName": "عمري,", "lastName": "عبد الباسط", "category": "Full-time", "observation": "aSc Import", "id": "17" },
        { "firstName": "قاسمي,", "lastName": "فوزية", "category": "Full-time", "observation": "aSc Import", "id": "18" },
        { "firstName": "قزي,", "lastName": "عبد السلام", "category": "Full-time", "observation": "aSc Import", "id": "19" }
      ],
      "periodConfigs": [
        { "day": 0, "period": "Morning", "isActive": true },
        { "day": 0, "period": "Afternoon", "isActive": true },
        { "day": 1, "period": "Morning", "isActive": true },
        { "day": 1, "period": "Afternoon", "isActive": true },
        { "day": 2, "period": "Morning", "isActive": true },
        { "day": 3, "period": "Morning", "isActive": true },
        { "day": 3, "period": "Afternoon", "isActive": true },
        { "day": 4, "period": "Morning", "isActive": true }
      ],
      "departments": ["مصلحة التكوين", "مصلحة التمهين", "مصلحة المالية"]
    };
    setData(initialData);
    setEmployees(initialData.employees);
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
      data, employees, setEmployees, assignments, setAssignments,
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