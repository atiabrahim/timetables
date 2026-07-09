"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  BookOpen, 
  Calendar, 
  MapPin,
  ListChecks,
  GraduationCap,
  FileText,
  UserCheck,
  Sparkles,
  LayoutGrid
} from "lucide-react";
import { format, parse, isWithinInterval } from "date-fns";
import { ar, enUS } from "date-fns/locale";

// Sub-components
import DemoDataBanner from "../components/dashboard/DemoDataBanner";
import QuickFinder from "../components/dashboard/QuickFinder";
import LiveStatusBanner from "../components/dashboard/LiveStatusBanner";
import ConflictsAlert from "../components/dashboard/ConflictsAlert";
import QuickActions from "../components/dashboard/QuickActions";
import StatsGrid from "../components/dashboard/StatsGrid";
import LiveOperations from "../components/dashboard/LiveOperations";
import PedagogicalStats from "../components/dashboard/PedagogicalStats";
import ReadinessBreakdown from "../components/dashboard/ReadinessBreakdown";

const Index = () => {
  const { 
    employees, classes, subjects, assignments, requirements, rooms, isRTL, t, 
    getEffectiveAssignment, language, loadDemoData, periodTimings 
  } = useApp();
  const navigate = useNavigate();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [globalSearch, setGlobalSearch] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const todayIdx = currentTime.getDay();

  const searchResults = useMemo(() => {
    if (!globalSearch.trim()) return [];
    const query = globalSearch.toLowerCase();

    const matchedTeachers = employees
      .filter(e => `${e.firstName} ${e.lastName}`.toLowerCase().includes(query))
      .map(e => ({ id: e.id, name: `${e.lastName} ${e.firstName}`, type: "teacher" as const, sub: e.category }));

    const matchedClasses = classes
      .filter(c => c.name.toLowerCase().includes(query) || (c.code || "").toLowerCase().includes(query))
      .map(c => ({ id: c.id, name: c.name, type: "class" as const, sub: c.code || "" }));

    const matchedRooms = rooms
      .filter(r => r.toLowerCase().includes(query))
      .map(r => ({ id: r, name: r, type: "room" as const, sub: isRTL ? "قاعة دراسية" : "Classroom" }));

    return [...matchedTeachers, ...matchedClasses, ...matchedRooms].slice(0, 6);
  }, [globalSearch, employees, classes, rooms, isRTL]);

  const liveContext = useMemo(() => {
    let currentP = null;
    let nextP = null;

    Object.entries(periodTimings).forEach(([p, range]) => {
      const [start, end] = range.split("-");
      if (!start || !end) return;
      const startTime = parse(start.trim(), "HH:mm", new Date());
      const endTime = parse(end.trim(), "HH:mm", new Date());
      if (isWithinInterval(currentTime, { start: startTime, end: endTime })) {
        currentP = p;
      } else if (startTime > currentTime && (!nextP || startTime < parse(periodTimings[nextP].split("-")[0].trim(), "HH:mm", new Date()))) {
        nextP = p;
      }
    });

    const activeLessons = currentP ? assignments.filter(a => a.day === todayIdx && a.period === currentP) : [];
    const busyTeacherIds = activeLessons.map(a => a.employeeId);
    const busyRooms = activeLessons.map(a => a.room).filter(Boolean);
    const freeStaff = employees.filter(e => !busyTeacherIds.includes(e.id));
    const vacantRooms = rooms.filter(r => !busyRooms.includes(r));

    return { currentP, nextP, activeLessons, freeStaff, vacantRooms };
  }, [currentTime, periodTimings, assignments, todayIdx, employees, rooms]);

  const todayDateStr = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);
  const todayFriendlyName = useMemo(() => {
    const locale = language === "ar" ? ar : enUS;
    return format(new Date(), "EEEE, d MMMM yyyy", { locale });
  }, [language]);

  const conflictsCount = useMemo(() => {
    const teacherSlots: Record<string, string[]> = {};
    const roomSlots: Record<string, string[]> = {};
    let conflicts = 0;
    assignments.forEach(a => {
      const tKey = `${a.day}-${a.period}-${a.employeeId}`;
      if (teacherSlots[tKey]) { if (!teacherSlots[tKey].includes(a.id)) { conflicts++; teacherSlots[tKey].push(a.id); } } 
      else { teacherSlots[tKey] = [a.id]; }
      if (a.room) {
        const rKey = `${a.day}-${a.period}-${a.room}`;
        if (roomSlots[rKey]) { if (!roomSlots[rKey].includes(a.id)) { conflicts++; roomSlots[rKey].push(a.id); } } 
        else { roomSlots[rKey] = [a.id]; }
      }
    });
    return conflicts;
  }, [assignments]);

  const todayDuties = useMemo(() => {
    const periods: ("Morning" | "Afternoon" | "Evening")[] = ["Morning", "Afternoon", "Evening"];
    return periods.map(period => {
      const ids = getEffectiveAssignment(todayDateStr, period);
      const assignedEmployees = ids.map(id => employees.find(e => e.id === id)).filter(Boolean);
      return { period, label: period === "Morning" ? t.morning : period === "Afternoon" ? t.afternoon : t.evening, employees: assignedEmployees, count: assignedEmployees.length };
    });
  }, [todayDateStr, employees, getEffectiveAssignment, t]);

  const stats = useMemo(() => [
    { label: t.stats.teachers, value: employees.length, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50", path: "/employees" },
    { label: t.stats.classes, value: classes.length, icon: GraduationCap, color: "text-blue-600", bg: "bg-blue-50", path: "/classes" },
    { label: t.stats.subjects, value: subjects.length, icon: BookOpen, color: "text-amber-600", bg: "bg-amber-50", path: "/subjects" },
    { label: t.stats.rooms, value: rooms.length, icon: MapPin, color: "text-rose-600", bg: "bg-rose-50", path: "/rooms" },
  ], [employees, classes, subjects, rooms, t]);

  const quickActions = [
    { label: isRTL ? "إضافة حصة" : "Add Lesson", icon: Calendar, path: "/schedule", color: "bg-emerald-100 text-emerald-700" },
    { label: isRTL ? "الجدول العام" : "Master Schedule", icon: LayoutGrid, path: "/master-schedule", color: "bg-rose-100 text-rose-700" },
    { label: isRTL ? "المولد التلقائي" : "Auto Generator", icon: Sparkles, path: "/auto-generator", color: "bg-teal-100 text-teal-700" },
    { label: isRTL ? "تكليف يومي" : "Assign Duty", icon: UserCheck, path: "/assignments", color: "bg-blue-100 text-blue-700" },
    { label: isRTL ? "تقرير الحضور" : "Attendance", icon: FileText, path: "/reports-new", color: "bg-amber-100 text-amber-700" },
  ];

  // Calculation for Overall readiness
  const completionPercentage = useMemo(() => {
    if (requirements.length === 0) {
      if (classes.length === 0) return 0;
      const totalPotentialLessons = classes.length * 30;
      return Math.min(Math.round((assignments.length / totalPotentialLessons) * 100), 100) || 0;
    }
    const totalRequired = requirements.reduce((sum, r) => sum + r.count, 0);
    const totalPlaced = requirements.reduce((sum, r) => {
      const placed = assignments.filter(a => a.subjectId === r.subjectId && a.employeeId === r.employeeId && a.classId === r.classId).length;
      return sum + Math.min(placed, r.count);
    }, 0);
    return Math.round((totalPlaced / totalRequired) * 100);
  }, [assignments, requirements, classes]);

  // Breakdown for the new component
  const classReadinessData = useMemo(() => {
    return classes.map(cls => {
      const clsReqs = requirements.filter(r => r.classId === cls.id);
      let percentage = 0;
      if (clsReqs.length === 0) {
        const count = assignments.filter(a => a.classId === cls.id).length;
        percentage = Math.min(Math.round((count / 30) * 100), 100);
      } else {
        const totalReq = clsReqs.reduce((s, r) => s + r.count, 0);
        const placed = clsReqs.reduce((s, r) => {
          const count = assignments.filter(a => a.classId === r.classId && a.subjectId === r.subjectId && a.employeeId === r.employeeId).length;
          return s + Math.min(count, r.count);
        }, 0);
        percentage = Math.round((placed / totalReq) * 100);
      }
      return { id: cls.id, name: cls.name, percentage, isComplete: percentage === 100 };
    }).sort((a, b) => a.percentage - b.percentage);
  }, [classes, requirements, assignments]);

  const isSystemEmpty = useMemo(() => employees.length === 0 && classes.length === 0, [employees, classes]);
  const occupiedRoomsCount = useMemo(() => rooms.filter(r => assignments.some(a => a.room === r)).length, [rooms, assignments]);

  return (
    <div className="space-y-10 pb-20">
      {isSystemEmpty && (
        <DemoDataBanner isRTL={isRTL} loadDemoData={loadDemoData} />
      )}

      <div ref={searchRef}>
        <QuickFinder 
          globalSearch={globalSearch}
          setGlobalSearch={setGlobalSearch}
          isSearchFocused={isSearchFocused}
          setIsSearchFocused={setIsSearchFocused}
          searchResults={searchResults}
          isRTL={isRTL}
          onSelectResult={(type, id) => {
            setIsSearchFocused(false);
            setGlobalSearch("");
            navigate(`/schedule?view=${type}&id=${id}`);
          }}
        />
      </div>

      <LiveStatusBanner currentTime={currentTime} liveContext={liveContext} isRTL={isRTL} t={t} employees={employees} />

      {conflictsCount > 0 && (
        <ConflictsAlert conflictsCount={conflictsCount} isRTL={isRTL} onResolveClick={() => navigate("/schedule")} />
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <QuickActions actions={quickActions} onActionClick={(path) => navigate(path)} />
          <StatsGrid stats={stats} onStatClick={(path) => navigate(path)} />
          <LiveOperations todayFriendlyName={todayFriendlyName} todayDuties={todayDuties} isRTL={isRTL} onAssignClick={() => navigate("/assignments")} />
        </div>

        <div className="space-y-8">
          <PedagogicalStats completionPercentage={completionPercentage} roomsCount={rooms.length} occupiedRoomsCount={occupiedRoomsCount} conflictsCount={conflictsCount} isRTL={isRTL} onAnalyticsClick={() => navigate("/reports")} />
          <ReadinessBreakdown data={classReadinessData} isRTL={isRTL} />
        </div>
      </div>
    </div>
  );
};

export default Index;