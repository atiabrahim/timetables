"use client";

import React from "react";
import { Calendar as CalendarIcon, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface ScheduleHeaderProps {
  isRTL: boolean;
  viewMode: "class" | "teacher";
  setViewMode: (mode: "class" | "teacher") => void;
  selectedId: string;
  setSelectedId: (id: string) => void;
  classes: any[];
  employees: any[];
  onPreview: () => void;
}

const ScheduleHeader = ({ 
  isRTL, viewMode, setViewMode, selectedId, setSelectedId, classes, employees, onPreview 
}: ScheduleHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
      <div>
        <h2 className="text-3xl font-black text-emerald-950 flex items-center gap-3">
          <CalendarIcon className="text-emerald-600" />
          {isRTL ? "إدارة الجدول الدراسي" : "Schedule Management"}
        </h2>
        <p className="text-emerald-600/70 font-bold mt-1">
          {isRTL ? "توزيع الحصص والمهام الأسبوعية" : "Weekly lesson distribution"}
        </p>
      </div>

      <div className="flex flex-wrap gap-3 items-center bg-white p-2 rounded-2xl border border-emerald-100 shadow-sm">
        <Select value={viewMode} onValueChange={(v: any) => { setViewMode(v); setSelectedId(""); }}>
          <SelectTrigger className="w-[130px] rounded-xl border-none bg-emerald-50/50 font-bold">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="class">{isRTL ? "الفوج" : "Class"}</SelectItem>
            <SelectItem value="teacher">{isRTL ? "الأستاذ" : "Teacher"}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger className="w-[180px] rounded-xl border-none bg-emerald-50/50 font-bold">
            <SelectValue placeholder={isRTL ? "اختر..." : "Select..."} />
          </SelectTrigger>
          <SelectContent>
            {viewMode === "class" 
              ? classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)
              : employees.map(e => <SelectItem key={e.id} value={e.id}>{e.lastName} {e.firstName}</SelectItem>)
            }
          </SelectContent>
        </Select>

        <Button 
          onClick={onPreview} 
          disabled={!selectedId}
          className="bg-emerald-600 hover:bg-emerald-700 rounded-xl gap-2 font-bold shadow-lg shadow-emerald-100"
        >
          <Printer size={18} />
          {isRTL ? "معاينة وطباعة" : "Preview & Print"}
        </Button>
      </div>
    </div>
  );
};

export default ScheduleHeader;