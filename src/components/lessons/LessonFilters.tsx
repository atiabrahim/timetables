"use client";

import React from "react";
import { Search, FilterX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface LessonFiltersProps {
  isRTL: boolean;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  filterSubject: string;
  setFilterSubject: (v: string) => void;
  filterTeacher: string;
  setFilterTeacher: (v: string) => void;
  filterClass: string;
  setFilterClass: (v: string) => void;
  subjects: any[];
  employees: any[];
  classes: any[];
  onReset: () => void;
}

const LessonFilters = ({
  isRTL, searchTerm, setSearchTerm, filterSubject, setFilterSubject,
  filterTeacher, setFilterTeacher, filterClass, setFilterClass,
  subjects, employees, classes, onReset
}: LessonFiltersProps) => {
  return (
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
            <SelectItem value="all">{isRTL ?<dyad-write path="src/components/lessons/LessonFilters.tsx" description="Completing the LessonFilters component.">
"use client";

import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface LessonFiltersProps {
  isRTL: boolean;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  filterSubject: string;
  setFilterSubject: (v: string) => void;
  filterTeacher: string;
  setFilterTeacher: (v: string) => void;
  filterClass: string;
  setFilterClass: (v: string) => void;
  subjects: any[];
  employees: any[];
  classes: any[];
}

const LessonFilters = ({
  isRTL, searchTerm, setSearchTerm, filterSubject, setFilterSubject,
  filterTeacher, setFilterTeacher, filterClass, setFilterClass,
  subjects, employees, classes
}: LessonFiltersProps) => {
  return (
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
  );
};

export default LessonFilters;