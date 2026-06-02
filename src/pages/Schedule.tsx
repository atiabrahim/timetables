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
  const [isTransposed, setIsTransposed] = useState(false);
  
  const [newAssignment, setNewAssignment] = useState({
    employeeId: "", subjectId: "", classId: "", room: "", department: ""
  });

  // تصفية الحصص بناءً على الاختيار
  const filteredAssignments = useMemo(() => {
    if (!selectedId) return [];
    return assignments.filter(a => 
      viewMode === "class" ? a.classId === selectedId : a.employeeId === selectedId
    );
  }, [assignments, selectedId, viewMode]);

  // توليد خانات الحصص (1-12)
  const periodSlots = useMemo(() => {
    return PERIODS.map(id => ({
      id,
      label: id,
      periodPart: PERIOD_MAP[id] as "Morning" | "Afternoon" | "Evening",
      isBreak: false,
      time: ""
    }));
  }, []);

  // الحصص النشطة فقط (التي تحتوي على حصص بالفعل لتجنب الأسطر الفارغة)
  const activeTimeSlots = useMemo(() => {
    const usedIds = filteredAssignments.map(a => a.period);
    if (usedIds.length === 0) {
      // إذا لم تكن هناك حصص مسجلة بعد، نعرض أول 4 حصص كافتراضي
      return periodSlots.filter(p => parseInt(p.id) <= 4);
    }
    // إرجاع الحصص التي تحتوي على دروس فقط لمنع ظهور الأسطر الفارغة
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
    setAssignments([...assignments, {
      id,
      ...newAssignment,
      day: editingCell.day,
      period: editingCell.period
    }]);
    
    setIsDialogOpen(false);
    showSuccess(isRTL ? "تمت إضافة الحصة" : "Lesson added");
  };

  const handleDeleteLesson = (id: string) => {
    setAssignments(assignments.filter(a => a.id !== id));
    showSuccess(isRTL ? "تم حذف الحصة" : "Lesson deleted");
  };

  // بيانات التقرير الجانبي (Summary)
  const summaryData = useMemo(() => {
    const data: any[] = [];
    filteredAssignments.forEach(asgn => {
      const sub = subjects.find(s => s.id === asgn.subjectId)?.name || "---";
      const teacher = employees.find(e => e.id === asgn.employeeId);
      const teacherName = teacher ? `${teacher.lastName} ${teacher.firstName}` : "---";
      const className = classes.find(c => c.id === asgn.classId)?.name || "---";
      
      const existing = data.find(d => d.subject === sub && (viewMode === "class" ? d.teacher === teacherName : d.branch === className));
      if (existing) {
        existing.count++;
      } else {
        data.push({
          subject: sub,
          teacher: teacherName,
          branch: className,
          count: 1
        });
      }
    });
    return data;
  }, [filteredAssignments, subjects, employees, classes, viewMode]);

  const selectedEntity = viewMode === "teacher" 
    ? employees.find(e => e.id === selectedId) 
    : classes.find(c => c.id === selectedId);

  const entityName = viewMode === "teacher"
    ? (selectedEntity ? `${selectedEntity.lastName} ${selectedEntity.firstName}` : "---")
    : (selectedEntity ? selectedEntity.name : "---");

  const title = viewMode === "teacher"
    ? (isRTL ? `جدول توقيت الأستاذ: ${entityName}` : `Teacher Timetable: ${entityName}`)
    : (isRTL ? `جدول توقيت الفوج: ${entityName}` : `Class Timetable: ${entityName}`);

  const subtitle = (
    <div className="flex items-center gap-4 text-xs md:text-sm font-bold text-emerald-800">
      <span>{entityName}</span>
      <span className="text-emerald-200 h-4 w-px bg-emerald-200"></span>
      <span>{isRTL ? "الجدول الأسبوعي" : "Weekly Schedule"}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <ScheduleHeader 
        isRTL={isRTL} 
        viewMode={viewMode} setViewMode={setViewMode}
        selectedId={selectedId} setSelectedId={setSelectedId}
        classes={classes} employees={employees}
        onPreview={() => setIsPreviewOpen(true)}
      />

      {selectedId ? (
        <div className="space-y-4">
          <div className="flex justify-end gap-2 print:hidden">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsTransposed(!isTransposed)}
              className="rounded-xl border-emerald-100 text-emerald-700 font-bold gap-2"
            >
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
                <AlertDialogHeader>
                  <AlertDialogTitle>{isRTL ? "هل أنت متأكد؟" : "Are you sure?"}</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl">{t.cancel}</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => setAssignments(assignments.filter(a => viewMode === "class" ? a.classId !== selectedId : a.employeeId !== selectedId))}
                    className="bg-red-600 rounded-xl"
                  >
                    {isRTL ? "نعم، امسح" : "Yes, Clear"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="print:hidden">
            <ScheduleTable 
              isRTL={isRTL} 
              days={DAYS} 
              timeSlots={activeTimeSlots} 
              getAssignment={getAssignment}
              onAddClick={handleAddClick}
              onDeleteClick={handleDeleteLesson}
              subjects={subjects}
              employees={employees}
              classes={classes}
              viewMode={viewMode}
              summaryData={summaryData}
              totalHours={filteredAssignments.length}
              isTransposed={isTransposed}
            />
          </div>
        </div>
      ) : (
        <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-emerald-200 print:hidden">
          <Settings2 size={48} className="mx-auto text-emerald-100 mb-4" />
          <p className="text-emerald-900/40 font-bold">{isRTL ? "يرجى اختيار فرع أو معلم لعرض الجدول" : "Please select a branch or teacher to view schedule"}</p>
        </div>
      )}

      {selectedId && (
        <div className="print-content-master hidden print:block">
          <OfficialPrintWrapper
            title={title}
            subtitle={subtitle}
            orientation={orientation}
            leftSignatureTitle={isRTL ? "توقيع الأستاذ" : "Teacher Signature"}
            rightSignatureTitle={isRTL ? "ختم وتوقيع المدير" : "Director Signature"}
          >
            <ScheduleTable 
              isRTL={isRTL} days={DAYS} timeSlots={activeTimeSlots} getAssignment={getAssignment} 
              onAddClick={() => {}} onDeleteClick={() => {}} subjects={subjects} employees={employees} 
              classes={classes} viewMode={viewMode} isPrint={true} summaryData={summaryData} totalHours={filteredAssignments.length}
              isTransposed={isTransposed}
            />
          </OfficialPrintWrapper>
        </div>
      )}

      <AddLessonDialog 
        isOpen={isDialogOpen} onOpenChange={setIsDialogOpen}
        isRTL={isRTL} cancelText={t.cancel}
        subjects={subjects} employees={employees} classes={classes}
        rooms={rooms} viewMode={viewMode}
        newAssignment={newAssignment} setNewAssignment={setNewAssignment}
        onSave={handleSaveLesson}
      />

      <PrintPreview 
        isOpen={isPreviewOpen} onOpenChange={setIsPreviewOpen}
        isRTL={isRTL} orientation={orientation} setOrientation={setOrientation}
        printScale={printScale} setPrintScale={setPrintScale}
        viewMode={viewMode} selectedId={selectedId}
        employees={employees} classes={classes} subjects={subjects}
        days={DAYS} timeSlots={activeTimeSlots} getAssignment={getAssignment}
        summaryData={summaryData} totalHours={filteredAssignments.length}
        isTransposed={isTransposed}
      />
    </div>
  );
};

export default Schedule;