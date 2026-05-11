"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { Settings2 } from "lucide-react";
import { showSuccess, showError } from "../utils/toast";
import ScheduleHeader from "../components/schedule/ScheduleHeader";
import ScheduleTable from "../components/schedule/ScheduleTable";
import AddLessonDialog from "../components/schedule/AddLessonDialog";
import PrintPreview from "../components/schedule/PrintPreview";

const DAYS = [
  { id: 0, name: "الأحد", en: "Sunday" },
  { id: 1, name: "الاثنين", en: "Monday" },
  { id: 2, name: "الثلاثاء", en: "Tuesday" },
  { id: 3, name: "الأربعاء", en: "Wednesday" },
  { id: 4, name: "الخميس", en: "Thursday" },
];

const ALL_PERIODS = [
  { id: "1", label: "1", time: "8:00 - 9:00" },
  { id: "2", label: "2", time: "9:00 - 9:55" },
  { id: "break-am", label: "الراحة الصباحية", time: "9:55 - 10:05", isBreak: true, after: "2" },
  { id: "3", label: "3", time: "10:05 - 11:00" },
  { id: "4", label: "4", time: "11:00 - 12:00" },
  { id: "break-noon", label: "راحة الزوال", time: "12:00 - 13:00", isBreak: true, after: "4" },
  { id: "5", label: "5", time: "13:00 - 14:00" },
  { id: "6", label: "6", time: "14:00 - 15:00" },
  { id: "7", label: "7", time: "15:00 - 16:00" },
  { id: "8", label: "8", time: "16:00 - 17:00" },
];

const Schedule = () => {
  const { 
    isRTL, t, employees, classes, subjects, rooms, assignments, setAssignments
  } = useApp();

  const [viewMode, setViewMode] = useState<"class" | "teacher">("class");
  const [selectedId, setSelectedId] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [orientation, setOrientation] = useState<"landscape" | "portrait">("landscape");
  const [printScale, setPrintScale] = useState(100);
  const [editingCell, setEditingCell] = useState<{day: number, period: string} | null>(null);
  
  const [newAssignment, setNewAssignment] = useState({
    employeeId: "", subjectId: "", classId: "", room: "", department: ""
  });

  const filteredAssignments = useMemo(() => {
    return assignments.filter(a => viewMode === "class" ? a.classId === selectedId : a.employeeId === selectedId);
  }, [assignments, viewMode, selectedId]);

  const activeTimeSlots = useMemo(() => {
    const usedPeriodIds = new Set(filteredAssignments.map(a => a.period));
    if (usedPeriodIds.size === 0) return ALL_PERIODS.filter(p => !p.isBreak && parseInt(p.id) <= 4 || (p.isBreak && (p.after === "2" || p.after === "4")));
    
    const maxPeriod = Math.max(...Array.from(usedPeriodIds).map(id => parseInt(id)));
    return ALL_PERIODS.filter(p => {
      if (p.isBreak) {
        return parseInt(p.after!) < maxPeriod;
      }
      return parseInt(p.id) <= maxPeriod;
    });
  }, [filteredAssignments]);

  const getAssignment = (day: number, period: string) => filteredAssignments.find(a => a.day === day && a.period === period);

  const summaryData = useMemo(() => {
    const summary: Record<string, { subject: string, branch: string, count: number }> = {};
    filteredAssignments.forEach(a => {
      const key = `${a.subjectId}-${a.classId}`;
      if (!summary[key]) summary[key] = { subject: subjects.find(s => s.id === a.subjectId)?.name || "---", branch: classes.find(c => c.id === a.classId)?.name || "---", count: 0 };
      summary[key].count += 1;
    });
    return Object.values(summary);
  }, [filteredAssignments, subjects, classes]);

  const totalHours = summaryData.reduce((acc, curr) => acc + curr.count, 0);

  const handleAddClick = (day: number, period: string) => {
    setEditingCell({ day, period });
    setNewAssignment({ employeeId: viewMode === "teacher" ? selectedId : "", subjectId: "", classId: viewMode === "class" ? selectedId : "", room: "", department: "" });
    setIsDialogOpen(true);
  };

  const checkConflicts = (day: number, period: string, empId: string, clsId: string, room: string) => {
    const teacherConflict = assignments.find(a => a.day === day && a.period === period && a.employeeId === empId);
    if (teacherConflict) return isRTL ? `الأستاذ مشغول حالياً مع الفوج: ${classes.find(c => c.id === teacherConflict.classId)?.name}` : `Teacher is busy`;
    const classConflict = assignments.find(a => a.day === day && a.period === period && a.classId === clsId);
    if (classConflict) return isRTL ? `هذا الفوج لديه حصة بالفعل` : `Class busy`;
    if (room && assignments.find(a => a.day === day && a.period === period && a.room === room)) return isRTL ? `القاعة مشغولة` : `Room busy`;
    return null;
  };

  const saveAssignment = () => {
    if (!editingCell || !newAssignment.subjectId || !newAssignment.employeeId || !newAssignment.classId) return showError(isRTL ? "بيانات ناقصة" : "Missing data");
    const conflict = checkConflicts(editingCell.day, editingCell.period, newAssignment.employeeId, newAssignment.classId, newAssignment.room);
    if (conflict) return showError(conflict);
    setAssignments([...assignments, { ...newAssignment, id: Math.random().toString(36).substr(2, 9), day: editingCell.day, period: editingCell.period }]);
    setIsDialogOpen(false);
    showSuccess(isRTL ? "تمت الإضافة" : "Added");
  };

  return (
    <div className="space-y-6">
      <ScheduleHeader 
        isRTL={isRTL} viewMode={viewMode} setViewMode={setViewMode} selectedId={selectedId} 
        setSelectedId={setSelectedId} classes={classes} employees={employees} onPreview={() => setIsPreviewOpen(true)}
      />

      {!selectedId ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-emerald-100">
          <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6"><Settings2 size={48} className="text-emerald-200" /></div>
          <h3 className="text-2xl font-black text-emerald-900">{isRTL ? "بانتظار اختيار البيانات..." : "Waiting for selection..."}</h3>
        </div>
      ) : (
        <ScheduleTable 
          isRTL={isRTL} days={DAYS} timeSlots={activeTimeSlots} getAssignment={getAssignment} 
          onAddClick={handleAddClick} onDeleteClick={(id) => setAssignments(assignments.filter(a => a.id !== id))} 
          subjects={subjects} employees={employees} classes={classes} viewMode={viewMode}
        />
      )}

      <AddLessonDialog 
        isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} isRTL={isRTL} cancelText={t.cancel} 
        subjects={subjects} employees={employees} classes={classes} rooms={rooms} viewMode={viewMode} 
        newAssignment={newAssignment} setNewAssignment={setNewAssignment} onSave={saveAssignment}
      />

      <PrintPreview 
        isOpen={isPreviewOpen} onOpenChange={setIsPreviewOpen} isRTL={isRTL} orientation={orientation} 
        setOrientation={setOrientation} printScale={printScale} setPrintScale={setPrintScale} 
        viewMode={viewMode} selectedId={selectedId} employees={employees} classes={classes} 
        subjects={subjects} days={DAYS} timeSlots={activeTimeSlots} getAssignment={getAssignment} 
        summaryData={summaryData} totalHours={totalHours}
      />
    </div>
  );
};

export default Schedule;