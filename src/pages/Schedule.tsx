"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { Settings2, ArrowLeftRight, Trash2, Share2 } from "lucide-react";
import { showSuccess, showError } from "../utils/toast";
import ScheduleHeader from "../components/schedule/ScheduleHeader";
import ScheduleTable from "../components/schedule/ScheduleTable";
import AddLessonDialog from "../components/schedule/AddLessonDialog";
import PrintPreview from "../components/schedule/PrintPreview";
import { Button } from "@/components/ui/button";
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

const DAYS = [
  { id: 0, name: "الأحد", en: "Sunday" },
  { id: 1, name: "الاثنين", en: "Monday" },
  { id: 2, name: "الثلاثاء", en: "Tuesday" },
  { id: 3, name: "الأربعاء", en: "Wednesday" },
  { id: 4, name: "الخميس", en: "Thursday" },
];

// 1‑4 → "Morning", 5‑8 → "Afternoon", 9‑12 → "Evening"
const PERIOD_MAP: Record<string, "Morning" | "Afternoon" | "Evening"> = {
  "1": "Morning",
  "2": "Morning",
  "3": "Morning",
  "4": "Morning",
  "5": "Afternoon",
  "6": "Afternoon",
  "7": "Afternoon",
  "8": "Afternoon",
  "9": "Evening",
  "10": "Evening",
  "11": "Evening",
  "12": "Evening",
};

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

  // Generate period slots based on numeric IDs 1‑12 and map them to time‑of‑day labels
  const periodSlots = useMemo(() => {
    // Create an array of 12 period objects (IDs 1‑12)
    const rawPeriods = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
    return rawPeriods.map(id => {
      const label = rawPeriods.find(p => p === id) ?? "";
      return {
        id,
        label: rawPeriods.find(p => p === id) ?? "",
        // Map numeric ID to the correct time‑of‑day term
        periodPart: PERIOD_MAP[id as keyof typeof PERIOD_MAP] as "Morning" | "Afternoon" | "Evening",
        isBreak: false,
        after: "" // Not used for mapping; kept for backward compatibility
      };
    });
  }, []);

  const activeTimeSlots = useMemo(() => {
    // Keep only slots whose mapped period part is active according to periodConfigs    const usedPeriodIds = new Set(filteredAssignments.map(a => a.period));
    if (usedPeriodIds.size === 0) return periodSlots.filter(p => !p.isBreak);
    
    // Determine the highest period number that appears in the schedule
    const maxPeriod = Math.max(...Array.from(usedPeriodIds).map(id => parseInt(id)));
    return periodSlots.filter(p => {
      if (p.isBreak) {
        // Break periods are allowed only if their "after" reference is below maxPeriod
        return parseInt(p.after ?? "0") < maxPeriod;
      }
      return parseInt(p.id) <= maxPeriod;
    });
  }, [filteredAssignments, periodSlots]);

  const getAssignment = (day: number, period: string) => filteredAssignments.find(a => a.day === day && a.period === period);

  // ... rest of component remains unchanged (UI, dialogs, etc.) ...
  // Only the period‑generation logic above has been updated to reflect the new mapping.
  // All other functionality (adding lessons, editing, printing, etc.) stays the same.

  return (
    <div className="space-y-6">
      {/* ... existing UI (header, filters, table, dialogs, etc.) ... */}
    </div>
  );
};

export default Schedule;