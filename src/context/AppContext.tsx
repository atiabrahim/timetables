"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, translations } from "../translations";
import { 
  User, Institution, Employee, Assignment, Department,
  AcademicClass, Subject, PeriodConfig, AppState, TemplateAssignment, PeriodPart, DailyAssignment, TeacherConstraint, ClassConstraint 
} from "../types";
import { supabase } from "../lib/supabase";
import { showSuccess, showError } from "../utils/toast";

export type ThemeType = "emerald" | "blue" | "purple" | "amber" | "rose";

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  user: User | null;
  systemUsers: User[];
  setSystemUsers: React.Dispatch<React.SetStateAction<User[]>>;
  login: (username: string, role: User["role"]) => void;
  logout: () => void;
  institution: Institution;
  setInstitution: React.Dispatch<React.SetStateAction<Institution>>;
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  assignments: Assignment[];
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>;
  templateAssignments: TemplateAssignment[];
  updateTemplateAssignment: (dayIdx: number, period: PeriodPart, employeeIds: string[]) => void;
  dailyAssignments: DailyAssignment[];
  saveAssignment: (date: string, periods: PeriodPart[], employeeIds: string[]) => void;
  getEffectiveAssignment: (dateStr: string, period: PeriodPart) => string[];
  departments: Department[];
  setDepartments: React.Dispatch<React.SetStateAction<Department[]>>;
  rooms: string[];
  setRooms: React.Dispatch<React.SetStateAction<string[]>>;
  classes: AcademicClass[];
  setClasses: React.Dispatch<React.SetStateAction<AcademicClass[]>>;
  subjects: Subject[];
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
  periodConfigs: PeriodConfig[];
  setPeriodConfigs: React.Dispatch<React.SetStateAction<PeriodConfig[]>>;
  teacherConstraints: TeacherConstraint[];
  setTeacherConstraints: React.Dispatch<React.SetStateAction<TeacherConstraint[]>>;
  classConstraints: ClassConstraint[];
  setClassConstraints: React.Dispatch<React.SetStateAction<ClassConstraint[]>>;
  importAllData: (data: Partial<AppState>) => void;
  saveDataToCloud: () => Promise<void>;
  loadDataFromCloud: () => Promise<void>;
  t: any;
  isRTL: boolean;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
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

const DEFAULT_INSTITUTION: Institution = {
  name: "مركز التكوين المهني والتمهين",
  subName: "المجاهد لمقدم مبروك بالدبيلة",
  address: "الدبيلة، الوادي",
  phone: "",
  email: "",
  academicYear: "2023/2024",
  pedagogicalManagerTitle: "المسؤول البيداغوجي",
  generalManagerTitle: "مدير المركز"
};

