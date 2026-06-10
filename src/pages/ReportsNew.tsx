import React, { useState, useMemo, useEffect } from "react";
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
import { Printer, Calendar, FileText, Eye, BarChart2, Info } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { PeriodPart } from "@/types";
import AttendanceSheet from "@/components/reports/AttendanceSheet";
import ReportControls from "@/components/reports/ReportControls";
import PrintPreviewDialog from "@/components/reports/PrintPreviewDialog";
import PageHeader from "../components/shared/PageHeader";
import OfficialPrintWrapper from "../components/shared/OfficialPrintWrapper";

const ReportsNew = () => {
  const { 
    employees, 
    periodConfigs, 
    getEffectiveAssignment,
    departments,
    isRTL,
    t,
    language
  } = useApp();

  const defaultDept = useMemo(() => isRTL ? "مديرية الدراسات والتربصات" : "Studies Directorate", [isRTL]);

  const [dailyDate, setDailyDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [monthlyDate, setMonthlyDate] = useState(format(new Date(), "yyyy-MM"));
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("daily");
  const [selectedPeriods, setSelectedPeriods] = useState<PeriodPart[]>(["Morning", "Afternoon", "Evening"]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [reportStyles, setReportStyles] = useState({
    fontFamily: "'Cairo', sans-serif",
    headerSize: 14,
    titleSize: 22,
    tableSize: 13,
    footerSize: 14,
    orientation: "portrait" as "portrait" | "landscape",
    doubleMode: false
  });

  // Initialize selectedDepartment when departments are loaded
  useEffect(() => {
    if (departments && departments.length > 0) {
      const firstDept = departments[0];
      setSelectedDepartment(typeof firstDept === 'string' ? firstDept : firstDept.name);
    } else {
      setSelectedDepartment(defaultDept);
    }
  }, [departments, defaultDept]);

  const currentLocale = language === "ar" ? ar : enUS;
  const supervisors = useMemo(() => [isRTL ? "رئيس مصلحة التكوين" : "Head of Training"], [isRTL]);

  const togglePeriod = (period: PeriodPart) => {
    setSelectedPeriods(prev => 
      prev.includes(period) ? prev.filter(p => p !== period) : [...prev, period]
    );
  };

  const getSheetData = (date: Date, period: PeriodPart) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const assignedIds = getEffectiveAssignment(dateStr, period);
    return assignedIds
      .map(id => employees.find(e => e.id === id))
      .filter(Boolean)
      .sort((a, b) => {
        const nameA = `${a!.lastName} ${a!.firstName}`.toLowerCase();
        const nameB = `${b!.lastName} ${b!.firstName}`.toLowerCase();
        return nameA.localeCompare(nameB, language === "ar" ? "ar" : "en");
      });
  };

  const activeDept = selectedDepartment || (departments[0] ? (typeof departments[0] === 'string' ? departments[0] : departments[0].name) : defaultDept);

  const renderDailyReport = () => {
    const date = parseISO(dailyDate);
    if (!isValid(date)) return null;
    const dayIdx = getDay(date);
    const periods: PeriodPart[] = ["Morning", "Afternoon", "Evening"];
    const activePeriods = periods.filter(p => 
      selectedPeriods.includes(p) && 
      periodConfigs.find(c => c.day === dayIdx && c.period === p)?.isActive
    );
    return activePeriods.map(p => {
      const assigned = getSheetData(date, p);
      if (assigned.length === 0) return null; // تخطي الفترات الفارغة في التقرير اليومي
      return (
        <AttendanceSheet 
          key={`${dailyDate}-${p}`}
          date={date}
          period={p}
          assignedEmployees={assigned}
          t={t}
          isRTL={isRTL}
          currentLocale={currentLocale}
          selectedDepartment={activeDept}
          reportStyles={reportStyles}
          doubleMode={reportStyles.doubleMode}
          supervisors={supervisors}
        />
      );
    }).filter(Boolean);
  };

  const renderMonthlyReport = () => {
    const [year, month] = monthlyDate.split("-").map(Number);
    const date = new Date(year, month - 1, 1);
    if (!isValid(date)) return null;
    const days = eachDayOfInterval({ start: startOfMonth(date), end: endOfMonth(date) });
    const periods: PeriodPart[] = ["Morning", "Afternoon", "Evening"];
    const sheets: React.ReactNode[] = [];
    
    days.forEach((day) => {
      const dayIdx = getDay(day);
      periods.forEach((p) => {
        if (selectedPeriods.includes(p) && periodConfigs.find(c => c.day === dayIdx && c.period === p)?.isActive) {
          const assigned = getSheetData(day, p);
          if (assigned.length > 0) { // تخطي الفترات الفارغة في التقرير الشهري
            sheets.push(
              <AttendanceSheet 
                key={`${format(day, 'yyyy-MM-dd')}-${p}`}
                date={day}
                period={p}
                assignedEmployees={assigned}
                t={t}
                isRTL={isRTL}
                currentLocale={currentLocale}
                selectedDepartment={activeDept}
                reportStyles={reportStyles}
                doubleMode={reportStyles.doubleMode}
                supervisors={supervisors}
              />
            );
          }
        }
      });
    });
    
    return sheets.length > 0 ? sheets : (
      <div className="text-center p-6 bg-white rounded-2xl border border-dashed border-slate-200 w-full max-w-4xl">
        <Info className="mx-auto text-slate-200 mb-1" size={28} />
        <p className="text-slate-400 font-bold text-xs">{t.noAssignments}</p>
      </div>
    );
  };

  const renderStatsReport = () => {
    const [year, month] = monthlyDate.split("-").map(Number);
    const days = eachDayOfInterval({ start: startOfMonth(new Date(year, month - 1, 1)), end: endOfMonth(new Date(year, month - 1, 1)) });
    
    const stats = employees.map(emp => {
      let m = 0, a = 0, e = 0;
      days.forEach(day => {
        const dateStr = format(day, "yyyy-MM-dd");
        ["Morning", "Afternoon", "Evening"].forEach(p => {
          if (selectedPeriods.includes(p as PeriodPart) && getEffectiveAssignment(dateStr, p as PeriodPart).includes(emp.id)) {
            if (p === "Morning") m++; else if (p === "Afternoon") a++; else e++;
          }
        });
      });
      return { ...emp, m, a, e, total: m + a + e };
    }).sort((a, b) => b.total - a.total);

    const subtitle = (
      <div className="inline-flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
        <Calendar size={14} />
        {format(new Date(year, month - 1, 1), "MMMM yyyy", { locale: currentLocale })}
      </div>
    );

    return (
      <OfficialPrintWrapper
        title={t.monthlyStats}
        subtitle={subtitle}
        orientation={reportStyles.orientation}
        doubleMode={reportStyles.doubleMode}
        leftSignatureTitle={isRTL ? "المسؤول البيداغوجي" : "Pedagogical Supervisor"}
        rightSignatureTitle={isRTL ? "ختم وتوقيع المدير" : "Director Signature"}
      >
        <Table className="border-4 border-slate-950 w-full">
          <TableHeader>
            <TableRow className="bg-slate-100 border-b-4 border-slate-950">
              <TableHead className={cn("font-black text-slate-950 border-e-4 border-slate-950 p-2 text-xs w-[240px] whitespace-nowrap", isRTL ? "text-right" : "text-left")}>{t.employeeName}</TableHead>
              <TableHead className="text-center font-black text-slate-950 border-e-4 border-slate-950 p-2 text-xs">ص</TableHead>
              <TableHead className="text-center font-black text-slate-950 border-e-4 border-slate-950 p-2 text-xs">م</TableHead>
              <TableHead className="text-center font-black text-slate-950 border-e-4 border-slate-950 p-2 text-xs">ل</TableHead>
              <TableHead className="text-center font-black text-white bg-slate-950 p-2 text-xs">{t.total}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.map(s => (
              <TableRow key={s.id} className="border-b-2 border-slate-950">
                <TableCell className={cn("font-bold border-e-2 border-slate-950 p-2 text-xs whitespace-nowrap", isRTL ? "text-right" : "text-left")}>{s.lastName} {s.firstName}</TableCell>
                <TableCell className="text-center border-e-2 border-slate-950 p-2 text-xs">{s.m}</TableCell>
                <TableCell className="text-center border-e-2 border-slate-950 p-2 text-xs">{s.a}</TableCell>
                <TableCell className="text-center border-e-2 border-slate-950 p-2 text-xs">{s.e}</TableCell>
                <TableCell className="text-center font-black p-2 bg-slate-50 text-xs">{s.total}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </OfficialPrintWrapper>
    );
  };

  const currentContent = () => {
    if (activeTab === "daily") return renderDailyReport();
    if (activeTab === "monthly") return renderMonthlyReport();
    return renderStatsReport();
  };

  return (
    <div className="space-y-2 pb-2">
      <PageHeader
        title={t.reports}
        subtitle="إصدار أوراق حضور وجداول إحصائية رسمية"
        icon={FileText}
        isRTL={isRTL}
      >
        <Button variant="outline" size="sm" className="rounded-xl border-slate-200 font-bold gap-1.5 h-10 px-4 bg-white text-xs" onClick={() => setIsPreviewOpen(true)}>
          <Eye className="h-4 w-4 text-emerald-600" />
          {t.preview}
        </Button>
        <Button size="sm" onClick={() => window.print()} className="bg-emerald-600 text-white rounded-xl font-black gap-1.5 h-10 px-5 shadow-md shadow-emerald-100 text-xs">
          <Printer className="h-4 w-4" />
          {t.print}
        </Button>
      </PageHeader>
      
      <ReportControls
        t={t}
        isRTL={isRTL}
        orientation={reportStyles.orientation}
        onOrientationChange={(v) => setReportStyles({...reportStyles, orientation: v})}
        doubleMode={reportStyles.doubleMode}
        onDoubleModeChange={(v) => setReportStyles({...reportStyles, doubleMode: v})}
        departments={departments}
        selectedDepartment={activeDept}
        onDepartmentChange={setSelectedDepartment}
        selectedPeriods={selectedPeriods}
        onTogglePeriod={togglePeriod}
      />

      <Tabs defaultValue="daily" onValueChange={setActiveTab} className="w-full print:hidden">
        <TabsList className="grid w-full grid-cols-3 mb-2 h-11 bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
          <TabsTrigger value="daily" className="flex items-center gap-1.5 font-black rounded-lg data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-[11px]">
            <Calendar className="h-3.5 w-3.5" /> {t.dailyReport}
          </TabsTrigger>
          <TabsTrigger value="monthly" className="flex items-center gap-1.5 font-black rounded-lg data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-[11px]">
            <FileText className="h-3.5 w-3.5" /> {t.monthlyReport}
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-1.5 font-black rounded-lg data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-[11px]">
            <BarChart2 className="h-3.5 w-3.5" /> {t.monthlyStats}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="daily" className="space-y-2">
          <Input type="date" value={dailyDate} onChange={(e) => setDailyDate(e.target.value)} className="max-w-xs h-9 rounded-lg text-xs" />
          <div className="bg-slate-50/50 p-2 rounded-xl border border-slate-100 flex flex-col items-center gap-2">
            {renderDailyReport()}
          </div>
        </TabsContent>
        <TabsContent value="monthly" className="space-y-2">
          <Input type="month" value={monthlyDate} onChange={(e) => setMonthlyDate(e.target.value)} className="max-w-xs h-9 rounded-lg text-xs" />
          <div className="bg-slate-50/50 p-2 rounded-xl border border-slate-100 flex flex-col items-center gap-2">
            {renderMonthlyReport()}
          </div>
        </TabsContent>
        <TabsContent value="stats" className="space-y-2">
          <Input type="month" value={monthlyDate} onChange={(e) => setMonthlyDate(e.target.value)} className="max-w-xs h-9 rounded-lg text-xs" />
          <div className="bg-slate-50/50 p-2 rounded-xl border border-slate-100 flex flex-col items-center gap-2">
            {renderStatsReport()}
          </div>
        </TabsContent>
      </Tabs>

      <div className="print-content-master hidden print:block">
        {currentContent()}
      </div>

      <PrintPreviewDialog
        isOpen={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        t={t}
        orientation={reportStyles.orientation}
        onToggleOrientation={() => setReportStyles({...reportStyles, orientation: reportStyles.orientation === 'portrait' ? 'landscape' : 'portrait'})}
        doubleMode={reportStyles.doubleMode}
        onToggleDoubleMode={() => setReportStyles({...reportStyles, doubleMode: !reportStyles.doubleMode})}
        onPrint={() => window.print()}
      >
        {currentContent()}
      </PrintPreviewDialog>
    </div>
  );
};

export default ReportsNew;