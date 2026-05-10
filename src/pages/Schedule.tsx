"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Calendar as CalendarIcon, 
  User, 
  BookOpen, 
  MapPin,
  Trash2,
  Printer,
  Clock,
  AlertCircle,
  Eye,
  X,
  RotateCw,
  Maximize2,
  ArrowsMaximize,
  Expand
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
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
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

type FitMode = "manual" | "width" | "height" | "all";

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
  const [fitMode, setFitMode] = useState<FitMode>("manual");
  const [editingCell, setEditingCell] = useState<{day: number, period: string} | null>(null);

  const contentRef = useRef<HTMLDivElement>(null);

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

  // حساب التحجيم التلقائي
  useEffect(() => {
    if (isPreviewOpen && fitMode !== "manual" && contentRef.current) {
      const container = contentRef.current;
      const content = container.firstElementChild as HTMLElement;
      if (!content) return;

      // أبعاد A4 بالبكسل (تقريبياً لـ 96 DPI)
      const A4_WIDTH = orientation === "portrait" ? 794 : 1123;
      const A4_HEIGHT = orientation === "portrait" ? 1123 : 794;
      const MARGIN = 40; // هوامش الأمان

      const targetWidth = A4_WIDTH - MARGIN;
      const targetHeight = A4_HEIGHT - MARGIN;

      const contentWidth = content.scrollWidth;
      const contentHeight = content.scrollHeight;

      let newScale = 100;

      if (fitMode === "width") {
        newScale = (targetWidth / contentWidth) * 100;
      } else if (fitMode === "height") {
        newScale = (targetHeight / contentHeight) * 100;
      } else if (fitMode === "all") {
        newScale = Math.min(targetWidth / contentWidth, targetHeight / contentHeight) * 100;
      }

      setPrintScale(Math.floor(Math.min(Math.max(newScale, 30), 150)));
    }
  }, [isPreviewOpen, fitMode, orientation, selectedId, assignments]);

  const checkConflict = (day: number, period: string, assignment: any) => {
    const otherAssignments = assignments.filter(a => a.id !== assignment.id && a.day === day && a.period === period);
    const teacherConflict = otherAssignments.find(a => a.employeeId === assignment.employeeId);
    const roomConflict = assignment.room ? otherAssignments.find(a => a.room === assignment.room) : null;
    
    if (teacherConflict || roomConflict) {
      return {
        type: teacherConflict ? "teacher" : "room",
        with: teacherConflict 
          ? (classes.find(c => c.id === teacherConflict.classId)?.name || "Unknown Class")
          : (classes.find(c => c.id === roomConflict?.classId)?.name || "Unknown Class")
      };
    }
    return null;
  };

  const getAssignment = (day: number, period: string) => {
    return filteredAssignments.find(a => a.day === day && a.period === period);
  };

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

  const ScheduleTable = ({ isPreview = false }: { isPreview?: boolean }) => (
    <div className={cn(
      "overflow-x-auto rounded-3xl border border-emerald-100 bg-white shadow-sm",
      isPreview && "border-gray-300 shadow-none rounded-none border-collapse"
    )}>
      <table className="w-full border-collapse table-fixed">
        <thead>
          <tr className="bg-emerald-50/50">
            <th className={cn("p-2 border-b border-emerald-100 text-emerald-900 font-bold text-xs w-16", isPreview && "p-1")}>
              {isRTL ? "الحصة" : "Period"}
            </th>
            {DAYS.map(day => (
              <th key={day.id} className={cn("p-2 border-b border-emerald-100 text-emerald-900 font-bold text-xs", isPreview && "p-1")}>
                {isRTL ? day.name : day.en}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PERIODS.map(period => (
            <tr key={period} className="group">
              <td className={cn("p-2 border-b border-emerald-100 bg-emerald-50/20 font-bold text-emerald-800 text-[10px] text-center", isPreview && "p-1")}>
                <div className="flex flex-col items-center gap-0.5">
                  <Clock size={10} className="text-emerald-400" />
                  {period}
                </div>
              </td>
              {DAYS.map(day => {
                const assignment = getAssignment(day.id, period);
                const config = periodConfigs.find(p => p.day === day.id && p.period === period);
                const isActive = config ? config.isActive : true;

                if (!isActive) return <td key={day.id} className="p-1 border-b border-emerald-100 bg-gray-50/30"></td>;

                const conflict = assignment ? checkConflict(day.id, period, assignment) : null;

                return (
                  <td key={day.id} className={cn(
                    "p-1 border-b border-emerald-100 relative group/cell",
                    isPreview ? "h-auto" : "min-h-[80px]"
                  )}>
                    {assignment ? (
                      <div className={cn(
                        "border rounded-lg p-2 transition-all h-full relative",
                        conflict ? "bg-red-50 border-red-200" : "bg-emerald-50 border-emerald-100",
                        !isPreview && "hover:shadow-md"
                      )}>
                        {conflict && !isPreview && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg animate-bounce">
                                  <AlertCircle size={10} />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="bg-red-900 text-white border-none rounded-xl">
                                <p className="text-[10px] font-bold">
                                  {isRTL 
                                    ? `تعارض: ${conflict.type === 'teacher' ? 'الأستاذ' : 'القاعة'} مشغول مع ${conflict.with}`
                                    : `Conflict: ${conflict.type === 'teacher' ? 'Teacher' : 'Room'} busy with ${conflict.with}`
                                  }
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        
                        <div className="flex justify-between items-start mb-1">
                          <span className={cn("text-[9px] font-bold uppercase tracking-tight truncate", conflict ? "text-red-700" : "text-emerald-700")}>
                            {subjects.find(s => s.id === assignment.subjectId)?.name || "---"}
                          </span>
                          {!isPreview && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-5 w-5 text-red-400 opacity-0 group-hover/cell:opacity-100 transition-opacity"
                              onClick={() => deleteAssignment(assignment.id)}
                            >
                              <Trash2 size={10} />
                            </Button>
                          )}
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 text-[9px] text-emerald-900 font-medium truncate">
                            <User size={10} className="text-emerald-400 shrink-0" />
                            {viewMode === "class" 
                              ? (() => {
                                  const emp = employees.find(e => e.id === assignment.employeeId);
                                  return emp ? `${emp.firstName} ${emp.lastName}` : "---";
                                })()
                              : classes.find(c => c.id === assignment.classId)?.name
                            }
                          </div>
                          {assignment.room && (
                            <div className="flex items-center gap-1 text-[8px] text-emerald-600/70 truncate">
                              <MapPin size={8} className="shrink-0" />
                              {assignment.room}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      !isPreview && (
                        <Button 
                          variant="ghost" 
                          className="w-full h-16 border-2 border-dashed border-transparent hover:border-emerald-100 hover:bg-emerald-50/30 rounded-xl transition-all group/btn"
                          onClick={() => handleAddClick(day.id, period)}
                        >
                          <Plus size={16} className="text-emerald-200 group-hover/btn:text-emerald-400" />
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
    <div className="space-y-6 print:p-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-3xl font-bold text-emerald-950">{isRTL ? "الجدول الزمني" : "Schedule"}</h2>
          <p className="text-emerald-600/70 mt-1">
            {isRTL ? "إدارة الحصص وتوزيع المهام" : "Manage lessons and assignments"}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <Select value={viewMode} onValueChange={(v: any) => { setViewMode(v); setSelectedId(""); }}>
            <SelectTrigger className="w-[140px] rounded-xl border-emerald-100 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="class">{isRTL ? "حسب الفوج" : "By Class"}</SelectItem>
              <SelectItem value="teacher">{isRTL ? "حسب الأستاذ" : "By Teacher"}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger className="w-[200px] rounded-xl border-emerald-100 bg-white">
              <SelectValue placeholder={isRTL ? "اختر..." : "Select..."} />
            </SelectTrigger>
            <SelectContent>
              {viewMode === "class" 
                ? classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)
                : employees.map(e => <SelectItem key={e.id} value={e.id}>{e.lastName} {e.firstName}</SelectItem>)
              }
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsPreviewOpen(true)} 
              disabled={!selectedId}
              className="rounded-xl border-emerald-100 text-emerald-700"
            >
              <Eye size={18} className={isRTL ? "ml-2" : "mr-2"} />
              {isRTL ? "معاينة" : "Preview"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.print()} 
              disabled={!selectedId}
              className="rounded-xl border-emerald-100 text-emerald-700"
            >
              <Printer size={18} className={isRTL ? "ml-2" : "mr-2"} />
              {isRTL ? "طباعة" : "Print"}
            </Button>
          </div>
        </div>
      </div>

      {!selectedId ? (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-emerald-100 print:hidden">
          <CalendarIcon size={48} className="mx-auto text-emerald-200 mb-4" />
          <h3 className="text-xl font-bold text-emerald-900">
            {isRTL ? "يرجى اختيار فوج أو أستاذ لعرض الجدول" : "Please select a class or teacher to view schedule"}
          </h3>
        </div>
      ) : (
        <ScheduleTable />
      )}

      {/* Dialog إضافة حصة */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-emerald-950">
              {isRTL ? "إضافة حصة جديدة" : "Add New Lesson"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {viewMode === "class" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-emerald-800">{isRTL ? "الأستاذ" : "Teacher"}</label>
                <Select value={newAssignment.employeeId} onValueChange={v => setNewAssignment({...newAssignment, employeeId: v})}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.lastName} {e.firstName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}

            {viewMode === "teacher" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-emerald-800">{isRTL ? "الفوج" : "Class"}</label>
                <Select value={newAssignment.classId} onValueChange={v => setNewAssignment({...newAssignment, classId: v})}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-emerald-800">{isRTL ? "المادة" : "Subject"}</label>
              <Select value={newAssignment.subjectId} onValueChange={v => setNewAssignment({...newAssignment, subjectId: v})}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-emerald-800">{isRTL ? "القاعة" : "Room"}</label>
                <Select value={newAssignment.room} onValueChange={v => setNewAssignment({...newAssignment, room: v})}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {rooms.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-emerald-800">{isRTL ? "القسم" : "Department"}</label>
                <Select value={newAssignment.department} onValueChange={v => setNewAssignment({...newAssignment, department: v})}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl">{t.cancel}</Button>
            <Button 
              onClick={saveAssignment} 
              className="bg-emerald-600 hover:bg-emerald-700 rounded-xl"
              disabled={!newAssignment.subjectId || (!newAssignment.employeeId && viewMode === "class") || (!newAssignment.classId && viewMode === "teacher")}
            >
              {isRTL ? "حفظ" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog معاينة قبل الطباعة الاحترافي */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-[98vw] w-full h-[95vh] overflow-hidden rounded-3xl p-0 border-none flex flex-col">
          <div className="bg-white border-b p-4 flex flex-col md:flex-row justify-between items-center gap-4 z-10 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                <Eye size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-emerald-950">
                  {isRTL ? "معاينة الطباعة الذكية" : "Smart Print Preview"}
                </h3>
                <p className="text-[10px] text-gray-500 font-medium">
                  {viewMode === "class" ? classes.find(c => c.id === selectedId)?.name : employees.find(e => e.id === selectedId)?.lastName}
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 bg-gray-50 p-2 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2 border-r border-gray-200 pr-4">
                <span className="text-[10px] font-bold text-gray-500 uppercase">{isRTL ? "التحجيم" : "Scaling"}:</span>
                <Select value={fitMode} onValueChange={(v: FitMode) => setFitMode(v)}>
                  <SelectTrigger className="h-8 w-32 text-[10px] font-bold rounded-lg border-none bg-white shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">{isRTL ? "يدوي" : "Manual"}</SelectItem>
                    <SelectItem value="width">{isRTL ? "ملء العرض" : "Fit Width"}</SelectItem>
                    <SelectItem value="height">{isRTL ? "ملء الارتفاع" : "Fit Height"}</SelectItem>
                    <SelectItem value="all">{isRTL ? "احتواء الكل" : "Fit All"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {fitMode === "manual" && (
                <div className="flex items-center gap-3 px-2 min-w-[150px]">
                  <Slider 
                    value={[printScale]} 
                    onValueChange={(v) => setPrintScale(v[0])} 
                    min={50} 
                    max={150} 
                    step={1}
                    className="w-24"
                  />
                  <span className="text-[10px] font-black text-emerald-700 w-8">{printScale}%</span>
                </div>
              )}

              <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setOrientation(orientation === "portrait" ? "landscape" : "portrait")}
                  className="h-8 rounded-lg text-[10px] font-bold gap-2 hover:bg-white"
                >
                  <RotateCw size={14} />
                  {isRTL ? (orientation === "portrait" ? "عرضي" : "طولي") : (orientation === "portrait" ? "Landscape" : "Portrait")}
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => window.print()} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl h-10 px-6 shadow-lg shadow-emerald-100">
                <Printer size={18} className={isRTL ? "ml-2" : "mr-2"} />
                {isRTL ? "طباعة الآن" : "Print Now"}
              </Button>
              <Button variant="ghost" onClick={() => setIsPreviewOpen(false)} className="rounded-xl h-10 w-10 p-0">
                <X size={20} />
              </Button>
            </div>
          </div>

          <div className="flex-1 bg-gray-100/50 overflow-auto p-8 flex justify-center items-start custom-scrollbar">
            <div 
              ref={contentRef}
              className={cn(
                "bg-white shadow-2xl border border-gray-200 transition-all duration-300 origin-top overflow-hidden",
                orientation === "portrait" ? "w-[210mm] min-h-[297mm]" : "w-[297mm] min-h-[210mm]"
              )} 
              style={{ transform: `scale(${printScale / 100})` }}
            >
              <style>
                {`
                  @media print {
                    @page { 
                      size: A4 ${orientation}; 
                      margin: 0; 
                    }
                    body * { visibility: hidden; }
                    .print-content, .print-content * { visibility: visible; }
                    .print-content { 
                      position: absolute; 
                      left: 0; 
                      top: 0; 
                      width: 100%; 
                      transform: scale(${printScale / 100});
                      transform-origin: top center;
                    }
                  }
                  .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                  .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                `}
              </style>
              <div className="print-content p-10">
                <div className="flex justify-between items-start mb-8 border-b-2 border-emerald-900 pb-6">
                  <div className="text-right">
                    <h1 className="text-2xl font-black text-emerald-950 mb-1">EduSchedule</h1>
                    <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">
                      {isRTL ? "نظام الجدولة التربوي الذكي" : "Smart Academic Scheduling System"}
                    </p>
                  </div>
                  <div className="text-left bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-900 mb-1">
                      <CalendarIcon size={12} />
                      {isRTL ? "الجدول الزمني الأسبوعي" : "Weekly Schedule"}
                    </div>
                    <div className="flex flex-col gap-0.5 text-[9px] text-emerald-700 font-medium">
                      <p>{isRTL ? "الاسم:" : "Name:"} {viewMode === "class" ? classes.find(c => c.id === selectedId)?.name : employees.find(e => e.id === selectedId)?.lastName}</p>
                      <p>{isRTL ? "التاريخ:" : "Date:"} {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <ScheduleTable isPreview={true} />

                <div className="mt-12 grid grid-cols-3 gap-8">
                  <div className="text-center p-4 border border-dashed border-gray-200 rounded-2xl">
                    <p className="text-[9px] font-bold text-gray-400 uppercase mb-8">{isRTL ? "توقيع المدير" : "Director Signature"}</p>
                    <div className="h-10"></div>
                  </div>
                  <div className="text-center p-4 border border-dashed border-gray-200 rounded-2xl">
                    <p className="text-[9px] font-bold text-gray-400 uppercase mb-8">{isRTL ? "ختم المؤسسة" : "School Stamp"}</p>
                    <div className="h-10"></div>
                  </div>
                  <div className="text-center p-4 border border-dashed border-gray-200 rounded-2xl">
                    <p className="text-[9px] font-bold text-gray-400 uppercase mb-8">{isRTL ? "ملاحظات" : "Notes"}</p>
                    <div className="h-10"></div>
                  </div>
                </div>
                
                <div className="mt-8 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <p className="text-[8px] text-gray-400 font-medium italic">Generated by EduSchedule Pro - {new Date().toLocaleString()}</p>
                  <div className="flex gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    <span className="w-2 h-2 bg-emerald-300 rounded-full"></span>
                    <span className="w-2 h-2 bg-emerald-100 rounded-full"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Schedule;