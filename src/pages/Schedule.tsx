"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { Settings2, ArrowLeftRight, Trash2 } from "lucide-react";
import { showSuccess, showError } from "../utils/toast";
import ScheduleHeader from "../components/schedule/ScheduleHeader";
import ScheduleTable from "../components/schedule/ScheduleTable";
import AddLessonDialog from "../components/schedule/AddLessonDialog";
import PrintPreview from "../components/schedule/PrintPreview";
import OfficialPrintWrapper from "../components/shared/OfficialPrintWrapper";
import { Button } from "@/components/ui/button";
import { DAYS, PERIOD_MAP, PERIODS } from "../constants/schedule";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const PERIOD_TIMES: Record<string, string> = {
  "1": "08:00 - 09:00", "2": "09:00 - 10:00", "3": "10:00 - 11:00", "4": "11:00 - 12:00",
  "5": "13:00 - 14:00", "6": "14:00 - 15:00", "7": "15:00 - 16:00", "8": "16:00 - 17:00",
  "9": "17:00 - 18:00", "10": "18:00 - 19:00", "11": "19:00 - 20:00", "12": "20:00 - 21:00",
};

const Schedule = () => {
  const { 
    isRTL, t, employees, classes, subjects, rooms, assignments, setAssignments, user
  } = useApp();

  const [viewMode, setViewMode] = useState<"class" | "teacher">("class");
  const [selectedId, setSelectedId] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [orientation, setOrientation] = useState<"landscape" | "portrait">("landscape");
  const [printScale, setPrintScale] = useState(100);
  const [editingCell, setEditingCell] = useState<{day: number, period: string} | null>(null);
  const [isTransposed, setIsTransposed] = useState(false);
  
  const [newAssignment, setNewAssignment] = useState({
    employeeId: "", subjectId: "", classId: "", room: "", department: ""
  });

  const filteredAssignments = useMemo(() => {
    if (!selectedId) return [];
    return assignments.filter(a => 
      viewMode === "class" ? a.classId === selectedId : a.employeeId === selectedId
    );
  }, [assignments, selectedId, viewMode]);

  const periodSlots = useMemo(() => {
    return PERIODS.map(id => ({
      id, label: isRTL ? `ح${id}` : id,
      periodPart: PERIOD_MAP[id] as "Morning" | "Afternoon" | "Evening",
      isBreak: false, time: PERIOD_TIMES[id] || "" 
    }));
  }, [isRTL]);

  const activeTimeSlots = useMemo(() => {
    const usedIds = filteredAssignments.map(a => a.period);
    if (usedIds.length === 0) return periodSlots.filter(p => parseInt(p.id) <= 4);
    return periodSlots.filter(p => usedIds.includes(p.id));
  }, [filteredAssignments, periodSlots]);

  const getAssignment = (day: number, period: string) => 
    filteredAssignments.find(a => a.day === day && a.period === period);

  const handleAddClick = (day: number, period: string) => {
    if (viewMode === "class") {
      setNewAssignment({ ...newAssignment, classId: selectedId, employeeId: "", subjectId: "", room: "", department: "" });
    } else {
      setNewAssignment({ ...newAssignment, employeeId: selectedId, classId: "", subjectId: "", room: "", department: "" });
    }
    setEditingCell({ day, period });
    setIsDialogOpen(true);
  };

  const handleSaveLesson = () => {
    if (!editingCell) return;
    if (!newAssignment.subjectId || (viewMode === "class" ? !newAssignment.employeeId : !newAssignment.classId)) {
      showError(isRTL ? "يرجى إكمال البيانات" : "Please complete data");
      return;
    }
    const id = Math.random().toString(36).substr(2, 9);
    setAssignments([...assignments, { id, ...newAssignment, day: editingCell.day, period: editingCell.period }]);
    setIsDialogOpen(false);
    showSuccess(isRTL ? "تمت إضافة الحصة" : "Lesson added");
  };

  const handleDeleteLesson = (id: string) => {
    setAssignments(assignments.filter(a => a.id !== id));
    showSuccess(isRTL ? "تم حذف الحصة" : "Lesson deleted");
  };

  const summaryData = useMemo(() => {
    const data: any[] = [];
    filteredAssignments.forEach(asgn => {
      const sub = subjects.find(s => s.id === asgn.subjectId)?.name || "---";
      const existing = data.find(d => d.subject === sub);
      if (existing) existing.count++; else data.push({ subject: sub, count: 1 });
    });
    return data;
  }, [filteredAssignments, subjects]);

  const selectedEntityName = useMemo(() => {
    if (viewMode === "class") return classes.find(c => c.id === selectedId)?.name || "";
    const emp = employees.find(e => e.id === selectedId);
    return emp ? `${emp.lastName} ${emp.firstName}` : "";
  }, [selectedId, viewMode, classes, employees]);

  return (
    <div className="space-y-6">
      <ScheduleHeader 
        isRTL={isRTL} viewMode={viewMode} setViewMode={setViewMode}
        selectedId={selectedId} setSelectedId={setSelectedId}
        classes={classes} employees={employees} onPreview={() => setIsPreviewOpen(true)}
      />

      {selectedId ? (
        <div className="space-y-4">
          <div className="flex justify-end gap-2 print:hidden">
            <Button variant="outline" size="sm" onClick={() => setIsTransposed(!isTransposed)} className="rounded-xl border-emerald-100 text-emerald-700 font-bold gap-2">
              <ArrowLeftRight size={14} />
              {isRTL ? "تبديل المحاور" : "Transpose"}
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 rounded-xl gap-2 font-bold">
                  <Trash2 size={14} />
                  {isRTL ? "مسح الجدول" : "Clear Schedule"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-3xl">
                <AlertDialogHeader><AlertDialogTitle>{isRTL ? "هل أنت متأكد؟" : "Are you sure?"}</AlertDialogTitle></AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl">{t.cancel}</AlertDialogCancel>
                  <AlertDialogAction onClick={() => setAssignments(assignments.filter(a => viewMode === "class" ? a.classId !== selectedId : a.employeeId !== selectedId))} className="bg-red-600 rounded-xl">
                    {isRTL ? "نعم، امسح" : "Yes, Clear"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* العرض في الشاشة */}
          <div className="print:hidden">
            <ScheduleTable 
              isRTL={isRTL} days={DAYS} timeSlots={activeTimeSlots} getAssignment={getAssignment}
              onAddClick={handleAddClick} onDeleteClick={handleDeleteLesson}
              subjects={subjects} employees={employees} classes={classes}
              viewMode={viewMode} summaryData={summaryData} totalHours={filteredAssignments.length}
              isTransposed={isTransposed} allAssignments={assignments} isAdmin={true}
            />
          </div>

          {/* محتوى الطباعة المباشرة */}
          <div className="print-content-master hidden print:block">
            <OfficialPrintWrapper
              title={isRTL ? "الجدول الزمني الأسبوعي" : "Weekly Schedule"}
              subtitle={isRTL ? (viewMode === "class" ? `لفوج : ${selectedEntityName}` : `للأستاذ : ${selectedEntityName}`) : (viewMode === "class" ? `for Class: ${selectedEntityName}` : `for Teacher: ${selectedEntityName}`)}
              orientation={orientation}
            >
              <ScheduleTable 
                isRTL={isRTL} days={DAYS} timeSlots={activeTimeSlots} getAssignment={getAssignment}
                onAddClick={() => {}} onDeleteClick={() => {}}
                subjects={subjects} employees={employees} classes={classes}
                viewMode={viewMode} isPrint={true} summaryData={summaryData} totalHours={filteredAssignments.length}
                isTransposed={isTransposed}
              />
            </OfficialPrintWrapper>
          </div>
        </div>
      ) : (
        <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-emerald-200 print:hidden">
          <Settings2 size={48} className="mx-auto text-emerald-100 mb-4" />
          <p className="text-emerald-900/40 font-bold">{isRTL ? "يرجى اختيار فرع أو معلم لعرض الجدول" : "Please select a branch or teacher to view schedule"}</p>
        </div>
      )}

      <AddLessonDialog 
        isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} isRTL={isRTL} cancelText={t.cancel}
        subjects={subjects} employees={employees} classes={classes} rooms={rooms} viewMode={viewMode}
        newAssignment={newAssignment} setNewAssignment={setNewAssignment} onSave={handleSaveLesson}
      />

      <PrintPreview 
        isOpen={isPreviewOpen} onOpenChange={setIsPreviewOpen} isRTL={isRTL} orientation={orientation} 
        setOrientation={setOrientation} printScale={printScale} setPrintScale={setPrintScale}
        viewMode={viewMode} selectedId={selectedId} employees={employees} classes={classes} subjects={subjects}
        days={DAYS} timeSlots={activeTimeSlots} getAssignment={getAssignment} summaryData={summaryData} 
        totalHours={filteredAssignments.length} isTransposed={isTransposed}
      />
    </div>
  );
};

export default Schedule;