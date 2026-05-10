"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Calendar as CalendarIcon, 
  User, 
  MapPin,
  Trash2,
  Printer,
  Clock,
  Eye,
  X,
  RotateCw,
  Maximize2,
  Expand,
  FileText,
  Settings2
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { showSuccess } from "../utils/toast";

const DAYS = [
  { id: 0, name: "الأحد", en: "Sunday" },
  { id: 1, name: "الاثنين", en: "Monday" },
  { id: 2, name: "الثلاثاء", en: "Tuesday" },
  { id: 3, name: "الأربعاء", en: "Wednesday" },
  { id: 4, name: "الخميس", en: "Thursday" },
];

const PERIODS = Array.from({ length: 8 }, (_, i) => (i + 1).toString());

const A4_PORTRAIT = { width: 794, height: 1123 };
const A4_LANDSCAPE = { width: 1123, height: 794 };

const Schedule = () => {
  const { 
    isRTL, t, 
    employees, classes, subjects, rooms, departments,
    assignments, setAssignments,
    periodConfigs 
  } = useApp();

  const [viewMode, setViewMode] = useState<"class" | "teacher">("class");
  const [selectedId, setSelectedId] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [printScale, setPrintScale] = useState(100);
  const [editingCell, setEditingCell] = useState<{day: number, period: string} | null>(null);
  const [showEmptyRows, setShowEmptyRows] = useState(false);
  
  const printRef = useRef<HTMLDivElement>(null);

  const [newAssignment, setNewAssignment] = useState({
    employeeId: "",
    subjectId: "",
    classId: "",
    room: "",
    department: ""
  });

  const filteredAssignments = useMemo(() => {
    return assignments.filter(a => 
      viewMode === "class" ? a.classId === selectedId : a.employeeId === selectedId
    );
  }, [assignments, viewMode, selectedId]);

  const getAssignment = (day: number, period: string) => {
    return filteredAssignments.find(a => a.day === day && a.period === period);
  };

  const visiblePeriods = useMemo(() => {
    if (!selectedId || showEmptyRows) return PERIODS;
    const active = PERIODS.filter(period => 
      DAYS.some(day => !!getAssignment(day.id, period))
    );
    return active.length > 0 ? active : PERIODS;
  }, [filteredAssignments, selectedId, showEmptyRows]);

  const autoFitToPage = () => {
    if (!printRef.current) return;
    const target = orientation === "portrait" ? A4_PORTRAIT : A4_LANDSCAPE;
    const contentWidth = printRef.current.scrollWidth;
    const contentHeight = printRef.current.scrollHeight;
    const scaleW = (target.width / contentWidth) * 0.9;
    const scaleH = (target.height / contentHeight) * 0.9;
    const finalScale = Math.min(scaleW, scaleH) * 100;
    setPrintScale(Math.min(Math.max(Math.floor(finalScale), 40), 150));
  };

  useEffect(() => {
    if (isPreviewOpen) {
      setTimeout(autoFitToPage, 100);
    }
  }, [isPreviewOpen, orientation, selectedId]);

  const handleAddClick = (day: number, period: string) => {
    setEditingCell({ day, period });
    setNewAssignment({
      employeeId: viewMode === "teacher" ? selectedId : "",
      subjectId: "",
      classId: viewMode === "class" ? selectedId : "",
      room: "",
      department: departments[0] || ""
    });
    setIsDialogOpen(true);
  };

  const saveAssignment = () => {
    if (!editingCell) return;
    const id = Math.random().toString(36).substr(2, 9);
    const assignment = { ...newAssignment, id, day: editingCell.day, period: editingCell.period };
    setAssignments([...assignments, assignment]);
    setIsDialogOpen(false);
    showSuccess(isRTL ? "تمت إضافة الحصة بنجاح" : "Lesson added successfully");
  };

  const deleteAssignment = (id: string) => {
    setAssignments(assignments.filter(a => a.id !== id));
    showSuccess(isRTL ? "تم حذف الحصة" : "Lesson deleted");
  };

  const ScheduleTable = ({ isPrint = false }: { isPrint?: boolean }) => (
    <div className={cn(
      "w-full overflow-hidden",
      isPrint ? "border-2 border-emerald-900" : "rounded-3xl border border-emerald-100 bg-white shadow-sm"
    )}>
      <table className="w-full border-collapse table-fixed">
        <thead>
          <tr className={cn(isPrint ? "bg-gray-100" : "bg-emerald-50/50")}>
            <th className={cn(
              "border border-emerald-900/20 text-emerald-900 font-black text-[10px] w-12",
              isPrint ? "p-1" : "p-2"
            )}>
              {isRTL ? "الحصة" : "Period"}
            </th>
            {DAYS.map(day => (
              <th key={day.id} className={cn(
                "border border-emerald-900/20 text-emerald-900 font-black text-[10px]",
                isPrint ? "p-1" : "p-2"
              )}>
                {isRTL ? day.name : day.en}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visiblePeriods.map(period => (
            <tr key={period}>
              <td className={cn(
                "border border-emerald-900/20 font-black text-emerald-800 text-[10px] text-center",
                isPrint ? "bg-gray-50 p-1" : "bg-emerald-50/20 p-2"
              )}>
                {period}
              </td>
              {DAYS.map(day => {
                const assignment = getAssignment(day.id, period);
                const config = periodConfigs.find(p => p.day === day.id && p.period === period);
                const isActive = config ? config.isActive : true;

                if (!isActive) return <td key={day.id} className="border border-emerald-900/10 bg-gray-100/50"></td>;

                return (
                  <td key={day.id} className={cn(
                    "border border-emerald-900/20 relative",
                    isPrint ? "p-1 h-14" : "p-1 min-h-[80px]"
                  )}>
                    {assignment ? (
                      <div className={cn(
                        "h-full flex flex-col justify-center items-center text-center p-1 rounded-md",
                        isPrint ? "bg-white" : "bg-emerald-50 border border-emerald-100"
                      )}>
                        <p className="text-[9px] font-black text-emerald-950 leading-tight mb-0.5">
                          {subjects.find(s => s.id === assignment.subjectId)?.name || "---"}
                        </p>
                        <p className="text-[8px] font-bold text-emerald-700 leading-tight">
                          {viewMode === "class" 
                            ? (() => {
                                const emp = employees.find(e => e.id === assignment.employeeId);
                                return emp ? `${emp.lastName} ${emp.firstName[0]}.` : "---";
                              })()
                            : classes.find(c => c.id === assignment.classId)?.name
                          }
                        </p>
                        {assignment.room && (
                          <p className="text-[7px] font-medium text-gray-500 mt-0.5">
                            [{assignment.room}]
                          </p>
                        )}
                        {!isPrint && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="absolute top-0 right-0 h-4 w-4 text-red-400 opacity-0 hover:opacity-100"
                            onClick={() => deleteAssignment(assignment.id)}
                          >
                            <Trash2 size={8} />
                          </Button>
                        )}
                      </div>
                    ) : (
                      !isPrint && (
                        <Button 
                          variant="ghost" 
                          className="w-full h-full min-h-[60px] hover:bg-emerald-50/50"
                          onClick={() => handleAddClick(day.id, period)}
                        >
                          <Plus size={14} className="text-emerald-200" />
                        </Button>
                      )
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-3xl font-black text-emerald-950 flex items-center gap-3">
            <CalendarIcon className="text-emerald-600" />
            {isRTL ? "إدارة الجدول الدراسي" : "Schedule Management"}
          </h2>
          <p className="text-emerald-600/70 font-bold mt-1">
            {isRTL ? "توزيع الحصص والمهام الأسبوعية" : "Weekly lesson distribution"}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 items-center bg-white p-2 rounded-2xl border border-emerald-100 shadow-sm">
          <div className="flex items-center gap-2 px-3 border-l border-emerald-50">
            <Switch id="show-empty" checked={showEmptyRows} onCheckedChange={setShowEmptyRows} />
            <Label htmlFor="show-empty" className="text-xs font-bold text-emerald-800 cursor-pointer">
              {isRTL ? "إظهار الكل" : "Show All"}
            </Label>
          </div>

          <Select value={viewMode} onValueChange={(v: any) => { setViewMode(v); setSelectedId(""); }}>
            <SelectTrigger className="w-[130px] rounded-xl border-none bg-emerald-50/50 font-bold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="class">{isRTL ? "الفوج" : "Class"}</SelectItem>
              <SelectItem value="teacher">{isRTL ? "الأستاذ" : "Teacher"}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger className="w-[180px] rounded-xl border-none bg-emerald-50/50 font-bold">
              <SelectValue placeholder={isRTL ? "اختر..." : "Select..."} />
            </SelectTrigger>
            <SelectContent>
              {viewMode === "class" 
                ? classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)
                : employees.map(e => <SelectItem key={e.id} value={e.id}>{e.lastName} {e.firstName}</SelectItem>)
              }
            </SelectContent>
          </Select>

          <Button 
            onClick={() => setIsPreviewOpen(true)} 
            disabled={!selectedId}
            className="bg-emerald-600 hover:bg-emerald-700 rounded-xl gap-2 font-bold shadow-lg shadow-emerald-100"
          >
            <Printer size={18} />
            {isRTL ? "معاينة وطباعة" : "Preview & Print"}
          </Button>
        </div>
      </div>

      {!selectedId ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-emerald-100">
          <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
            <Settings2 size={48} className="text-emerald-200 animate-spin-slow" />
          </div>
          <h3 className="text-2xl font-black text-emerald-900">
            {isRTL ? "بانتظار اختيار البيانات..." : "Waiting for selection..."}
          </h3>
          <p className="text-emerald-600/60 font-bold mt-2">
            {isRTL ? "اختر فوجاً أو أستاذاً من القائمة العلوية لعرض الجدول" : "Select a class or teacher to generate the schedule"}
          </p>
        </div>
      ) : (
        <ScheduleTable />
      )}

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-[100vw] w-full h-[100vh] p-0 border-none bg-zinc-900/95 backdrop-blur-xl flex flex-col">
          <div className="h-20 bg-black/40 border-b border-white/10 flex items-center justify-between px-8 shrink-0 print:hidden">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <FileText className="text-white" size={24} />
              </div>
              <div className="text-white">
                <h3 className="font-black text-lg leading-none">
                  {isRTL ? "معاينة الوثيقة الرسمية" : "Official Document Preview"}
                </h3>
                <p className="text-emerald-400 text-[10px] font-bold mt-1 uppercase tracking-widest">
                  {viewMode === "class" ? classes.find(c => c.id === selectedId)?.name : employees.find(e => e.id === selectedId)?.lastName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 bg-white/5 p-1.5 rounded-2xl border border-white/10">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={autoFitToPage} className="text-white hover:bg-emerald-500">
                        <Expand size={18} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{isRTL ? "احتواء تلقائي" : "Auto Fit"}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <div className="w-40 px-4">
                  <Slider 
                    value={[printScale]} 
                    onValueChange={(v) => setPrintScale(v[0])} 
                    min={30} max={150} step={1}
                  />
                </div>
                <span className="text-white font-black text-xs w-12 text-center">{printScale}%</span>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setOrientation(orientation === "portrait" ? "landscape" : "portrait")}
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl gap-2"
                >
                  <RotateCw size={18} />
                  {isRTL ? (orientation === "portrait" ? "عرضي" : "طولي") : (orientation === "portrait" ? "Landscape" : "Portrait")}
                </Button>
                
                <Button onClick={() => window.print()} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-8 font-black gap-2">
                  <Printer size={18} />
                  {isRTL ? "طباعة الآن" : "Print Now"}
                </Button>

                <Button variant="ghost" onClick={() => setIsPreviewOpen(false)} className="text-white/50 hover:text-white">
                  <X size={24} />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-12 flex justify-center items-start bg-zinc-950/50 print:p-0 print:bg-white">
            <div 
              className={cn(
                "bg-white shadow-[0_0_100px_rgba(0,0,0,0.5)] transition-all duration-500 origin-top flex flex-col print:shadow-none print:m-0 print-area-wrapper",
                orientation === "portrait" ? "w-[210mm] min-h-[297mm]" : "w-[297mm] min-h-[210mm]"
              )}
              style={{ transform: `scale(${printScale / 100})` }}
            >
              <div className="p-[15mm] flex-1 flex flex-col print-scaled-content" ref={printRef}>
                <div className="flex justify-between items-start border-b-4 border-emerald-900 pb-6 mb-8">
                  <div className="text-right">
                    <h1 className="text-3xl font-black text-emerald-950">EduSchedule</h1>
                    <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-[0.2em] mt-1">
                      Academic Management System
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="bg-emerald-900 text-white px-6 py-2 rounded-lg font-black text-sm mb-2">
                      {isRTL ? "الجدول الزمني الأسبوعي" : "WEEKLY SCHEDULE"}
                    </div>
                    <p className="text-[10px] font-bold text-gray-500">
                      {isRTL ? "الموسم الدراسي 2024/2025" : "Academic Year 2024/2025"}
                    </p>
                  </div>
                  <div className="text-left text-[10px] font-bold text-gray-600 space-y-1">
                    <p>{isRTL ? "التاريخ:" : "Date:"} {new Date().toLocaleDateString()}</p>
                    <p>{isRTL ? "الفئة:" : "Category:"} {viewMode === "class" ? (isRTL ? "فوج تربوي" : "Class") : (isRTL ? "أستاذ" : "Teacher")}</p>
                    <p className="text-emerald-700 text-xs font-black">
                      {viewMode === "class" ? classes.find(c => c.id === selectedId)?.name : employees.find(e => e.id === selectedId)?.lastName}
                    </p>
                  </div>
                </div>

                <div className="flex-1">
                  <ScheduleTable isPrint={true} />
                </div>

                <div className="mt-12 grid grid-cols-2 gap-20 px-10">
                  <div className="text-center">
                    <p className="text-xs font-black text-emerald-950 mb-16">{isRTL ? "توقيع ومصادقة المدير" : "Director's Signature"}</p>
                    <div className="border-t-2 border-dotted border-gray-300 w-full"></div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-black text-emerald-950 mb-16">{isRTL ? "ختم المؤسسة" : "School Official Stamp"}</p>
                    <div className="border-t-2 border-dotted border-gray-300 w-full"></div>
                  </div>
                </div>

                <div className="mt-auto pt-8 text-center border-t border-gray-100">
                  <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                    Generated by EduSchedule Smart Engine • Professional Academic Reporting
                  </p>
                </div>
              </div>
            </div>
          </div>

          <style>
            {`
              @media print {
                @page { 
                  size: A4 ${orientation}; 
                  margin: 0; 
                }
                body * { visibility: hidden; }
                .print-area-wrapper, .print-area-wrapper * { visibility: visible; }
                .print-area-wrapper { 
                  position: fixed; 
                  left: 0; 
                  top: 0; 
                  width: 100%; 
                  height: 100%;
                  display: flex;
                  justify-content: center;
                  align-items: flex-start;
                  background: white !important;
                  transform: none !important;
                }
                .print-scaled-content {
                  transform: scale(${printScale / 100});
                  transform-origin: top center;
                  width: 100%;
                }
              }
            `}
          </style>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Schedule;