"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  FilterX,
  ListChecks
} from "lucide-react";
import { showSuccess } from "../utils/toast";
import LessonFilters from "../components/lessons/LessonFilters";
import LessonTable from "../components/lessons/LessonTable";
import EditLessonDialog from "../components/lessons/EditLessonDialog";
import PageHeader from "../components/shared/PageHeader";
import { DAYS, PERIODS } from "../constants/schedule";

const Lessons = () => {
  const { 
    assignments, setAssignments, 
    subjects, employees, classes, 
    isRTL, user, t 
  } = useApp();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterTeacher, setFilterTeacher] = useState("all");
  const [filterClass, setFilterClass] = useState("all");

  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const isAdmin = user?.role === "Admin";

  const getSubjectName = (id: string) => subjects.find(s => s.id === id)?.name || "---";
  const getTeacherName = (id: string) => {
    const emp = employees.find(e => e.id === id);
    return emp ? `${emp.lastName} ${emp.firstName}` : "---";
  };
  const getClassName = (id: string) => classes.find(c => c.id === id)?.name || "---";
  const getDayName = (id: number) => DAYS.find(d => d.id === id)?.[isRTL ? 'name' : 'en'] || "---";

  const filteredLessons = useMemo(() => {
    return assignments.filter(asgn => {
      const matchesSearch = `${getSubjectName(asgn.subjectId)} ${getTeacherName(asgn.employeeId)} ${getClassName(asgn.classId)} ${asgn.room} ${asgn.department}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      
      const matchesSubject = filterSubject === "all" || asgn.subjectId === filterSubject;
      const matchesTeacher = filterTeacher === "all" || asgn.employeeId === filterTeacher;
      const matchesClass = filterClass === "all" || asgn.classId === filterClass;

      return matchesSearch && matchesSubject && matchesTeacher && matchesClass;
    });
  }, [assignments, searchTerm, filterSubject, filterTeacher, filterClass, subjects, employees, classes]);

  const resetFilters = () => {
    setSearchTerm("");
    setFilterSubject("all");
    setFilterTeacher("all");
    setFilterClass("all");
  };

  const handleDelete = (id: string) => {
    setAssignments(assignments.filter(a => a.id !== id));
    showSuccess(isRTL ? "تم حذف الحصة بنجاح" : "Lesson deleted successfully");
  };

  const handleEditClick = (lesson: any) => {
    setEditingLesson({ ...lesson });
    setIsEditDialogOpen(true);
  };

  const handleUpdateLesson = () => {
    if (!editingLesson) return;
    setAssignments(assignments.map(a => a.id === editingLesson.id ? editingLesson : a));
    setIsEditDialogOpen(false);
    showSuccess(isRTL ? "تم تحديث بيانات الحصة" : "Lesson updated successfully");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isRTL ? "قائمة الحصص" : "Lessons List"}
        subtitle={isRTL ? `تصفح وإدارة جميع التوزيعات الزمنية (${filteredLessons.length})` : `Browse and manage all time assignments (${filteredLessons.length})`}
        icon={ListChecks}
        isRTL={isRTL}
      >
        <Button variant="outline" className="rounded-xl border-gray-200 gap-2 font-bold text-gray-700 bg-white h-11">
          <Download size={18} />
          {isRTL ? "تصدير" : "Export"}
        </Button>
        <Button 
          variant="ghost" 
          onClick={resetFilters}
          className="rounded-xl text-gray-500 hover:text-red-500 gap-2 font-bold h-11"
        >
          <FilterX size={18} />
          {isRTL ? "إعادة ضبط" : "Reset"}
        </Button>
      </PageHeader>

      <LessonFilters 
        isRTL={isRTL}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterSubject={filterSubject}
        setFilterSubject={setFilterSubject}
        filterTeacher={filterTeacher}
        setFilterTeacher={setFilterTeacher}
        filterClass={filterClass}
        setFilterClass={setFilterClass}
        subjects={subjects}
        employees={employees}
        classes={classes}
      />

      <LessonTable 
        lessons={filteredLessons}
        isRTL={isRTL}
        isAdmin={isAdmin}
        getSubjectName={getSubjectName}
        getTeacherName={getTeacherName}
        getClassName={getClassName}
        getDayName={getDayName}
        onEdit={handleEditClick}
        onDelete={handleDelete}
        onReset={resetFilters}
      />

      <EditLessonDialog 
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        isRTL={isRTL}
        editingLesson={editingLesson}
        setEditingLesson={setEditingLesson}
        subjects={subjects}
        employees={employees}
        classes={classes}
        DAYS={DAYS}
        PERIODS={PERIODS}
        onSave={handleUpdateLesson}
        cancelText={t.cancel}
      />
    </div>
  );
};

export default Lessons;