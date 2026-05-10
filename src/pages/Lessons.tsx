"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Download, 
  Trash2, 
  BookOpen,
  User,
  GraduationCap,
  MapPin,
  FilterX,
  Clock,
  Building2
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { showSuccess } from "../utils/toast";

const DAYS = [
  { id: 0, name: "الأحد", en: "Sunday" },
  { id: 1, name: "الاثنين", en: "Monday" },
  { id: 2, name: "الثلاثاء", en: "Tuesday" },
  { id: 3, name: "الأربعاء", en: "Wednesday" },
  { id: 4, name: "الخميس", en: "Thursday" },
];

const Lessons = () => {
  const { 
    assignments, setAssignments, 
    subjects, employees, classes, 
    isRTL, user 
  } = useApp();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterTeacher, setFilterTeacher] = useState("all");
  const [filterClass, setFilterClass] = useState("all");

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

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="text-right">
          <h2 className="text-3xl font-black text-gray-900">
            {isRTL ? "قائمة الحصص" : "Lessons List"} 
            <span className="text-gray-400 text-xl mr-2">({filteredLessons.length})</span>
          </h2>
          <p className="text-gray-500 text-sm font-bold mt-1">
            {isRTL ? "تصفح وإدارة جميع التوزيعات الزمنية" : "Browse and manage all time assignments"}
          </p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="rounded-xl border-gray-200 gap-2 font-bold text-gray-700 flex-1 md:flex-none">
            <Download size={18} />
            {isRTL ? "تصدير" : "Export"}
          </Button>
          <Button 
            variant="ghost" 
            onClick={resetFilters}
            className="rounded-xl text-gray-500 hover:text-red-500 gap-2 font-bold"
          >
            <FilterX size={18} />
            {isRTL ? "إعادة ضبط" : "Reset"}
          </Button>
        </div>
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest px-1">
            {isRTL ? "بحث عام" : "General Search"}
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <Input 
              placeholder={isRTL ? "ابحث هنا..." : "Search here..."} 
              className="pl-10 rounded-xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest px-1">
            {isRTL ? "المادة" : "Subject"}
          </label>
          <Select value={filterSubject} onValueChange={setFilterSubject}>
            <SelectTrigger className="rounded-xl border-gray-100 bg-gray-50/50">
              <SelectValue placeholder={isRTL ? "الكل" : "All"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isRTL ? "جميع المواد" : "All Subjects"}</SelectItem>
              {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest px-1">
            {isRTL ? "الأستاذ" : "Teacher"}
          </label>
          <Select value={filterTeacher} onValueChange={setFilterTeacher}>
            <SelectTrigger className="rounded-xl border-gray-100 bg-gray-50/50">
              <SelectValue placeholder={isRTL ? "الكل" : "All"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isRTL ? "جميع الأساتذة" : "All Teachers"}</SelectItem>
              {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.lastName} {e.firstName}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest px-1">
            {isRTL ? "الفرع / الفوج" : "Branch / Class"}
          </label>
          <Select value={filterClass} onValueChange={setFilterClass}>
            <SelectTrigger className="rounded-xl border-gray-100 bg-gray-50/50">
              <SelectValue placeholder={isRTL ? "الكل" : "All"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isRTL ? "جميع الأفواج" : "All Classes"}</SelectItem>
              {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-right">
            <thead>
              <tr className="bg-[#f9f9f1]">
                <th className="p-5 text-gray-700 font-bold text-sm border-b border-gray-100">
                  {isRTL ? "المادة" : "Subject"}
                </th>
                <th className="p-5 text-gray-700 font-bold text-sm border-b border-gray-100">
                  {isRTL ? "الأستاذ" : "Teacher"}
                </th>
                <th className="p-5 text-gray-700 font-bold text-sm border-b border-gray-100">
                  {isRTL ? "الفوج" : "Class"}
                </th>
                <th className="p-5 text-gray-700 font-bold text-sm border-b border-gray-100">
                  {isRTL ? "اسم القاعدة" : "Base Name"}
                </th>
                <th className="p-5 text-gray-700 font-bold text-sm border-b border-gray-100">
                  {isRTL ? "التوقيت" : "Timing"}
                </th>
                {isAdmin && (
                  <th className="p-5 text-gray-700 font-bold text-sm border-b border-gray-100 text-center">
                    {isRTL ? "إجراءات" : "Actions"}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredLessons.map((asgn) => (
                <tr key={asgn.id} className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 group">
                  <td className="p-5">
                    <div className="flex items-center justify-end gap-3">
                      <span className="font-bold text-emerald-900">{getSubjectName(asgn.subjectId)}</span>
                      <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                        <BookOpen size={14} />
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-gray-700 font-medium">{getTeacherName(asgn.employeeId)}</span>
                      <User size={14} className="text-gray-400" />
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-tighter inline-flex items-center gap-1.5">
                      <GraduationCap size={12} />
                      {getClassName(asgn.classId)}
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center justify-end gap-1.5 text-gray-600 text-xs font-bold">
                      {asgn.department || "---"}
                      <Building2 size={12} className="text-emerald-500" />
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-bold text-gray-900">{getDayName(asgn.day)}</span>
                      <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold">
                        <Clock size={10} />
                        {isRTL ? "الحصة" : "Period"} {asgn.period}
                      </div>
                    </div>
                  </td>
                  {isAdmin && (
                    <td className="p-5 text-center">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDelete(asgn.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLessons.length === 0 && (
          <div className="text-center py-24 bg-gray-50/50">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-gray-300" />
            </div>
            <p className="text-gray-400 font-bold">{isRTL ? "لا توجد حصص مطابقة لخيارات التصفية" : "No lessons match your filter criteria"}</p>
            <Button variant="link" onClick={resetFilters} className="text-emerald-600 font-bold mt-2">
              {isRTL ? "إظهار كافة الحصص" : "Show all lessons"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Lessons;