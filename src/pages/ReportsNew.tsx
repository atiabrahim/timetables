"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { 
  format, 
  parseISO, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  getDay,
  isValid
} from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Printer, Calendar, FileText, Eye, BarChart2, Layout as LayoutIcon, Users } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type PeriodPart = "Morning" | "Afternoon" | "Evening";

const ReportsNew = () => {
  const { 
    employees, 
    periodConfigs, 
    assignments,
    departments,
    rooms,
    isRTL,
    t,
    language
  } = useApp();

  const [dailyDate, setDailyDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [monthlyDate, setMonthlyDate] = useState(format(new Date(), "yyyy-MM"));
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("daily");
  const [selectedPeriods, setSelectedPeriods] = useState<PeriodPart[]>(["Morning", "Afternoon", "Evening"]);
  const [reportStyles, setReportStyles] = useState({
    fontFamily: "'Cairo', sans-serif",
    headerSize: 16,
    titleSize: 24,
    tableSize: 14,
    footerSize: 16,
    orientation: "portrait" as "portrait" | "landscape"
  });

  const currentLocale = language === "ar" ? ar : enUS;

  // Get unique supervisors from employees
  const supervisors = useMemo(() => {
    const allSupervisors = employees.map(e => `${e.lastName} ${e.firstName}`);
    return ["جميع الموظفين", ...allSupervisors];
  }, [employees]);

  const handlePrint = () => {
    window.print();
  };

  const togglePeriod = (period: PeriodPart) => {
    setSelectedPeriods(prev => 
      prev.includes(period) ? prev.filter(p => p !== period) : [...prev, period]
    );
  };

  const updateOrientation = (val: "portrait" | "landscape") => {
    setReportStyles({ ...reportStyles, orientation: val });
  };

  // Get effective assignments for a date and period
  const getEffectiveAssignment = (dateStr: string, period: PeriodPart): string[] => {
    const date = parseISO(dateStr);
    const dayIdx = getDay(date);
    
    let periodNum: number;
    if (period === "Morning") periodNum = 1;
    else if (period === "Afternoon") periodNum = 5;
    else periodNum = 7;
    
    return assignments
      .filter(a => a.day === dayIdx && a.period === periodNum.toString())
      .map(a => a.employeeId);
  };

  const reportContainerStyle = {
    fontFamily: reportStyles.fontFamily
  };

  const renderAttendanceSheet = (date: Date, period: PeriodPart, isLast: boolean) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const assignedIds = getEffectiveAssignment(dateStr, period);
    
    const assignedEmployees = assignedIds
      .map(id => employees.find(e => e.id === id))
      .filter(Boolean)
      .sort((a, b) => {
        const nameA = `${a!.firstName} ${a!.lastName}`.toLowerCase();
        const nameB = `${b!.firstName} ${b!.lastName}`.toLowerCase();
        return nameA.localeCompare(nameB, language === "ar" ? "ar" : "en");
      });
    
    if (assignedEmployees.length === 0) return null;

    return (
      <div 
        key={`${dateStr}-${period}`}
        className={cn(
          "bg-white p-6 md:p-8 mb-6 mx-auto shadow-sm border border-slate-100 rounded-xl",
          "print:shadow-none print:border-0 print:mb-0 print:break-after-page print:p-0",
          "w-full max-w-full box-border"
        )}
        dir={isRTL ? "rtl" : "ltr"}
        style={reportContainerStyle}
      >
        <div className="text-center mb-3 space-y-0.5 pt-0" style={{ fontSize: `${reportStyles.headerSize}px` }}>
          <p className="font-bold text-slate-900">{t.republic}</p>
          <p className="font-medium text-slate-800">{t.centerName}</p>
          <p className="font-medium text-slate-800">{t.centerLocation}</p>
        </div>

        <div className={cn("mb-2", isRTL ? "text-right" : "text-left")} style={{ fontSize: `${reportStyles.headerSize}px` }}>
          <p className="font-bold text-slate-900">
            {t.department}: <span className="font-normal">{departments[0] || "مصلحة التكوين"}</span>
          </p>
        </div>

        <div className="text-center mb-4 border-b-2 border-slate-900 pb-2">
          <h1 className="font-bold text-slate-900 mb-1" style={{ fontSize: `${reportStyles.titleSize}px` }}>{t.attendanceSheet}</h1>
          <div className="flex justify-center items-center gap-4">
            <p className="text-slate-600 font-bold" style={{ fontSize: `${reportStyles.headerSize}px` }}>
              {format(date, "EEEE, d MMMM yyyy", { locale: currentLocale })}
            </p>
            <span className="text-slate-300 h-3 w-px bg-slate-300"></span>
            <p className="font-black text-emerald-600" style={{ fontSize: `${reportStyles.headerSize}px` }}>
              {t[period.toLowerCase() as keyof typeof t] || period}
            </p>
          </div>
        </div>
        
        <div className="min-h-[500px] print:min-h-0 overflow-visible">
          <Table className="w-full border-collapse border-2 border-slate-900 compact-table" style={{ fontSize: `${reportStyles.tableSize}px` }}>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50 border-b-2 border-slate-900">
                <TableHead className={cn("w-[40px] text-center font-bold text-slate-900 border-e-2 border-slate-900 py-1")}>{t.number}</TableHead>
                <TableHead className={cn("w-[200px] text-center font-bold text-slate-900 border-e-2 border-slate-900 py-1")}>{t.employeeName}</TableHead>
                <TableHead className={cn("w-[120px] text-center font-bold text-slate-900 border-e-2 border-slate-900 py-1")}>{t.signature}</TableHead>
                <TableHead className="text-center font-bold text-slate-900 py-1">{t.notes}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignedEmployees.map((emp, idx) => (
                <TableRow key={emp?.id} className="hover:bg-transparent border-b border-slate-900">
                  <TableCell className="text-center font-bold border-e-2 border-slate-900 p-1">{idx + 1}</TableCell>
                  <TableCell className="font-bold border-e-2 border-slate-900 p-1 px-3 truncate max-w-[200px]">
                    {emp?.firstName} {emp?.lastName}
                  </TableCell>
                  <TableCell className="border-e-2 border-slate-900 p-1"></TableCell>
                  <TableCell className="p-1"></TableCell>
                </TableRow>
              ))}
              {Array.from({ length: Math.max(0, 18 - assignedEmployees.length) }).map((_, i) => (
                <TableRow key={`empty-${i}`} className="hover:bg-transparent border-b border-slate-900">
                  <TableCell className="text-center border-e-2 border-slate-900 p-1">{assignedEmployees.length + i + 1}</TableCell>
                  <TableCell className="border-e-2 border-slate-900 p-1"></TableCell>
                  <TableCell className="border-e-2 border-slate-900 p-1"></TableCell>
                  <TableCell className="p-1"></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-12" style={{ fontSize: `${reportStyles.footerSize}px` }}>
          <div className="border-t-2 border-slate-900 pt-2 text-center">
            <p className="font-bold text-slate-900">{supervisors[0]}</p>
          </div>
          <div className="border-t-2 border-slate-900 pt-2 text-center">
            <p className="font-bold text-slate-900">{t.managerSignature}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderDailyReport = () => {
    const date = parseISO(dailyDate);
    if (!isValid(date)) return null;
    const dayIdx = getDay(date);
    const periods: PeriodPart[] = ["Morning", "Afternoon", "Evening"];
    const activePeriods = periods.filter(p => 
      selectedPeriods.includes(p) && 
      periodConfigs.find(c => c.day === dayIdx && c.period === p)?.isActive
    );
    return (
      <div className="space-y-6 print:space-y-0">
        {activePeriods.map((period, idx) => renderAttendanceSheet(date, period, idx === activePeriods.length - 1))}
      </div>
    );
  };

  const renderMonthlyReport = () => {
    const [year, month] = monthlyDate.split("-").map(Number);
    const date = new Date(year, month - 1, 1);
    if (!isValid(date)) return null;
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const days = eachDayOfInterval({ start, end });
    const periods: PeriodPart[] = ["Morning", "Afternoon", "Evening"];
    const sheets: React.ReactNode[] = [];
    days.forEach((day, dayIdx) => {
      const currentDayIdx = getDay(day);
      periods.forEach((period, pIdx) => {
        if (selectedPeriods.includes(period) && periodConfigs.find(c => c.day === currentDayIdx && c.period === period)?.isActive) {
          const isLast = dayIdx === days.length - 1 && pIdx === periods.length - 1;
          const sheet = renderAttendanceSheet(day, period, isLast);
          if (sheet) sheets.push(sheet);
        }
      });
    });
    return <div className="space-y-6 print:space-y-0">{sheets.length > 0 ? sheets : <div className="text-center p-12 text-slate-400 italic print:hidden">{t.noAssignments}</div>}</div>;
  };

  const renderStatsReport = () => {
    const [year, month] = monthlyDate.split("-").map(Number);
    const date = new Date(year, month - 1, 1);
    if (!isValid(date)) return null;
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const days = eachDayOfInterval({ start, end });
    const stats = employees.map(emp => {
      let morning = 0, afternoon = 0, evening = 0;
      days.forEach(day => {
        const dateStr = format(day, "yyyy-MM-dd");
        ["Morning", "Afternoon", "Evening"].forEach(period => {
          if (selectedPeriods.includes(period as PeriodPart)) {
            const ids = getEffectiveAssignment(dateStr, period as PeriodPart);
            if (ids.includes(emp.id)) {
              if (period === "Morning") morning++;
              if (period === "Afternoon") afternoon++;
              if (period === "Evening") evening++;
            }
          }
        });
      });
      return { ...emp, morning, afternoon, evening, total: morning + afternoon + evening };
    }).sort((a, b) => b.total - a.total);
    return (
      <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm mx-auto w-full max-w-full print:border-0 print:p-0" dir={isRTL ? "rtl" : "ltr"} style={reportContainerStyle}>
        <div className="text-center mb-6"><h3 className="text-xl font-black text-slate-900 mb-1">{t.monthlyStats}</h3><p className="text-emerald-600 font-bold">{format(date, "MMMM yyyy", { locale: currentLocale })}</p></div>
        <Table className="border-2 border-slate-900 w-full compact-table">
          <TableHeader>
            <TableRow className="bg-slate-50 border-b-2 border-slate-900">
              <TableHead className={cn("font-bold text-slate-900 border-e-2 border-slate-900 py-1", isRTL ? "text-right" : "text-left")}>{t.employeeName}</TableHead>
              <TableHead className="text-center font-bold text-slate-900 border-e-2 border-slate-900 py-1">{t.morning}</TableHead>
              <TableHead className="text-center font-bold text-slate-900 border-e-2 border-slate-900 py-1">{t.afternoon}</TableHead>
              <TableHead className="text-center font-bold text-slate-900 border-e-2 border-slate-900 py-1">{t.evening}</TableHead>
              <TableHead className="text-center font-bold text-slate-900 py-1">{t.total}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.map(s => (
              <TableRow key={s.id} className="hover:bg-slate-50/50 border-b border-slate-900">
                <TableCell className={cn("font-bold text-slate-700 border-e-2 border-slate-900 p-1", isRTL ? "text-right" : "text-left")}>{s.firstName} {s.lastName}</TableCell>
                <TableCell className="text-center font-medium border-e-2 border-slate-900 p-1">{s.morning}</TableCell>
                <TableCell className="text-center font-medium border-e-2 border-slate-900 p-1">{s.afternoon}</TableCell>
                <TableCell className="text-center font-medium border-e-2 border-slate-900 p-1">{s.evening}</TableCell>
                <TableCell className="text-center font-black p-1">{s.total}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  const currentReportContent = () => {
    if (activeTab === "daily") return renderDailyReport();
    if (activeTab === "monthly") return renderMonthlyReport();
    return renderStatsReport();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <h2 className="text-2xl font-bold text-slate-800">{t.reports}</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsPreviewOpen(true)}><Eye className="h-4 w-4 me-2" />{t.preview}</Button>
          <Button onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-700 text-white"><Printer className="h-4 w-4 me-2" />{t.print}</Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 print:hidden">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <Label className="text-xs font-bold text-slate-500 uppercase">{t.department}</Label>
          <Select value={departments[0] || ""} onValueChange={() => {}}>
            <SelectTrigger className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <Label className="text-xs font-bold text-slate-500 uppercase">{t.supervisor}</Label>
          <Select value={supervisors[0] || ""} onValueChange={() => {}}>
            <SelectTrigger className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {supervisors.map(sup => (
                <SelectItem key={sup} value={sup}>{sup}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <Label className="text-xs font-bold text-slate-500 uppercase">{t.orientation}</Label>
          <Select value={reportStyles.orientation} onValueChange={(v: any) => updateOrientation(v)}>
            <SelectTrigger className="h-10">
              <div className="flex items-center gap-2">
                <LayoutIcon className="h-4 w-4" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="portrait">{t.portrait}</SelectItem>
              <SelectItem value="landscape">{t.landscape}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <Label className="text-xs font-bold text-slate-500 uppercase">{t.applyToPeriods}</Label>
          <div className="flex gap-4 pt-1">
            {["Morning", "Afternoon", "Evening"].map(p => (
              <div key={p} className="flex items-center gap-2">
                <Checkbox 
                  id={`filter-${p}`} 
                  checked={selectedPeriods.includes(p as PeriodPart)} 
                  onCheckedChange={() => togglePeriod(p as PeriodPart)} 
                />
                <Label htmlFor={`filter-${p}`} className="text-[10px] font-bold cursor-pointer">
                  {t[p.toLowerCase() as keyof typeof t] || p}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Tabs defaultValue="daily" onValueChange={setActiveTab} className="w-full print:hidden">
        <TabsList className="grid w-full grid-cols-3 mb-8 h-12 bg-white border">
          <TabsTrigger value="daily" className="flex items-center gap-2 font-bold">
            <Calendar className="h-4 w-4" />
            {t.dailyReport}
          </TabsTrigger>
          <TabsTrigger value="monthly" className="flex items-center gap-2 font-bold">
            <FileText className="h-4 w-4" />
            {t.monthlyReport}
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2 font-bold">
            <BarChart2 className="h-4 w-4" />
            {t.monthlyStats}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="daily" className="space-y-6">
          <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <Label htmlFor="daily-date" className="font-bold">{t.selectDate}</Label>
            <Input 
              id="daily-date" 
              type="date" 
              className="w-auto h-10" 
              value={dailyDate} 
              onChange={(e) => setDailyDate(e.target.value)} 
            />
          </div>
          <div className="bg-slate-50 p-4 md:p-8 rounded-2xl border border-slate-100">
            {renderDailyReport()}
          </div>
        </TabsContent>
        
        <TabsContent value="monthly" className="space-y-6">
          <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <Label htmlFor="monthly-date" className="font-bold">{t.selectMonth}</Label>
            <Input 
              id="monthly-date" 
              type="month" 
              className="w-auto h-10" 
              value={monthlyDate} 
              onChange={(e) => setMonthlyDate(e.target.value)} 
            />
          </div>
          <div className="bg-slate-50 p-4 md:p-8 rounded-2xl border border-slate-100">
            {renderMonthlyReport()}
          </div>
        </TabsContent>
        
        <TabsContent value="stats" className="space-y-6">
          <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <Label htmlFor="stats-date" className="font-bold">{t.selectMonth}</Label>
            <Input 
              id="stats-date" 
              type="month" 
              className="w-auto h-10" 
              value={monthlyDate} 
              onChange={(e) => setMonthlyDate(e.target.value)} 
            />
          </div>
          <div className="bg-slate-50 p-4 md:p-8 rounded-2xl border border-slate-100">
            {renderStatsReport()}
          </div>
        </TabsContent>
      </Tabs>

      <div className="print-only print-content">{currentReportContent()}</div>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-[95vw] w-full max-h-[90vh] overflow-y-auto bg-slate-100 print:hidden">
          <DialogHeader className="bg-white p-4 border-b sticky top-0 z-10">
            <DialogTitle className="flex items-center justify-between">
              <span className="font-bold">{t.printPreview}</span>
              <div className="flex items-center gap-3">
                <Select value={reportStyles.orientation} onValueChange={(v: any) => updateOrientation(v)}>
                  <SelectTrigger className="w-32 h-9 bg-slate-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portrait">{t.portrait}</SelectItem>
                    <SelectItem value="landscape">{t.landscape}</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handlePrint} size="sm" className="bg-emerald-600 text-white font-bold">
                  <Printer className="h-4 w-4 me-2" />
                  {t.print}
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="py-8 px-4 flex flex-col items-center">
            <div className="print-content w-full">{currentReportContent()}</div>
          </div>
          <DialogFooter className="bg-white p-4 border-t sticky bottom-0 z-10">
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>{t.cancel}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportsNew;
</assistant><dyad-write path="src/translations.ts" description="Adding new translation keys for the Reports page">
export type Language = "ar" | "en";

export const translations = {
  ar: {
    dashboard: "لوحة التحكم",
    schedule: "الجدول",
    weeklyWorkSchedule: "جدول العمل الأسبوعي",
    employees: "المعلمون",
    classes: "الفروع",
    subjects: "المواد",
    rooms: "القاعات",
    lessons: "الحصص",
    reports: "التقارير",
    importXml: "استيراد XML",
    users: "المستخدمون",
    institution: "المؤسسة",
    logout: "تسجيل الخروج",
    welcome: "مرحباً،",
    role: "الدور:",
    admin: "مدير",
    appTitle: "مدير الجدول الدراسي",
    appSubtitle: "مستكشف قاعدة بيانات aSc XML",
    settings: "الإعدادات",
    cancel: "إلغاء",
    save: "حفظ",
    morning: "صباحاً",
    afternoon: "مساءً",
    evening: "ليلاً",
    search: "بحث...",
    preview: "معاينة",
    print: "طباعة",
    stats: {
      teachers: "المعلمون",
      classes: "الفروع",
      subjects: "المواد",
      rooms: "القاعات",
      lessons: "الحصص",
      periods: "الحصص الزمنية"
    },
    reports_page: {
      title: "التقارير والإحصائيات",
      print_report: "طباعة التقرير",
      teacher_load: "نصاب الأساتذة",
      room_usage: "إشغال القاعات",
      class_summary: "ملخص الفروع"
    },
    institution_page: {
      title: "بيانات المؤسسة",
      subtitle: "المعلومات التي تظهر في ترويسة التقارير",
      name: "اسم المؤسسة",
      subName: "الاسم الفرعي / العنوان",
      address: "العنوان الكامل",
      phone: "رقم الهاتف",
      email: "البريد الإلكتروني"
    },
    // New translation keys for Reports page
    republic: "الجمهورية الجزائرية الديمقراطية الشعبية",
    centerName: "مركز التكوين المهني والتمهين",
    centerLocation: "الدبيلة، الوادي",
    department: "المصلحة",
    attendanceSheet: "سجل الحضور",
    number: "الرقم",
    employeeName: "اسم الموظف",
    signature: "التوقيع",
    notes: "ملاحظات",
    managerSignature: "توقيع المدير",
    dailyReport: "تقرير يومي",
    monthlyReport: "تقرير شهري",
    monthlyStats: "إحصائيات شهرية",
    selectDate: "اختر التاريخ",
    selectMonth: "اختر الشهر",
    applyToPeriods: "تطبيق على الفترات",
    orientation: "الاتجاه",
    portrait: "عمودي",
    landscape: "أفقي",
    noAssignments: "لا توجد توزيعات لهذا الشهر"
  },
  en: {
    dashboard: "Dashboard",
    schedule: "Schedule",
    weeklyWorkSchedule: "Weekly Work Schedule",
    employees: "Teachers",
    classes: "Branches",
    subjects: "Subjects",
    rooms: "Rooms",
    lessons: "Lessons",
    reports: "Reports",
    importXml: "Import XML",
    users: "Users",
    institution: "Institution",
    logout: "Logout",
    welcome: "Welcome,",
    role: "Role:",
    admin: "Admin",
    appTitle: "Schedule Manager",
    appSubtitle: "aSc XML Database Explorer",
    settings: "Settings",
    cancel: "Cancel",
    save: "Save",
    morning: "Morning",
    afternoon: "Afternoon",
    evening: "Evening",
    search: "Search...",
    preview: "Preview",
    print: "Print",
    stats: {
      teachers: "Teachers",
      classes: "Branches",
      subjects: "Subjects",
      rooms: "Rooms",
      lessons: "Lessons",
      periods: "Time Periods"
    },
    reports_page: {
      title: "Reports & Statistics",
      print_report: "Print Report",
      teacher_load: "Teacher Load",
      room_usage: "Room Usage",
      class_summary: "Branches Summary"
    },
    institution_page: {
      title: "Institution Details",
      subtitle: "Information displayed in report headers",
      name: "Institution Name",
      subName: "Sub-name / Title",
      address: "Full Address",
      phone: "Phone Number",
      email: "Email Address"
    },
    // New translation keys for Reports page
    republic: "People's Democratic Republic of Algeria",
    centerName: "Professional Training and Internship Center",
    centerLocation: "Dibbia, Oued",
    department: "Department",
    attendanceSheet: "Attendance Sheet",
    number: "Number",
    employeeName: "Employee Name",
    signature: "Signature",
    notes: "Notes",
    managerSignature: "Manager Signature",
    dailyReport: "Daily Report",
    monthlyReport: "Monthly Report",
    monthlyStats: "Monthly Statistics",
    selectDate: "Select Date",
    selectMonth: "Select Month",
    applyToPeriods: "Apply to Periods",
    orientation: "Orientation",
    portrait: "Portrait",
    landscape: "Landscape",
    noAssignments: "No assignments for this month"
  }
};