"use client";

import React, { useState, useMemo } from "react";
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
  AlertCircle
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
  const [editingCell, setEditingCell] = useState<{day: number, period: string} | null>(null);

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

  // دالة للتحقق من التعارضات
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
    const assignment = {
      ...newAssignment,
      id,
      day: editingCell.day,
      period: editingCell.period
    };

    setAssignments([...assignments, assignment]);
    setIsDialogOpen(false);
    showSuccess(isRTL ? "تمت إضافة الحصة بنجاح" : "Lesson added successfully");
  };

  const deleteAssignment = (id: string) => {
    setAssignments(assignments.filter(a => a.id !== id));
    showSuccess(isRTL ? "تم حذف الحصة" : "Lesson deleted");
  };

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

          <Button variant="outline" onClick={() => window.print()} className="rounded-xl border-emerald-100 text-emerald-700">
            <Printer size={18} className={isRTL ? "ml-2" : "mr-2"} />
            {isRTL ? "طباعة" : "Print"}
          </Button>
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
        <div className="overflow-x-auto rounded-3xl border border-emerald-100 bg-white shadow-sm print:border-none print:shadow-none">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-emerald-50/50">
                <th className="p-4 border-b border-emerald-100 text-emerald-900 font-bold text-sm w-24">
                  {isRTL ? "الحصة" : "Period"}
                </th>
                {DAYS.map(day => (
                  <th key={day.id} className="p-4 border-b border-emerald-100 text-emerald-900 font-bold text-sm min-w-[120px]">
                    {isRTL ? day.name : day.en}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map(period => (
                <tr key={period} className="group">
                  <td className="p-4 border-b border-emerald-100 bg-emerald-50/20 font-bold text-emerald-800 text-xs text-center">
                    <div className="flex flex-col items-center gap-1">
                      <Clock size={12} className="text-emerald-400" />
                      {period}
                    </div>
                  </td>
                  {DAYS.map(day => {
                    const assignment = getAssignment(day.id, period);
                    const config = periodConfigs.find(p => p.day === day.id && p.period === period);
                    const isActive = config ? config.isActive : true;

                    if (!isActive) return <td key={day.id} className="p-2 border-b border-emerald-100 bg-gray-50/30"></td>;

                    const conflict = assignment ? checkConflict(day.id, period, assignment) : null;

                    return (
                      <td key={day.id} className="p-2 border-b border-emerald-100 relative group/cell min-h-[100px]">
                        {assignment ? (
                          <div className={cn(
                            "border rounded-xl p-3 transition-all hover:shadow-md h-full relative",
                            conflict ? "bg-red-50 border-red-200" : "bg-emerald-50 border-emerald-100"
                          )}>
                            {conflict && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg animate-bounce">
                                      <AlertCircle size={12} />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-red-900 text-white border-none rounded-xl">
                                    <p className="text-xs font-bold">
                                      {isRTL 
                                        ? `تعارض: ${conflict.type === 'teacher' ? 'الأستاذ' : 'القاعة'} مشغول مع ${conflict.with}`
                                        : `Conflict: ${conflict.type === 'teacher' ? 'Teacher' : 'Room'} busy with ${conflict.with}`
                                      }
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            
                            <div className="flex justify-between items-start mb-2">
                              <span className={cn("text-[11px] font-bold uppercase tracking-wider", conflict ? "text-red-700" : "text-emerald-700")}>
                                {subjects.find(s => s.id === assignment.subjectId)?.name || "---"}
                              </span>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6 text-red-400 opacity-0 group-hover/cell:opacity-100 transition-opacity print:hidden"
                                onClick={() => deleteAssignment(assignment.id)}
                              >
                                <Trash2 size={12} />
                              </Button>
                            </div>
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-1.5 text-xs text-emerald-900 font-medium">
                                <User size={12} className="text-emerald-400" />
                                {viewMode === "class" 
                                  ? employees.find(e => e.id === assignment.employeeId)?.lastName 
                                  : classes.find(c => c.id === assignment.classId)?.name
                                }
                              </div>
                              {assignment.room && (
                                <div className="flex items-center gap-1.5 text-[10px] text-emerald-600/70">
                                  <MapPin size={10} />
                                  {assignment.room}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <Button 
                            variant="ghost" 
                            className="w-full h-20 border-2 border-dashed border-transparent hover:border-emerald-100 hover:bg-emerald-50/30 rounded-xl transition-all group/btn print:hidden"
                            onClick={() => handleAddClick(day.id, period)}
                          >
                            <Plus size={20} className="text-emerald-200 group-hover/btn:text-emerald-400" />
                          </Button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
    </div>
  );
};

export default Schedule;