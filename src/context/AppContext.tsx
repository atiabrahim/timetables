"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, translations } from "../translations";
import { 
  User, Institution, Employee, Assignment, Department,
  AcademicClass, Subject, PeriodConfig, AppState, TemplateAssignment, PeriodPart, DailyAssignment 
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
  importAllData: (data: Partial<AppState>) => void;
  saveDataToCloud: () => Promise<void>;
  loadDataFromCloud: () => Promise<void>;
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

  const isRTL = language === "ar";

  useEffect(() => {
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language, isRTL]);

  // Apply theme class to document element
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
    // نقوم بالتحميل الصامت عند البداية فقط
    loadDataFromCloud(true);
  }, []);

  useEffect(() => {
    const dataToSave = { 
      systemUsers, institution, employees, assignments, 
      templateAssignments, dailyAssignments, departments, rooms, classes, subjects, periodConfigs 
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [systemUsers, institution, employees, assignments, templateAssignments, dailyAssignments, departments, rooms, classes, subjects, periodConfigs]);

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
      templateAssignments, dailyAssignments, departments, rooms, classes, subjects, periodConfigs 
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
      periodConfigs, setPeriodConfigs, importAllData, saveDataToCloud, loadDataFromCloud: () => loadDataFromCloud(false), t, isRTL 
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
</dyad-file>

<dyad-write path="src/pages/Settings.tsx" description="Add theme customization section to Settings page">
"use client";

import React, { useRef } from "react";
import { useApp } from "../context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  AlertTriangle, 
  Clock,
  FileCode,
  Settings as SettingsIcon,
  CloudUpload,
  CloudDownload,
  Palette,
  Check
} from "lucide-react";
import { showSuccess, showError } from "../utils/toast";
import { parseXml } from "../lib/export-utils";
import PageHeader from "../components/shared/PageHeader";
import { DAYS, PERIODS } from "../constants/schedule";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ThemeType } from "../context/AppContext";