const generateDefaultPeriodConfigs = (): PeriodConfig[] => {
  const configs: PeriodConfig[] = [];
  const days = [0, 1, 2, 3, 4];
  days.forEach(d => {
    configs.push({ day: d, period: "Morning", isActive: true });
    configs.push({ day: d, period: "Afternoon", isActive: true });
    configs.push({ day: d, period: "Evening", isActive: true });
  });
  return configs;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>("ar");
  const [theme, setThemeState] = useState<ThemeType>(() => {
    const saved = localStorage.getItem("scheduler_theme");
    return (saved as ThemeType) || "emerald";
  });
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("scheduler_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [systemUsers, setSystemUsers] = useState<User[]>([DEFAULT_ADMIN]);
  const [institution, setInstitution] = useState<Institution>(DEFAULT_INSTITUTION);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [templateAssignments, setTemplateAssignments] = useState<TemplateAssignment[]>([]);
  const [dailyAssignments, setDailyAssignments] = useState<DailyAssignment[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [rooms, setRooms] = useState<string[]>([]);
  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [periodConfigs, setPeriodConfigs] = useState<PeriodConfig[]>(generateDefaultPeriodConfigs);
  const [teacherConstraints, setTeacherConstraints] = useState<TeacherConstraint[]>([]);
  const [classConstraints, setClassConstraints] = useState<ClassConstraint[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const isRTL = language === "ar";

  useEffect(() => {
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language, isRTL]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("theme-emerald", "theme-blue", "theme-purple", "theme-amber", "theme-rose");
    if (theme !== "emerald") {
      root.classList.add(`theme-${theme}`);
    }
    localStorage.setItem("scheduler_theme", theme);
  }, [theme]);

  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        importAllData(parsed);
      } catch (e) {
        console.error("Failed to parse saved data", e);
      }
    }
    loadDataFromCloud(true);
  }, []);

  useEffect(() => {
    const dataToSave = { 
      systemUsers, institution, employees, assignments, 
      templateAssignments, dailyAssignments, departments, rooms, classes, subjects, periodConfigs,
      teacherConstraints, classConstraints
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [systemUsers, institution, employees, assignments, templateAssignments, dailyAssignments, departments, rooms, classes, subjects, periodConfigs, teacherConstraints, classConstraints]);

  const loadDataFromCloud = async (silent = false) => {
    try {
      const { data, error } = await supabase
        .from('app_sessions')
        .select('data')
        .eq('id', 'default_session')
        .maybeSingle();

      if (error) throw error;

      if (data && data.data) {
        importAllData(data.data);
        if (!silent) {
          showSuccess(isRTL ? "تم استرداد البيانات بنجاح" : "Data loaded successfully");
        }
      } else {
        if (!silent) {
          showError(isRTL ? "لا توجد بيانات محفوظة سحابياً" : "No cloud data found");
        }
      }
    } catch (err: any) {
      console.error("Cloud load error:", err);
      if (!silent) {
        showError(isRTL ? `فشل الاسترداد: ${err.message}` : `Load failed: ${err.message}`);
      }
    }
  };

  const saveDataToCloud = async () => {
    const dataToSave = { 
      systemUsers, institution, employees, assignments, 
      templateAssignments, dailyAssignments, departments, rooms, classes, subjects, periodConfigs,
      teacherConstraints, classConstraints
    };

    try {
      const { error } = await supabase
        .from('app_sessions')
        .upsert({ 
          id: 'default_session', 
          data: dataToSave, 
          updated_at: new Date().toISOString() 
        });

      if (error) {
        console.error("Supabase Error Details:", error);
        throw error;
      }
      
      showSuccess(isRTL ? "تمت المزامنة مع السحابة بنجاح" : "Synced with cloud successfully");
    } catch (err: any) {
      console.error("Cloud save error:", err);
      showError(isRTL ? `فشل الحفظ: ${err.message || "خطأ غير معروف"}` : `Save failed: ${err.message || "Unknown error"}`);
    }
  };

  const updateTemplateAssignment = (dayIdx: number, period: PeriodPart, employeeIds: string[]) => {
    setTemplateAssignments(prev => {
      const filtered = prev.filter(a => !(a.dayIdx === dayIdx && a.period === period));
      if (employeeIds.length === 0) return filtered;
      return [...filtered, { dayIdx, period, employeeIds: Array.from(new Set(employeeIds)) }];
    });
  };

  const saveAssignment = (date: string, periods: PeriodPart[], employeeIds: string[]) => {
    setDailyAssignments(prev => {
      const filtered = prev.filter(a => !(a.date === date && periods.includes(a.period)));
      const uniqueIds = Array.from(new Set(employeeIds));
      const newAssignments = periods.map(period => ({
        date,
        period,
        employeeIds: uniqueIds
      }));
      return [...filtered, ...newAssignments];
    });
  };

  const getEffectiveAssignment = (dateStr: string, period: PeriodPart): string[] => {
    const daily = dailyAssignments.find(d => d.date === dateStr && d.period === period);
    if (daily) {
      return daily.employeeIds;
    }

    const date = new Date(dateStr);
    const dayIdx = date.getDay();
    const template = templateAssignments.find(t => t.dayIdx === dayIdx && t.period === period);
    if (template) {
      return template.employeeIds;
    }

    const timetableIds = assignments
      .filter(a => {
        if (a.day !== dayIdx) return false;
        const p = parseInt(a.period);
        if (period === "Morning") return p >= 1 && p <= 4;
        if (period === "Afternoon") return p >= 5 && p <= 7;
        if (period === "Evening") return p >= 8 && p <= 10;
        return false;
      })
      .map(a => a.employeeId);

    return Array.from(new Set(timetableIds));
  };

  const importAllData = (data: Partial<AppState>) => {
    if (!data) return;
    if (data.institution) setInstitution({ ...DEFAULT_INSTITUTION, ...data.institution });
    if (data.employees) setEmployees(data.employees);
    if (data.rooms) setRooms(data.rooms);
    if (data.classes) setClasses(data.classes);
    if (data.subjects) setSubjects(data.subjects);
    if (data.assignments) setAssignments(data.assignments);
    if (data.templateAssignments) setTemplateAssignments(data.templateAssignments);
    if (data.dailyAssignments) setDailyAssignments(data.dailyAssignments);
    if (data.periodConfigs && data.periodConfigs.length > 0) setPeriodConfigs(data.periodConfigs);
    if (data.systemUsers) setSystemUsers(data.systemUsers);
    if (data.teacherConstraints) setTeacherConstraints(data.teacherConstraints);
    if (data.classConstraints) setClassConstraints(data.classConstraints);
    
    if (data.departments) {
      const migratedDepts = data.departments.map((d: any, idx: number) => {
        if (typeof d === 'string') {
          return {
            id: `dept-${idx}-${Math.random().toString(36).substr(2, 4)}`,
            number: (idx + 1).toString(),
            name: d,
            head: "",
            code: "",
            observation: ""
          };
        }
        return d;
      });
      setDepartments(migratedDepts);
    }
  };

  const login = (username: string, role: User["role"]) => {
    const found = systemUsers.find(u => u.username === username);
    const userToLogin = found || { 
      id: Math.random().toString(36).substr(2, 9), 
      username, fullName: username, email: "", role, observation: "", isActive: true 
    };
    setUser(userToLogin);
    localStorage.setItem("scheduler_user", JSON.stringify(userToLogin));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("scheduler_user");
  };

  const t = translations[language];

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
  };

  return (
    <AppContext.Provider value={{ 
      language, setLanguage, theme, setTheme, user, systemUsers, setSystemUsers, login, logout, 
      institution, setInstitution, employees, setEmployees, assignments, setAssignments,
      templateAssignments, updateTemplateAssignment, dailyAssignments, saveAssignment, getEffectiveAssignment,
      departments, setDepartments, rooms, setRooms, classes, setClasses, subjects, setSubjects,
      periodConfigs, setPeriodConfigs, teacherConstraints, setTeacherConstraints,
      classConstraints, setClassConstraints,
      importAllData, saveDataToCloud, loadDataFromCloud: () => loadDataFromCloud(false), t, isRTL,
      isSidebarCollapsed, setIsSidebarCollapsed
    }}>
      <div className={isRTL ? "font-arabic" : ""}>
        {children}
      </div>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

export default AppProvider;