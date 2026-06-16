"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, translations } from "../translations";
import { 
  User, Institution, Employee, Assignment, Department,
  AcademicClass, Subject, PeriodConfig, AppState, TemplateAssignment, PeriodPart, DailyAssignment, TeacherConstraint, ClassConstraint, RoomConstraint 
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
  roomConstraints: RoomConstraint[];
  setRoomConstraints: React.Dispatch<React.SetStateAction<RoomConstraint[]>>;
  periodTimings: Record<string, string>;
  setPeriodTimings: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  importAllData: (data: Partial<AppState>) => void;
  saveDataToCloud: () => Promise<void>;
  loadDataFromCloud: () => Promise<void>;
  loadDemoData: () => void;
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

const DEFAULT_PERIOD_TIMINGS: Record<string, string> = {
  "1": "08:00-09:00", "2": "09:00-10:00", "3": "10:00-11:00", "4": "11:00-12:00",
  "5": "13:00-14:00", "6": "14:00-15:00", "7": "15:00-16:00", "8": "16:00-17:00",
  "9": "17:00-18:00", "10": "18:00-19:00", "11": "19:00-20:00", "12": "20:00-21:00",
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
  const [roomConstraints, setRoomConstraints] = useState<RoomConstraint[]>([]);
  const [periodTimings, setPeriodTimings] = useState<Record<string, string>>(DEFAULT_PERIOD_TIMINGS);
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
      teacherConstraints, classConstraints, roomConstraints, periodTimings
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [systemUsers, institution, employees, assignments, templateAssignments, dailyAssignments, departments, rooms, classes, subjects, periodConfigs, teacherConstraints, classConstraints, roomConstraints, periodTimings]);

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
      teacherConstraints, classConstraints, roomConstraints, periodTimings
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
    if (data.roomConstraints) setRoomConstraints(data.roomConstraints);
    if (data.periodTimings) setPeriodTimings(data.periodTimings);
    
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

  const loadDemoData = () => {
    // 1. الفروع والأفواج
    const demoClasses: AcademicClass[] = [
      { id: "cls-1", name: "تقني سامي إعلام آلي", code: "TS-INFO", qualificationLevel: "مستوى 5" },
      { id: "cls-2", name: "مستغل معلوماتية", code: "OP-INFO", qualificationLevel: "مستوى 4" },
      { id: "cls-3", name: "محاسبة وتسيير", code: "TS-ACC", qualificationLevel: "مستوى 5" },
      { id: "cls-4", name: "أمانة مكتبية", code: "SEC-OFF", qualificationLevel: "مستوى 3" },
      { id: "cls-5", name: "إلكترونيك الصناعية", code: "TS-ELEC", qualificationLevel: "مستوى 5" }
    ];

    // 2. المواد الدراسية
    const demoSubjects: Subject[] = [
      { id: "sub-1", name: "خوارزميات وبرمجة", nameEn: "Algorithms & Programming" },
      { id: "sub-2", name: "قواعد البيانات", nameEn: "Database Systems" },
      { id: "sub-3", name: "الرياضيات التطبيقية", nameEn: "Applied Mathematics" },
      { id: "sub-4", name: "المحاسبة العامة", nameEn: "General Accounting" },
      { id: "sub-5", name: "تقنيات التعبير والاتصال", nameEn: "Communication Skills" },
      { id: "sub-6", name: "اللغة الإنجليزية التقنية", nameEn: "Technical English" },
      { id: "sub-7", name: "الدوائر الإلكترونية", nameEn: "Electronic Circuits" },
      { id: "sub-8", name: "أنظمة التشغيل والشبكات", nameEn: "Operating Systems & Networks" }
    ];

    // 3. المعلمون والأساتذة
    const demoEmployees: Employee[] = [
      { id: "emp-1", firstName: "أحمد", lastName: "بن علي", category: "Full-time", email: "ahmed.benali@edu.dz", phone: "0550123456", observation: "أستاذ رئيسي" },
      { id: "emp-2", firstName: "فاطمة الزهراء", lastName: "قادري", category: "Full-time", email: "fatima.kadri@edu.dz", phone: "0661987654", observation: "أستاذة مادة" },
      { id: "emp-3", firstName: "محمد السعيد", lastName: "رحماني", category: "Full-time", email: "m.rahmani@edu.dz", phone: "0772345678", observation: "" },
      { id: "emp-4", firstName: "عائشة", lastName: "عثماني", category: "Part-time", email: "aicha.osmani@edu.dz", phone: "0555112233", observation: "متعاقدة" },
      { id: "emp-5", firstName: "خالد", lastName: "بوزيد", category: "Full-time", email: "khaled.bouzid@edu.dz", phone: "0660445566", observation: "مسؤول ورشة" },
      { id: "emp-6", firstName: "مريم", lastName: "بلقاسم", category: "Part-time", email: "meryem.b@edu.dz", phone: "0770889900", observation: "متعاقدة" }
    ];

    // 4. القاعات والورشات
    const demoRooms = [
      "القاعة 1",
      "القاعة 2",
      "المخبر البيداغوجي",
      "ورشة الإعلام الآلي",
      "مخبر الإلكترونيك"
    ];

    // 5. المصالح الإدارية
    const demoDepts: Department[] = [
      { id: "dept-1", number: "1", name: "مصلحة التكوين المهني", head: "أ. بلقاسم بوعافية", code: "ST", observation: "المكتب الرئيسي" },
      { id: "dept-2", number: "2", name: "مصلحة التوجيه والتمهين", head: "السيدة ليلى منصوري", code: "SO", observation: "مكتب الاستقبال" }
    ];

    // 6. جدول الحصص (التوزيعات)
    const demoAssignments: Assignment[] = [
      // الأحد
      { id: "asg-1", employeeId: "emp-1", day: 0, period: "1", subjectId: "sub-1", classId: "cls-1", department: "", room: "ورشة الإعلام الآلي" },
      { id: "asg-2", employeeId: "emp-1", day: 0, period: "2", subjectId: "sub-1", classId: "cls-1", department: "", room: "ورشة الإعلام الآلي" },
      { id: "asg-3", employeeId: "emp-2", day: 0, period: "3", subjectId: "sub-2", classId: "cls-2", department: "", room: "المخبر البيداغوجي" },
      { id: "asg-4", employeeId: "emp-2", day: 0, period: "4", subjectId: "sub-2", classId: "cls-2", department: "", room: "المخبر البيداغوجي" },
      
      // الاثنين
      { id: "asg-5", employeeId: "emp-3", day: 1, period: "1", subjectId: "sub-4", classId: "cls-3", department: "", room: "القاعة 1" },
      { id: "asg-6", employeeId: "emp-3", day: 1, period: "2", subjectId: "sub-4", classId: "cls-3", department: "", room: "القاعة 1" },
      { id: "asg-7", employeeId: "emp-4", day: 1, period: "3", subjectId: "sub-6", classId: "cls-1", department: "", room: "القاعة 2" },
      { id: "asg-8", employeeId: "emp-5", day: 1, period: "5", subjectId: "sub-7", classId: "cls-5", department: "", room: "مخبر الإلكترونيك" },
      { id: "asg-9", employeeId: "emp-5", day: 1, period: "6", subjectId: "sub-7", classId: "cls-5", department: "", room: "مخبر الإلكترونيك" },

      // الثلاثاء
      { id: "asg-10", employeeId: "emp-1", day: 2, period: "1", subjectId: "sub-8", classId: "cls-1", department: "", room: "ورشة الإعلام الآلي" },
      { id: "asg-11", employeeId: "emp-1", day: 2, period: "2", subjectId: "sub-8", classId: "cls-1", department: "", room: "ورشة الإعلام الآلي" },
      { id: "asg-12", employeeId: "emp-6", day: 2, period: "3", subjectId: "sub-5", classId: "cls-4", department: "", room: "القاعة 2" },
      { id: "asg-13", employeeId: "emp-6", day: 2, period: "4", subjectId: "sub-5", classId: "cls-4", department: "", room: "القاعة 2" },

      // الأربعاء
      { id: "asg-14", employeeId: "emp-2", day: 3, period: "1", subjectId: "sub-2", classId: "cls-1", department: "", room: "المخبر البيداغوجي" },
      { id: "asg-15", employeeId: "emp-2", day: 3, period: "2", subjectId: "sub-2", classId: "cls-1", department: "", room: "المخبر البيداغوجي" },
      { id: "asg-16", employeeId: "emp-3", day: 3, period: "5", subjectId: "sub-3", classId: "cls-3", department: "", room: "القاعة 1" },
      { id: "asg-17", employeeId: "emp-3", day: 3, period: "6", subjectId: "sub-3", classId: "cls-3", department: "", room: "القاعة 1" },

      // الخميس
      { id: "asg-18", employeeId: "emp-5", day: 4, period: "1", subjectId: "sub-7", classId: "cls-5", department: "", room: "مخبر الإلكترونيك" },
      { id: "asg-19", employeeId: "emp-5", day: 4, period: "2", subjectId: "sub-7", classId: "cls-5", department: "", room: "مخبر الإلكترونيك" },
      { id: "asg-20", employeeId: "emp-4", day: 4, period: "3", subjectId: "sub-6", classId: "cls-2", department: "", room: "القاعة 2" }
    ];

    // 7. متطلبات التدريس (للمولد التلقائي)
    const demoRequirements = [
      { id: "req-1", employeeId: "emp-1", subjectId: "sub-1", classId: "cls-1", room: "ورشة الإعلام الآلي", count: 4 },
      { id: "req-2", employeeId: "emp-2", subjectId: "sub-2", classId: "cls-2", room: "المخبر البيداغوجي", count: 3 },
      { id: "req-3", employeeId: "emp-3", subjectId: "sub-4", classId: "cls-3", room: "القاعة 1", count: 4 },
      { id: "req-4", employeeId: "emp-4", subjectId: "sub-6", classId: "cls-1", room: "القاعة 2", count: 2 },
      { id: "req-5", employeeId: "emp-5", subjectId: "sub-7", classId: "cls-5", room: "مخبر الإلكترونيك", count: 4 }
    ];

    // حفظ المتطلبات في LocalStorage
    localStorage.setItem("auto_generator_requirements", JSON.stringify(demoRequirements));

    // استيراد كافة البيانات في سياق التطبيق
    setClasses(demoClasses);
    setSubjects(demoSubjects);
    setEmployees(demoEmployees);
    setRooms(demoRooms);
    setDepartments(demoDepts);
    setAssignments(demoAssignments);

    showSuccess(isRTL ? "تم تحميل البيانات التجريبية بنجاح!" : "Demo data loaded successfully!");
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
      classConstraints, setClassConstraints, roomConstraints, setRoomConstraints,
      periodTimings, setPeriodTimings,
      importAllData, saveDataToCloud, loadDataFromCloud: () => loadDataFromCloud(false), loadDemoData, t, isRTL,
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