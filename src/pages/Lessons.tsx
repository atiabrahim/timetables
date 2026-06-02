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

  const handleExportCSV = () => {
    if (filteredLessons.length === 0) {
      showSuccess(isRTL ? "لا توجد حصص لتصديرها" : "No lessons to export");
      return;
    }

    // تعريف الأعمدة
    const headers = isRTL 
      ? ["المادة", "الأستاذ", "الفوج", "القاعة", "اليوم", "الحصة"]
      : ["Subject", "Teacher", "Class", "Room", "Day", "Period"];

    // تحويل البيانات إلى أسطر
    const rows = filteredLessons.map(asgn => [
      getSubjectName(asgn.subjectId),
      getTeacherName(asgn.employeeId),
      getClassName(asgn.classId),
      asgn.room || "---",
      getDayName(asgn.day),
      asgn.period
    ]);

    // دمج العناوين والأسطر مع استخدام الفاصلة المنقوطة لتجنب مشاكل التنسيق في إكسل العربي
    const csvContent = [
      headers.join(";"),
      ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(";"))
    ].join("\n");

    // إضافة UTF-8 BOM لضمان قراءة الحروف العربية بشكل صحيح في Excel
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `EduSchedule_Lessons_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showSuccess(isRTL ? "تم تصدير قائمة الحصص بنجاح" : "Lessons list exported successfully");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isRTL ? "قائمة الحصص" : "Lessons List"}
        subtitle={isRTL ? `تصفح وإدارة جميع التوزيعات الزمنية (${filteredLessons.length})` : `Browse and manage all time assignments (${filteredLessons.length})`}
        icon={ListChecks}
        isRTL={isRTL}
      >
        <Button 
          variant="outline" 
          onClick={handleExportCSV}
          className="rounded-xl border-gray-200 gap-2 font-bold text-gray-700 bg-white h-11"
        >
          <Download size={18} />
          {isRTL ? "تصدير CSV" : "Export CSV"}
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