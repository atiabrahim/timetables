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
import { Printer, Calendar, FileText, Eye, BarChart2, Layout as LayoutIcon } from "lucide-react";
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
    titleSize: 20,
    tableSize: 12,
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

  const reportContainerStyle = {
    fontFamily: reportStyles.fontFamily
  };

  const renderAttendanceSheet = (date: Date, period: PeriodPart, isLast: boolean) => {
    const dateStr = format(date, "yyyy-MM-dd");
    // Use context function which now returns unique IDs
    const assignedIds = getEffectiveAssignment(dateStr, period);
    
    const assignedEmployees = assignedIds
      .map(id => employees.find(e => e.id === id))
      .filter(Boolean)
      .sort((a, b) => {
        const nameA = `${a!.lastName} ${a!.firstName}`.toLowerCase();
        const nameB = `${b!.lastName} ${b!.firstName}`.toLowerCase();
        return nameA.localeCompare(nameB, language === "ar" ? "ar" : "en");
      });
    
    if (assignedEmployees.length === 0) return null;

    const maxRows = 15;
    const emptyRowsCount = Math.max(0, maxRows - assignedEmployees.length);

    return (
      <div 
        key={`${dateStr}-${period}`}
        className={cn(
          "bg-white p-8 mb-8 mx-auto shadow-sm border border-slate-100 rounded-2xl page-break-container",
          "print:shadow-none print:border-0 print:m-0 print:p-0 print:w-full print:h-full print:flex print:flex-col print:justify-between"
        )}
        dir={isRTL ? "rtl" : "ltr"}
        style={reportContainerStyle}
      >
        <div className="text-center mb-4 space-y-1" style={{ fontSize: `${reportStyles.headerSize}px` }}>
          <p className="font-black text-slate-900 leading-tight">{t.republic}</p>
          <p className="font-bold text-slate-800 leading-tight">{t.centerName}</p>
          <p className="font-bold text-slate-700 leading-tight">{t.centerLocation}</p>
        </div>

        <div className={cn("mb-3 flex justify-between items-center border-b pb-2", isRTL ? "flex-row" : "flex-row-reverse")} style={{ fontSize: `${reportStyles.headerSize}px` }}>
          <p className="font-bold text-slate-900">
            {t.department}: <span className="font-normal">{departments[0] || (isRTL ? "مصلحة التكوين" : "Training Dept")}</span>
          </p>
          <p className="font-bold text-slate-900">
            {isRTL ? "السنة الدراسية:" : "Academic Year:"} <span className="font-normal">2023/2024</span>
          </p>
        </div>

        <div className="text-center mb-4">
          <h1 className="font-black text-slate-900 mb-2" style={{ fontSize: `${reportStyles.titleSize}px` }}>{t.attendanceSheet}</h1>
          <div className="flex justify-center items-center gap-4 bg-slate-50 py-2 px-4 rounded-xl inline-flex mx-auto border border-slate-100">
            <p className="text-slate-800 font-black" style={{ fontSize: `${reportStyles.headerSize}px` }}>
              {format(date, "EEEE, d MMMM yyyy", { locale: currentLocale })}
            </p>
            <span className="text-slate-300 h-4 w-px bg-slate-300"></span>
            <p className="font-black text-emerald-700" style={{ fontSize: `${reportStyles.headerSize}px` }}>
              {period === "Morning" ? t.morning : period === "Afternoon" ? t.afternoon : t.evening}
            </p>
          </div>
        </div>
        
        <div className="flex-1 overflow-visible">
          <Table className="w-full border-collapse border-2 border-slate-900" style={{ fontSize: `${reportStyles.tableSize}px` }}>
            <TableHeader>
              <TableRow className="bg-slate-100 hover:bg-slate-100 border-b-2 border-slate-900 h-10">
                <TableHead className={cn("w-[50px] text-center font-black text-slate-900 border-e-2 border-slate-900 py-1")}>{t.number}</TableHead>
                <TableHead className={cn("text-center font-black text-slate-900 border-e-2 border-slate-900 py-1", isRTL ? "text-right px-4" : "text-left px-4")}>{t.employeeName}</TableHead>
                <TableHead className={cn("w-[150px] text-center font-black text-slate-900 border-e-2 border-slate-900 py-1")}>{t.signature}</TableHead>
                <TableHead className="text-center font-black text-slate-900 py-1 w-[200px]">{t.notes}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignedEmployees.map((emp, idx) => (
                <TableRow key={emp?.id} className="hover:bg-transparent border-b border-slate-900 h-10">
                  <TableCell className="text-center font-bold border-e-2 border-slate-900 p-1">{idx + 1}</TableCell>
                  <TableCell className={cn("font-bold border-e-2 border-slate-900 p-1 px-4", isRTL ? "text-right" : "text-left")}>
                    {emp?.lastName} {emp?.firstName}
                  </TableCell>
                  <TableCell className="border-e-2 border-slate-900 p-1"></TableCell>
                  <TableCell className="p-1"></TableCell>
                </TableRow>
              ))}
              {Array.from({ length: emptyRowsCount }).map((_, i) => (
                <TableRow key={`empty-${i}`} className="hover:bg-transparent border-b border-slate-900 h-10">
                  <TableCell className="text-center border-e-2 border-slate-900 p-1">{assignedEmployees.length + i + 1}</TableCell>
                  <TableCell className="border-e-2 border-slate-900 p-1"></TableCell>
                  <TableCell className="border-e-2 border-slate-900 p-1"></TableCell>
                  <TableCell className="p-1"></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-12 pt-4 border-t border-dashed border-slate-200" style={{ fontSize: `${reportStyles.footerSize}px` }}>
          <div className="text-center">
            <p className="font-black text-slate-900 mb-12">{supervisors[0]}</p>
            <div className="border-t border-slate-400 w-32 mx-auto"></div>
          </div>
          <div className="text-center">
            <p className="font-black text-slate-900 mb-12">{t.managerSignature}</p>
            <div className="border-t border-slate-400 w-32 mx-auto"></div>
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
      <div className="space-y-8 print:space-y-0">
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
    
    return (
      <div className="space-y-8 print:space-y-0">
        {sheets.length > 0 ? sheets : (
          <div className="text-center p-12 text-slate-400 italic print:hidden">{t.noAssignments}</div>
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
      <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm mx-auto w-full max-w-full print:border-0 print:p-0" dir={isRTL ? "rtl" : "ltr"} style={reportContainerStyle}>
        <div className="text-center mb-6">
          <h3 className="text-xl font-black text-slate-900 mb-1">{t.monthlyStats}</h3>
          <p className="text-emerald-600 font-bold">{format(date, "MMMM yyyy", { locale: currentLocale })}</p>
        </div>
        <Table className="border-2 border-slate-900 w-full">
          <TableHeader>
            <TableRow className="bg-slate-50 border-b-2 border-slate-900">
              <TableHead className={cn("font-bold text-slate-900 border-e-2 border-slate-900 py-2", isRTL ? "text-right px-4" : "text-left px-4")}>{t.employeeName}</TableHead>
              <TableHead className="text-center font-bold text-slate-900 border-e-2 border-slate-900 py-2">{t.morning}</TableHead>
              <TableHead className="text-center font-bold text-slate-900 border-e-2 border-slate-900 py-2">{t.afternoon}</TableHead>
              <TableHead className="text-center font-bold text-slate-900 border-e-2 border-slate-900 py-2">{t.evening}</TableHead>
              <TableHead className="text-center font-bold text-slate-900 py-2">{t.total}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.map(s => (
              <TableRow key={s.id} className="hover:bg-slate-50/50 border-b border-slate-900">
                <TableCell className={cn("font-bold text-slate-700 border-e-2 border-slate-900 p-2 px-4", isRTL ? "text-right" : "text-left")}>{s.lastName} {s.firstName}</TableCell>
                <TableCell className="text-center font-medium border-e-2 border-slate-900 p-2">{s.morning}</TableCell>
                <TableCell className="text-center font-medium border-e-2 border-slate-900 p-2">{s.afternoon}</TableCell>
                <TableCell className="text-center font-medium border-e-2 border-slate-900 p-2">{s.evening}</TableCell>
                <TableCell className="text-center font-black p-2">{s.total}</TableCell>
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
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
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2 md:col-span-2">
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
                  {p === "Morning" ? t.morning : p === "Afternoon" ? t.afternoon : t.evening}
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

      {/* Hidden print-only container used ONLY when dialog is closed or as the primary source */}
      <div className="print-only print-content">{!isPreviewOpen && currentReportContent()}</div>

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

      <style>
        {`
          @media print {
            body > div:not([role="dialog"]):not(.print-content), 
            header, 
            aside, 
            main,
            .print\\:hidden { 
              display: none !important; 
            }
            
            .print-content, .print-content * { 
              visibility: visible !important; 
              -webkit-print-color-adjust: exact !important; 
              print-color-adjust: exact !important;
            }
            
            .print-content { 
              position: absolute !important; 
              left: 0 !important; 
              top: 0 !important; 
              width: 100% !important; 
              margin: 0 !important;
              padding: 0 !important;
            }

            .page-break-container {
              page-break-after: always !important;
              break-after: page !important;
              min-height: 290mm !important;
              box-sizing: border-box !important;
              padding: 10mm !important;
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