const Settings = () => {
  const { 
    t, 
    periodConfigs, setPeriodConfigs,
    importAllData, saveDataToCloud, loadDataFromCloud,
    isRTL, theme, setTheme
  } = useApp();
  
  const xmlInputRef = useRef<HTMLInputElement>(null);

  const handleImportXml = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const buffer = event.target?.result as ArrayBuffer;
        let decoder = new TextDecoder("utf-8");
        let xmlText = decoder.decode(buffer);
        
        if (xmlText.toLowerCase().includes("windows-1256") || xmlText.toLowerCase().includes("iso-8859-6")) {
          decoder = new TextDecoder("windows-1256");
          xmlText = decoder.decode(buffer);
        }

        const data = parseXml(xmlText);
        importAllData(data);
        showSuccess(isRTL ? "تم استيراد البيانات بنجاح" : "Data imported successfully");
        if (xmlInputRef.current) xmlInputRef.current.value = "";
      } catch (err) {
        showError(isRTL ? "فشل استيراد الملف" : "Failed to import file");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const togglePeriod = (day: number, period: string) => {
    const existing = periodConfigs.find(p => p.day === day && p.period === period);
    if (existing) {
      setPeriodConfigs(periodConfigs.map(p => 
        (p.day === day && p.period === period) ? { ...p, isActive: !p.isActive } : p
      ));
    } else {
      setPeriodConfigs([...periodConfigs, { day, period, isActive: false }]);
    }
  };

  const isPeriodActive = (day: number, period: string) => {
    const config = periodConfigs.find(p => p.day === day && p.period === period);
    return config ? config.isActive : true;
  };

  const handleClearAll = () => {
    localStorage.removeItem("academic_scheduler_v2_data");
    showSuccess(isRTL ? "تم مسح كافة البيانات" : "All data cleared");
    window.location.reload();
  };

  const themesList: { id: ThemeType; nameAr: string; nameEn: string; colorClass: string }[] = [
    { id: "emerald", nameAr: "زمردي (افتراضي)", nameEn: "Emerald (Default)", colorClass: "bg-emerald-600" },
    { id: "blue", nameAr: "أزرق محيطي", nameEn: "Ocean Blue", colorClass: "bg-blue-600" },
    { id: "purple", nameAr: "بنفسجي ملكي", nameEn: "Royal Purple", colorClass: "bg-purple-600" },
    { id: "amber", nameAr: "عسلي دافئ", nameEn: "Warm Amber", colorClass: "bg-amber-600" },
    { id: "rose", nameAr: "وردي أنيق", nameEn: "Elegant Rose", colorClass: "bg-rose-600" }
  ];

  return (
    <div className="space-y-8 pb-20">
      <PageHeader
        title={t.settings}
        subtitle={isRTL ? "تخصيص النظام والبيانات الأساسية" : "System customization and core data"}
        icon={SettingsIcon}
        isRTL={isRTL}
      >
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="rounded-xl border-emerald-200 gap-2 font-bold text-emerald-700 bg-white h-11" 
            onClick={saveDataToCloud}
          >
            <CloudUpload size={18} />
            {isRTL ? "حفظ سحابي" : "Cloud Save"}
          </Button>
          <Button 
            variant="outline" 
            className="rounded-xl border-emerald-200 gap-2 font-bold text-emerald-700 bg-white h-11" 
            onClick={loadDataFromCloud}
          >
            <CloudDownload size={18} />
            {isRTL ? "استرداد سحابي" : "Cloud Load"}
          </Button>
        </div>
        <input type="file" ref={xmlInputRef} onChange={handleImportXml} accept=".xml" className="hidden" />
        <Button 
          variant="outline" 
          className="rounded-xl border-slate-200 gap-2 font-bold text-slate-700 bg-white h-11" 
          onClick={() => xmlInputRef.current?.click()}
        >
          <FileCode size={18} />
          {isRTL ? "استيراد XML" : "Import XML"}
        </Button>
      </PageHeader>

      {/* Theme Customization */}
      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardHeader className="bg-[#f9f9f1] border-b border-gray-100">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Palette size={20} className="text-[#064e3b]" />
            {isRTL ? "سمة الموقع والألوان" : "Site Theme & Colors"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-xs text-slate-500 mb-4">
            {isRTL ? "اختر اللون المفضل لديك لتخصيص واجهة النظام بالكامل:" : "Choose your preferred color scheme to customize the entire system interface:"}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {themesList.map((tItem) => {
              const isSelected = theme === tItem.id;
              return (
                <button
                  key={tItem.id}
                  onClick={() => {
                    setTheme(tItem.id);
                    showSuccess(isRTL ? `تم تغيير السمة إلى ${tItem.nameAr}` : `Theme changed to ${tItem.nameEn}`);
                  }}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-start",
                    isSelected 
                      ? "border-emerald-600 bg-emerald-50/30 shadow-md" 
                      : "border-slate-100 hover:border-slate-200 bg-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("w-6 h-6 rounded-full shrink-0 shadow-sm flex items-center justify-center", tItem.colorClass)}>
                      {isSelected && <Check size={12} className="text-white" />}
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      {isRTL ? tItem.nameAr : tItem.nameEn}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Schedule Config */}
      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardHeader className="bg-[#f9f9f1] border-b border-gray-100">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Clock size={20} className="text-[#064e3b]" />
            {isRTL ? "تفعيل الحصص الأسبوعية" : "Weekly Periods Config"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {DAYS.map(day => (
              <div key={day.id} className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="font-bold text-gray-900 text-xs mb-3 text-center">{isRTL ? day.name : day.en}</p>
                <div className="grid grid-cols-2 gap-2">
                  {PERIODS.map(p => (
                    <div key={p} className="flex flex-col items-center gap-1 p-1.5 bg-white rounded-lg border border-gray-100">
                      <span className="text-[9px] font-bold text-gray-500">{p}</span>
                      <Switch 
                        scale={0.7}
                        checked={isPeriodActive(day.id, p)} 
                        onCheckedChange={() => togglePeriod(day.id, p)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-100 bg-red-50/30 rounded-3xl overflow-hidden">
        <CardHeader>
          <CardTitle className="text-red-800 flex items-center gap-2">
            <AlertTriangle size={20} />
            {isRTL ? "منطقة الخطر" : "Danger Zone"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-red-600">
              {isRTL ? "سيؤدي هذا الإجراء إلى حذف كافة المعلومات بشكل نهائي." : "This action will permanently delete all information."}
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="rounded-xl px-8">
                  {isRTL ? "مسح كافة البيانات" : "Clear All Data"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="border-red-100 rounded-3xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>{isRTL ? "هل أنت متأكد تماماً؟" : "Are you absolutely sure?"}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {isRTL ? "لا يمكن التراجع عن هذا الإجراء. سيتم حذف كل شيء." : "This action cannot be undone. Everything will be deleted."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl">{t.cancel}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearAll} className="bg-red-600 hover:bg-red-700 rounded-xl">
                    {isRTL ? "نعم، امسح الكل" : "Yes, Clear All"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;