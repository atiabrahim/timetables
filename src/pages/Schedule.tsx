"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Trash2,
  Printer,
  Eye,
  X,
  RotateCw,
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

// تعريف جميع الفترات الممكنة وتوقيتاتها
const ALL_PERIODS = [
  { id: "1", label: "1", time: "8:00 - 9:00" },
  { id: "2", label: "2", time: "9:00 - 9:55" },
  { id: "break-am", label: "الراحة الصباحية", time: "9:55 - 10:05", isBreak: true, after: "2" },
  { id: "3", label: "3", time: "10:05 - 11:00" },
  { id: "4", label: "4", time: "11:00 - 12:00" },
  { id: "5", label: "5", time: "13:00 - 14:00" },
  { id: "6", label: "6", time: "14:00 - 14:55" },
  { id: "break-pm", label: "الراحة المسائية", time: "14:55 - 15:05", isBreak: true, after: "6" },
  { id: "7", label: "7", time: "15:05 - 16:00" },
  { id: "8", label: "8", time: "16:00 - 17:00" },
];

const A4_PORTRAIT = { width: 794, height: 1123 };
const A4_LANDSCAPE = { width: 1123, height: 794 };

const Schedule = () => {
  const { 
    isRTL, t, 
    employees, classes, subjects, rooms,
    assignments, setAssignments
  } = useApp();

  const [viewMode, setViewMode] = useState<"class" | "teacher">("class");
  const [selectedId, setSelectedId] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [orientation, setOrientation] = useState<"landscape" | "portrait">("landscape");
  const [printScale, setPrintScale] = useState(100);
  const [editingCell, setEditingCell] = useState<{day: number, period: string} | null>(null);
  
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

  // تحديد الأعمدة النشطة بناءً على البيانات الموجودة
  const activeTimeSlots = useMemo(() => {
    const usedPeriodIds = new Set(filteredAssignments.map(a => a.period));
    
    // إذا لم تكن هناك بيانات، نعرض أول 4 حصص كافتراضي
    if (usedPeriodIds.size === 0) {
      return ALL_PERIODS.filter(p => !p.isBreak && parseInt(p.id) <= 4 || (p.isBreak && p.after === "2"));
    }

    const maxPeriod = Math.max(...Array.from(usedPeriodIds).map(id => parseInt(id)));
    
    const slots = [];
    for (const period of ALL_PERIODS) {
      if (period.isBreak) {
        // إظهار فترة الراحة إذا كانت الحصة التي تسبقها موجودة أو هناك حصص بعدها
        if (parseInt(period.after!) < maxPeriod) {
          slots.push(period);
        }
      } else if (parseInt(period.id) <= maxPeriod) {
        slots.push(period);
      }
    }
    return slots;
  }, [filteredAssignments]);

  const getAssignment = (day: number, period: string) => {
    return filteredAssignments.find(a => a.day === day && a.period === period);
  };

  const summaryData = useMemo(() => {
    const summary: Record<string, { subject: string, branch: string, count: number }> = {};
    filteredAssignments.forEach(a => {
      const key = `${a.subjectId}-${a.classId}`;
      if (!summary[key]) {
        summary[key] = {
          subject: subjects.find(s => s.id === a.subjectId)?.name || "---",
          branch: classes.find(c => c.id === a.classId)?.name || "---",
          count: 0
        };
      }
      summary[key].count += 1;
    });
    return Object.values(summary);
  }, [filteredAssignments, subjects, classes]);

  const totalHours = summaryData.reduce((acc, curr) => acc + curr.count, 0);

  const handleAddClick = (day: number, period: string) => {
    setEditingCell({ day, period });
    setNewAssignment({
      employeeId: viewMode === "teacher" ? selectedId : "",
      subjectId: "",
      classId: viewMode === "class" ? selectedId : "",
      room: "",
      department: ""
    });
    setIsDialogOpen(true);
  };

  const saveAssignment = () => {
    if (!editingCell || !newAssignment.subjectId) return;
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
    <div className="flex gap-0 w-full overflow-x-auto">
      <div className="flex-1 min-w-[600px]">
        <table className="w-full border-collapse border-2 border-black">
          <thead>
            <tr>
              <th className="border border-black p-1 bg-gray-50 w-24 text-[10px] font-bold">
                {isRTL ? "الأيام / الحصص" : "Days / Periods"}
              </th>
              {activeTimeSlots.map(slot => (
                <th key={slot.id} className={cn(
                  "border border-black p-1 text-center",
                  slot.isBreak ? "bg-gray-100 w-12" : "bg-white"
                )}>
                  <p className="text-[10px] font-bold">{slot.label}</p>
                  <p className="text-[8px] text-gray-500">{slot.time}</p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map(day => (
              <tr key={day.id} className="h-20">
                <td className="border border-black text-center font-bold text-sm bg-gray-50">
                  {isRTL ? day.name : day.en}
                </td>
                {activeTimeSlots.map(slot => {
                  if (slot.isBreak) {
                    return <td key={slot.id} className="border border-black bg-gray-100"></td>;
                  }
                  const assignment = getAssignment(day.id, slot.id);
                  return (
                    <td key={slot.id} className="border border-black relative p-1 group">
                      {assignment ? (
                        <div className="h-full flex flex-col justify-center items-center text-center">
                          <p className="text-[11px] font-bold leading-tight">
                            {subjects.find(s => s.id === assignment.subjectId)?.name || "---"}
                          </p>
                          <p className="text-[9px] text-gray-600 mt-1">
                            {viewMode === "class" 
                              ? employees.find(e => e.id === assignment.employeeId)?.lastName 
                              : classes.find(c => c.id === assignment.classId)?.name
                            }
                          </p>
                          {assignment.room && (
                            <p className="text-[8px] text-emerald-700 font-medium mt-1">
                              {assignment.room}
                            </p>
                          )}
                          {!isPrint && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="absolute top-0 right-0 h-5 w-5 text-red-400 opacity-0 group-hover:opacity-100"
                              onClick={() => deleteAssignment(assignment.id)}
                            >
                              <Trash2 size={10} />
                            </Button>
                          )}
                        </div>
                      ) : (
                        !isPrint && (
                          <Button 
                            variant="ghost" 
                            className="w-full h-full opacity-0 group-hover:opacity-100"
                            onClick={() => handleAddClick(day.id, slot.id)}
                          >
                            <Plus size={14} />
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

      {(isPrint || isPreviewOpen) && (
        <div className="w-64 mr-[-2px] shrink-0">
          <table className="w-full border-collapse border-2 border-black border-r-0">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-black p-1 text-[10px] font-bold">{isRTL ? "المادة" : "Subject"}</th>
                <th className="border border-black p-1 text-[10px] font-bold">{isRTL ? "الفرع" : "Branch"}</th>
                <th className="border border-black p-1 text-[10px] font-bold">{isRTL ? "العدد" : "Qty"}</th>
              </tr>
            </thead>
            <tbody>
              {summaryData.map((item, idx) => (
                <tr key={idx} className="h-8">
                  <td className="border border-black p-1 text-[9px] text-center">{item.subject}</td>
                  <td className="border border-black p-1 text-[9px] text-center">{item.branch}</td>
                  <td className="border border-black p-1 text-[9px] text-center font-bold">{item.count}</td>
                </tr>
              ))}
              {Array.from({ length: Math.max(0, 10 - summaryData.length) }).map((_, i) => (
                <tr key={`empty-${i}`} className="h-8">
                  <td className="border border-black p-1"></td>
                  <td className="border border-black p-1"></td>
                  <td className="border border-black p-1"></td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-bold">
                <td colSpan={2} className="border border-black p-1 text-[10px] text-center">
                  {isRTL ? "الحجم الساعي الإجمالي" : "Total Weekly Hours"}
                </td>
                <td className="border border-black p-1 text-[10px] text-center">{totalHours}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
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
            <Settings2 size={48} className="text-emerald-200" />
          </div>
          <h3 className="text-2xl font-black text-emerald-900">
            {isRTL ? "بانتظار اختيار البيانات..." : "Waiting for selection..."}
          </h3>
        </div>
      ) : (
        <ScheduleTable />
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-emerald-950">
              {isRTL ? "إضافة حصة جديدة" : "Add New Lesson"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{isRTL ? "المادة" : "Subject"}</label>
              <Select value={newAssignment.subjectId} onValueChange={v => setNewAssignment({...newAssignment, subjectId: v})}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {viewMode === "class" ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">{isRTL ? "الأستاذ" : "Teacher"}</label>
                <Select value={newAssignment.employeeId} onValueChange={v => setNewAssignment({...newAssignment, employeeId: v})}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.lastName} {e.firstName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium">{isRTL ? "الفوج" : "Class"}</label>
                <Select value={newAssignment.classId} onValueChange={v => setNewAssignment({...newAssignment, classId: v})}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>) }
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">{isRTL ? "القاعة / الورشة" : "Room / Workshop"}</label>
              <Input 
                value={newAssignment.room} 
                onChange={e => setNewAssignment({...newAssignment, room: e.target.value})}
                placeholder={isRTL ? "رقم القاعة..." : "Room number..."}
                className="rounded-xl"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl">{t.cancel}</Button>
            <Button onClick={saveAssignment} className="bg-emerald-600 rounded-xl">{isRTL ? "حفظ" : "Save"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-[100vw] w-full h-[100vh] p-0 border-none bg-zinc-900/95 flex flex-col">
          <div className="h-16 bg-black/40 border-b border-white/10 flex items-center justify-between px-8 shrink-0 print:hidden">
            <div className="flex items-center gap-4 text-white">
              <FileText size={20} />
              <h3 className="font-bold">{isRTL ? "معاينة الطباعة الرسمية" : "Official Print Preview"}</h3>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 bg-white/5 p-1.5 rounded-xl">
                <Slider value={[printScale]} onValueChange={(v) => setPrintScale(v[0])} min={30} max={150} className="w-32" />
                <span className="text-white text-xs font-bold">{printScale}%</span>
              </div>
              <Button variant="outline" onClick={() => setOrientation(orientation === "portrait" ? "landscape" : "portrait")} className="text-white border-white/20 bg-transparent">
                <RotateCw size={16} className="mr-2" />
                {isRTL ? (orientation === "portrait" ? "عرضي" : "طولي") : "Orientation"}
              </Button>
              <Button onClick={() => window.print()} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl">
                <Printer size={16} className="mr-2" />
                {isRTL ? "طباعة" : "Print"}
              </Button>
              <Button variant="ghost" onClick={() => setIsPreviewOpen(false)} className="text-white/50"><X size={20} /></Button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-12 flex justify-center bg-zinc-950/50 print:p-0 print:bg-white">
            <div 
              className={cn(
                "bg-white shadow-2xl transition-all duration-300 origin-top flex flex-col print:shadow-none print:m-0",
                orientation === "portrait" ? "w-[210mm] min-h-[297mm]" : "w-[297mm] min-h-[210mm]"
              )}
              style={{ transform: `scale(${printScale / 100})` }}
            >
              <div className="p-10 flex-1 flex flex-col" ref={printRef}>
                <div className="flex justify-between items-center mb-6">
                  <div className="w-20 h-20 border border-gray-200 rounded-full flex items-center justify-center text-[8px] text-gray-400">LOGO</div>
                  <div className="text-center flex-1">
                    <h1 className="text-xl font-bold text-emerald-900">مركز التكوين المهني والتمهين</h1>
                    <h2 className="text-lg font-bold text-emerald-800">المجاهد لمقدم مبروك بالدبيلة</h2>
                  </div>
                  <div className="w-20 h-20 border border-gray-200 rounded-full flex items-center justify-center text-[8px] text-gray-400">LOGO</div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6 text-sm font-bold border-y-2 border-black py-3">
                  <div className="text-right">
                    {viewMode === "teacher" ? (
                      <p>{isRTL ? "الأستاذ(ة):" : "Teacher:"} {employees.find(e => e.id === selectedId)?.lastName} {employees.find(e => e.id === selectedId)?.firstName}</p>
                    ) : (
                      <p>{isRTL ? "الفرع:" : "Branch:"} {classes.find(c => c.id === selectedId)?.name}</p>
                    )}
                  </div>
                  <div className="text-center">
                    <p>{isRTL ? "الشعبة المهنية:" : "Specialty:"} {viewMode === "teacher" ? employees.find(e => e.id === selectedId)?.observation : "---"}</p>
                  </div>
                  <div className="text-left">
                    <p>{isRTL ? "الرتبة:" : "Rank:"} {viewMode === "teacher" ? employees.find(e => e.id === selectedId)?.category : "---"}</p>
                  </div>
                </div>

                <div className="flex-1">
                  <ScheduleTable isPrint={true} />
                </div>

                <div className="mt-12 grid grid-cols-3 gap-8 text-center">
                  <div>
                    <p className="font-bold text-sm mb-16">{isRTL ? "المدير" : "Director"}</p>
                    <div className="border-t border-black w-32 mx-auto"></div>
                  </div>
                  <div>
                    <p className="font-bold text-sm mb-16">{isRTL ? "المسؤول البيداغوجي" : "Pedagogical Supervisor"}</p>
                    <div className="border-t border-black w-32 mx-auto"></div>
                  </div>
                  <div>
                    <p className="font-bold text-sm mb-16">{isRTL ? "الأستاذ" : "Teacher"}</p>
                    <div className="border-t border-black w-32 mx-auto"></div>
                  </div>
                </div>

                <div className="mt-auto pt-4 text-center text-[8px] text-gray-400 border-t border-gray-100">
                  تم إنشاء الجدول بتاريخ: {new Date().toLocaleDateString()} - نظام EduSchedule
                </div>
              </div>
            </div>
          </div>

          <style>
            {`
              @media print {
                @page { size: ${orientation}; margin: 0; }
                body * { visibility: hidden; }
                .print-area-wrapper, .print-area-wrapper * { visibility: visible; }
                .print-area-wrapper { 
                  position: fixed; left: 0; top: 0; width: 100%; height: 100%;
                  background: white !important;
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