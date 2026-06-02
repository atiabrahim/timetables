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
import { Printer, Calendar, FileText, Eye, BarChart2, Layout as LayoutIcon, Clock, Info, AlertCircle } from "lucide-react";
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
    getEffectiveAssignment,
    departments,
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
    headerSize: 14,
    titleSize: 22,
    tableSize: 13,
    footerSize: 14,
    orientation: "portrait" as "portrait" | "landscape"
  });

  const currentLocale = language === "ar" ? ar : enUS;

  const supervisors = useMemo(() => {
    return [isRTL ? "رئيس مصلحة التكوين" : "Head of Training Department"];
  }, [isRTL]);

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

  const getPeriodRangeHint = (period: PeriodPart) => {
    if (period === "Morning") return isRTL ? "(1 - 4)" : "(1 - 4)";
    if (period === "Afternoon") return isRTL ? "(5 - 7)" : "(5 - 7)";
    if (period === "Evening") return isRTL ? "(8 - 10)" : "(8 - 10)";
    return "";
  };

  const reportContainerStyle = {
    fontFamily: reportStyles.fontFamily
  };

  const renderAttendanceSheet = (date: Date, period: PeriodPart) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const assignedIds = getEffectiveAssignment(dateStr, period);
    
    const assignedEmployees = assignedIds
      .map(id => employees.find(e => e.id === id))
      .filter(Boolean)
      .sort((a, b) => {
        const nameA = `${a!.lastName} ${a!.firstName}`.toLowerCase();
        const nameB = `${b!.lastName} ${b!.firstName}`.toLowerCase();
        return nameA.localeCompare(nameB, language === "ar" ? "ar" : "en");
      });
    
    // إذا لم تكن هناك بيانات، نظهر إطاراً مع تنبيه بدلاً من null
    const isEmpty = assignedEmployees.length === 0;

    return (
      <div 
        key={`${dateStr}-${period}`}
        className={cn(
          "bg-white p-10 mb-12 mx-auto shadow-2xl border border-slate-100 rounded-[2rem] page-break-container max-w-[210mm]",
          "print:shadow-none print:border-0 print:m-0 print:p-0 print:w-full print:h-full print:flex print:flex-col print:justify-between print:rounded-none"
        )}
        dir={isRTL ? "rtl" : "ltr"}
        style={reportContainerStyle}
      >
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-6 space-y-1" style={{ fontSize: `${reportStyles.headerSize}px` }}>
          <p className="font-black text-slate-900 tracking-tight">{t.republic}</p>
          <p className="font-bold text-slate-800">{t.centerName}</p>
          <p className="font-bold text-slate-700">{t.centerLocation}</p>
        </div>

        <div className={cn("mb-6 flex justify-between items-center border-b-2 border-slate-900 pb-3", isRTL ? "flex-row" : "flex-row-reverse")} style={{ fontSize: `${reportStyles.headerSize}px` }}>
          <div className="flex flex-col gap-1">
            <p className="font-black text-slate-950">
              {t.department}: <span className="font-bold text-emerald-800">{departments[0] || (isRTL ? "مصلحة التكوين" : "Training Dept")}</span>
            </p>
          </div>
          <div className="text-end">
            <p className="font-black text-slate-950">
              {isRTL ? "السنة الدراسية:" : "Academic Year:"}: <span className="font-bold text-emerald-800">2023/2024</span>
            </p>
          </div>
        </div>

        {/* Title Section */}
        <div className="text-center mb-8">
          <h1 className="font-black text-slate-900 mb-4 underline underline-offset-8 decoration-2" style={{ fontSize: `${reportStyles.titleSize}px` }}>
            {t.attendanceSheet}
          </h1>
          <div className="flex justify-center items-center gap-6 bg-emerald-50/50 py-3 px-8 rounded-2xl inline-flex mx-auto border border-emerald-100 shadow-sm">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-emerald-600" />
              <p className="text-slate-900 font-black" style={{ fontSize: `${reportStyles.headerSize + 2}px` }}>
                {format(date, "EEEE, d MMMM yyyy", { locale: currentLocale })}
              </p>
            </div>
            <span className="text-emerald-200 h-6 w-px bg-emerald-200"></span>
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-emerald-600" />
              <p className="font-black text-emerald-800" style={{ fontSize: `${reportStyles.headerSize + 2}px` }}>
                {period === "Morning" ? t.morning : period === "Afternoon" ? t.afternoon : t.evening}
                <span className="mx-2 opacity-50 text-[10px]">{getPeriodRangeHint(period)}</span>
              </p>
            </div>
          </div>
        </div>
        
        {/* Table Section */}
        <div className="flex-1 overflow-visible">
          {isEmpty ? (
            <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 print:border-slate-950 print:bg-white">
               <AlertCircle className="text-amber-500 mb-3 print:hidden" size={32} />
               <p className="font-bold text-slate-400 print:text-slate-950">{isRTL ? "لا توجد تكليفات حضور لهذه الفترة" : "No attendance assignments for this period"}</p>
               <p className="text-[10px] text-slate-400 mt-1 print:hidden">{isRTL ? "يرجى استيراد البيانات أو التكليف اليدوي" : "Please import data or assign manually"}</p>
            </div>
          ) : (
            <Table className="w-full border-collapse border-2 border-slate-950" style={{ fontSize: `${reportStyles.tableSize}px` }}>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50 border-b-2 border-slate-950 h-12">
                  <TableHead className={cn("w-[60px] text-center font-black text-slate-950 border-e-2 border-slate-950 py-1")}>{t.number}</TableHead>
                  <TableHead className={cn("text-center font-black text-slate-950 border-e-2 border-slate-950 py-1 px-6", isRTL ? "text-right" : "text-left")}>{t.employeeName}</TableHead>
                  <TableHead className={cn("w-[160px] text-center font-black text-slate-950 border-e-2 border-slate-950 py-1")}>{t.signature}</TableHead>
                  <TableHead className="text-center font-black text-slate-950 py-1 w-[220px]">{t.notes}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignedEmployees.map((emp, idx) => (
                  <TableRow key={emp?.id} className="hover:bg-transparent border-b-2 border-slate-950 h-11">
                    <TableCell className="text-center font-black border-e-2 border-slate-950 p-1 bg-slate-50/30">{idx + 1}</TableCell>
                    <TableCell className={cn("font-black border-e-2 border-slate-950 p-1 px-6 text-slate-900", isRTL ? "text-right" : "text-left")}>
                      {emp?.lastName} {emp?.firstName}
                    </TableCell>
                    <TableCell className="border-e-2 border-slate-950 p-1"></TableCell>
                    <TableCell className="p-1"></TableCell>
                  </TableRow>
                ))}
                {Array.from({ length: emptyRowsCount }).map((_, i) => (
                  <TableRow key={`empty-${i}`} className="hover:bg-transparent border-b-2 border-slate-950 h-11">
                    <TableCell className="text-center border-e-2 border-slate-950 p-1 font-bold text-slate-400 bg-slate-50/10">
                      {assignedEmployees.length + i + 1}
                    </TableCell>
                    <TableCell className="border-e-2 border-slate-950 p-1"></TableCell>
                    <TableCell className="border-e-2 border-slate-950 p-1"></TableCell>
                    <TableCell className="p-1"></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Footer Section */}
        <div className="mt-10 grid grid-cols-2 gap-16 pt-6 border-t border-dashed border-slate-300" style={{ fontSize: `${reportStyles.footerSize}px` }}>
          <div className="text-center">
            <p className="font-black text-slate-950 mb-16 underline underline-offset-4">{supervisors[0]}</p>
            <div className="border-t-2 border-slate-900 w-40 mx-auto"></div>
          </div>
          <div className="text-center">
            <p className="font-black text-slate-950 mb-16 underline underline-offset-4">{t.managerSignature}</p>
            <div className="border-t-2 border-slate-900 w-40 mx-auto"></div>
          </div>
        </div>

        <div className="mt-8 pt-4 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest border-t border-slate-50">
          Generated via EduSchedule Pro v2.5 — {format(new Date(), "yyyy-MM-dd HH:mm")}
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
      <div className="space-y-12 print:space-y-0 w-full flex flex-col items-center">
        {activePeriods.map((period) => renderAttendanceSheet(date, period))}
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
    
    days.forEach((day) => {
      const currentDayIdx = getDay(day);
      periods.forEach((period) => {
        if (selectedPeriods.includes(period) && periodConfigs.find(c => c.day === currentDayIdx && c.period === period)?.isActive) {
          const sheet = renderAttendanceSheet(day, period);
          if (sheet) sheets.push(sheet);
        }
      });
    });
    
    return (
      <div className="space-y-12 print:space-y-0 w-full flex flex-col items-center">
        {sheets.length > 0 ? sheets : (
          <div className="text-center p-20 bg-white rounded-[2rem] border border-dashed border-slate-200 w-full max-w-4xl">
            <Info className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-slate-400 font-bold">{t.noAssignments}</p>
          </div>
        )}
      </div>
    );
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
      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-xl mx-auto w-full max-w-4xl print:border-0 print:shadow-none print:p-0" dir={isRTL ? "rtl" : "ltr"} style={reportContainerStyle}>
        <div className="text-center mb-8 border-b-2 border-emerald-900 pb-4">
          <h3 className="text-2xl font-black text-slate-950 mb-2">{t.monthlyStats}</h3>
          <div className="inline-flex items-center gap-2 bg-emerald-50 px-4 py-1 rounded-full text-emerald-700 font-bold">
            <Calendar size={16} />
            {format(date, "MMMM yyyy", { locale: currentLocale })}
          </div>
        </div>
        <Table className="border-2 border-slate-950 w-full">
          <TableHeader>
            <TableRow className="bg-slate-100 border-b-2 border-slate-950">
              <TableHead className={cn("font-black text-slate-950 border-e-2 border-slate-950 py-3 px-6", isRTL ? "text-right" : "text-left")}>{t.employeeName}</TableHead>
              <TableHead className="text-center font-black text-slate-950 border-e-2 border-slate-950 py-3">{t.morning} (1-4)</TableHead>
              <TableHead className="text-center font-black text-slate-950 border-e-2 border-slate-950 py-3">{t.afternoon} (5-7)</TableHead>
              <TableHead className="text-center font-black text-slate-950 border-e-2 border-slate-950 py-3">{t.evening} (8-10)</TableHead>
              <TableHead className="text-center font-black text-white bg-slate-900 py-3">{t.total}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.map(s => (
              <TableRow key={s.id} className="hover:bg-emerald-50/30 border-b-2 border-slate-950">
                <TableCell className={cn("font-bold text-slate-900 border-e-2 border-slate-950 p-3 px-6", isRTL ? "text-right" : "text-left")}>{s.lastName} {s.firstName}</TableCell>
                <TableCell className="text-center font-bold border-e-2 border-slate-950 p-3">{s.morning}</TableCell>
                <TableCell className="text-center font-bold border-e-2 border-slate-950 p-3">{s.afternoon}</TableCell>
                <TableCell className="text-center font-bold border-e-2 border-slate-950 p-3">{s.evening}</TableCell>
                <TableCell className="text-center font-black p-3 bg-slate-50">{s.total}</TableCell>
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
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 print:hidden">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-slate-950 tracking-tight">{t.reports}</h2>
          <p className="text-slate-500 font-medium">إصدار أوراق حضور وجداول إحصائية رسمية</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="lg" className="rounded-2xl border-slate-200 hover:bg-slate-50 font-bold gap-2 h-12 px-6" onClick={() => setIsPreviewOpen(true)}>
            <Eye className="h-5 w-5 text-emerald-600" />
            {t.preview}
          </Button>
          <Button size="lg" onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black gap-2 h-12 px-8 shadow-lg shadow-emerald-100">
            <Printer className="h-5 w-5" />
            {t.print}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 print:hidden">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <Label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <LayoutIcon size={14} />
            {t.orientation}
          </Label>
          <Select value={reportStyles.orientation} onValueChange={(v: any) => updateOrientation(v)}>
            <SelectTrigger className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="portrait">{t.portrait}</SelectItem>
              <SelectItem value="landscape">{t.landscape}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 md:col-span-3">
          <Label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Clock size={14} />
            {t.applyToPeriods}
          </Label>
          <div className="flex flex-wrap gap-8 pt-2">
            {[
              { id: "Morning", label: t.morning, range: "1-4" },
              { id: "Afternoon", label: t.afternoon, range: "5-7" },
              { id: "Evening", label: t.evening, range: "8-10" }
            ].map(p => (
              <div key={p.id} className="flex items-center gap-3 cursor-pointer group" onClick={() => togglePeriod(p.id as PeriodPart)}>
                <Checkbox 
                  id={`filter-${p.id}`} 
                  checked={selectedPeriods.includes(p.id as PeriodPart)} 
                  className="rounded-md border-slate-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                />
                <div className="flex flex-col">
                  <Label htmlFor={`filter-${p.id}`} className="text-sm font-black text-slate-700 cursor-pointer group-hover:text-emerald-600 transition-colors">
                    {p.label}
                  </Label>
                  <span className="text-[10px] font-bold text-slate-400">{p.range}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Tabs defaultValue="daily" onValueChange={setActiveTab} className="w-full print:hidden">
        <TabsList className="grid w-full grid-cols-3 mb-10 h-16 bg-white border border-slate-200 p-2 rounded-3xl shadow-sm">
          <TabsTrigger value="daily" className="flex items-center gap-2 font-black rounded-2xl data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
            <Calendar className="h-5 w-5" />
            {t.dailyReport}
          </TabsTrigger>
          <TabsTrigger value="monthly" className="flex items-center gap-2 font-black rounded-2xl data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
            <FileText className="h-5 w-5" />
            {t.monthlyReport}
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2 font-black rounded-2xl data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
            <BarChart2 className="h-5 w-5" />
            {t.monthlyStats}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="daily" className="space-y-8 animate-in fade-in duration-500">
          <div className="flex items-center gap-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm max-w-md">
            <div className="bg-emerald-50 p-3 rounded-2xl">
              <Calendar className="text-emerald-600" size={24} />
            </div>
            <div className="space-y-1.5 flex-1">
              <Label htmlFor="daily-date" className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.selectDate}</Label>
              <Input 
                id="daily-date" 
                type="date" 
                className="h-10 border-none bg-transparent p-0 font-black text-lg focus-visible:ring-0" 
                value={dailyDate} 
                onChange={(e) => setDailyDate(e.target.value)} 
              />
            </div>
          </div>
          <div className="bg-slate-50/50 p-8 md:p-12 rounded-[3rem] border border-slate-100 shadow-inner min-h-[600px] flex flex-col items-center">
            {renderDailyReport()}
          </div>
        </TabsContent>
        
        <TabsContent value="monthly" className="space-y-8 animate-in fade-in duration-500">
          <div className="flex items-center gap-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm max-w-md">
            <div className="bg-emerald-50 p-3 rounded-2xl">
              <FileText className="text-emerald-600" size={24} />
            </div>
            <div className="space-y-1.5 flex-1">
              <Label htmlFor="monthly-date" className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.selectMonth}</Label>
              <Input 
                id="monthly-date" 
                type="month" 
                className="h-10 border-none bg-transparent p-0 font-black text-lg focus-visible:ring-0" 
                value={monthlyDate} 
                onChange={(e) => setMonthlyDate(e.target.value)} 
              />
            </div>
          </div>
          <div className="bg-slate-50/50 p-8 md:p-12 rounded-[3rem] border border-slate-100 shadow-inner min-h-[600px] flex flex-col items-center">
            {renderMonthlyReport()}
          </div>
        </TabsContent>
        
        <TabsContent value="stats" className="space-y-8 animate-in fade-in duration-500">
          <div className="flex items-center gap-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm max-w-md">
            <div className="bg-emerald-50 p-3 rounded-2xl">
              <BarChart2 className="text-emerald-600" size={24} />
            </div>
            <div className="space-y-1.5 flex-1">
              <Label htmlFor="stats-date" className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.selectMonth}</Label>
              <Input 
                id="stats-date" 
                type="month" 
                className="h-10 border-none bg-transparent p-0 font-black text-lg focus-visible:ring-0" 
                value={monthlyDate} 
                onChange={(e) => setMonthlyDate(e.target.value)} 
              />
            </div>
          </div>
          <div className="bg-slate-50/50 p-8 md:p-12 rounded-[3rem] border border-slate-100 shadow-inner min-h-[600px] flex flex-col items-center">
            {renderStatsReport()}
          </div>
        </TabsContent>
      </Tabs>

      {/* Hidden container for direct printing */}
      <div className="print-content-master hidden print:block">
        {currentReportContent()}
      </div>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-[98vw] w-full h-[95vh] overflow-hidden bg-zinc-900/95 border-none p-0 rounded-none flex flex-col">
          <div className="bg-black/40 p-4 border-b border-white/10 flex justify-between items-center shrink-0 print:hidden">
            <div className="flex items-center gap-3 text-white">
              <Eye className="text-emerald-500" />
              <h3 className="font-black text-lg">{t.printPreview}</h3>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setOrientation("portrait")}
                  className={cn("text-white font-bold h-9 px-4 rounded-lg", reportStyles.orientation === "portrait" && "bg-emerald-600")}
                >
                  {t.portrait}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setOrientation("landscape")}
                  className={cn("text-white font-bold h-9 px-4 rounded-lg", reportStyles.orientation === "landscape" && "bg-emerald-600")}
                >
                  {t.landscape}
                </Button>
              </div>
              <Button onClick={handlePrint} size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-10 rounded-xl h-11">
                <Printer className="h-5 w-5 me-2" />
                {t.print}
              </Button>
              <Button variant="ghost" onClick={() => setIsPreviewOpen(false)} className="text-white/50 hover:text-white">
                <Info size={24} />
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-12 bg-zinc-950/50 flex flex-col items-center print:bg-white print:p-0">
            <div className="w-full flex flex-col items-center gap-12 print:gap-0 print:block">
              {currentReportContent()}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <style>
        {`
          @media print {
            /* Hide UI components during print */
            body > div:not([data-radix-portal]), 
            header, 
            aside, 
            main,
            .print\\:hidden { 
              display: none !important; 
            }
            
            /* Show portal (preview dialog) content if it exists */
            div[data-radix-portal] { 
              display: block !important;
              visibility: visible !important; 
              position: absolute !important; 
              left: 0 !important; 
              top: 0 !important; 
              width: 100% !important; 
              background: white !important;
            }

            /* Show our print-content-master if we're not using the dialog */
            .print-content-master { 
              display: block !important;
              visibility: visible !important;
              width: 100% !important;
            }

            /* Fix report container for A4 printing */
            .page-break-container {
              page-break-after: always !important;
              break-after: page !important;
              min-height: 290mm !important;
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 10mm 15mm !important;
              box-shadow: none !important;
              border: none !important;
              background: white !important;
            }
            
            @page {
              size: A4 ${reportStyles.orientation};
              margin: 0 !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default ReportsNew;