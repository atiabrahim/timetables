"use client";

import React from "react";
import { Search, SlidersHorizontal, ArrowLeftRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { PeriodPart } from "@/types";

interface WeeklyWorkScheduleControlsProps {
  isRTL: boolean;
  t: any;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  selectedClassIds: string[];
  toggleClassId: (id: string) => void;
  classes: any[];
  selectedPeriodParts: PeriodPart[];
  togglePeriodPart: (part: PeriodPart) => void;
  orientation: "landscape" | "portrait";
  setOrientation: (v: "landscape" | "portrait") => void;
  isTransposed: boolean;
  setIsTransposed: (v: boolean) => void;
}

const WeeklyWorkScheduleControls = ({
  isRTL,
  t,
  searchTerm,
  setSearchTerm,
  selectedClassIds,
  toggleClassId,
  classes,
  selectedPeriodParts,
  togglePeriodPart,
  orientation,
  setOrientation,
  isTransposed,
  setIsTransposed
}: WeeklyWorkScheduleControlsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm transition-all duration-300 print:hidden">
      {/* 1. البحث */}
      <div className="space-y-1">
        <label className="text-[9px] font-black text-emerald-700 uppercase tracking-widest px-1">
          {isRTL ? "بحث عن معلم" : "Search Teacher"}
        </label>
        <div className="relative">
          <Search className={cn("absolute top-1/2 -translate-y-1/2 text-gray-400", isRTL ? "right-2.5" : "left-2.5")} size={14} />
          <Input 
            placeholder={t.search} 
            className={cn("rounded-xl border-emerald-100 bg-slate-50/30 h-9 text-xs", isRTL ? "pr-8" : "pl-8")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 2. تصفية الفروع */}
      <div className="space-y-1">
        <label className="text-[9px] font-black text-emerald-700 uppercase tracking-widest px-1">
          {isRTL ? "الفروع المعنية بالعرض" : "Target Branches"}
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="rounded-xl border-emerald-100 bg-slate-50/30 h-9 font-bold text-xs w-full justify-between">
              <span className="truncate">
                {selectedClassIds.includes("all") 
                  ? (isRTL ? "جميع الفروع" : "All Branches") 
                  : (isRTL ? `محدد (${selectedClassIds.length})` : `Selected (${selectedClassIds.length})`)}
              </span>
              <SlidersHorizontal size={12} className="opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60 p-2 rounded-2xl bg-white border border-slate-100 shadow-xl max-h-64 overflow-y-auto z-[999]">
            <div className="space-y-1">
              <div 
                className="flex items-center gap-2.5 p-2 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors"
                onClick={() => toggleClassId("all")}
              >
                <Checkbox checked={selectedClassIds.includes("all")} />
                <span className="text-xs font-bold">{isRTL ? "جميع الفروع" : "All Branches"}</span>
              </div>
              {classes.map(c => (
                <div 
                  key={c.id} 
                  className="flex items-center gap-2.5 p-2 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors"
                  onClick={() => toggleClassId(c.id)}
                >
                  <Checkbox checked={selectedClassIds.includes(c.id)} />
                  <span className="text-xs font-bold">{c.name}</span>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* 3. تصفية الفترات */}
      <div className="space-y-1">
        <label className="text-[9px] font-black text-emerald-700 uppercase tracking-widest px-1">
          {isRTL ? "الحصص المعنية بالعرض" : "Target Periods"}
        </label>
        <div className="flex items-center gap-3 h-9 px-2 bg-slate-50/30 border border-emerald-100 rounded-xl">
          {[ 
            { id: "Morning" as PeriodPart, label: isRTL ? "ص" : "M" }, 
            { id: "Afternoon" as PeriodPart, label: isRTL ? "م" : "A" }, 
            { id: "Evening" as PeriodPart, label: isRTL ? "ل" : "E" } 
          ].map(part => (
            <div key={part.id} className="flex items-center gap-1 cursor-pointer" onClick={() => togglePeriodPart(part.id)}>
              <Checkbox 
                checked={selectedPeriodParts.includes(part.id)} 
                className="h-3.5 w-3.5 rounded border-emerald-200 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600" 
              />
              <span className="text-[10px] font-black text-slate-700">{part.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. اتجاه الصفحة */}
      <div className="space-y-1">
        <label className="text-[9px] font-black text-emerald-700 uppercase tracking-widest px-1">
          {isRTL ? "اتجاه الصفحة" : "Page Orientation"}
        </label>
        <Select value={orientation} onValueChange={(v: any) => setOrientation(v)}>
          <SelectTrigger className="rounded-xl border-emerald-100 bg-slate-50/30 h-9 font-bold text-xs">
            <SelectValue placeholder={isRTL ? "اتجاه الصفحة" : "Orientation"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="landscape">{isRTL ? "عرضي" : "Landscape"}</SelectItem>
            <SelectItem value="portrait">{isRTL ? "طولي" : "Portrait"}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 5. تبديل المحاور */}
      <div className="space-y-1 flex flex-col justify-end">
        <Button 
          variant="outline" 
          onClick={() => setIsTransposed(!isTransposed)} 
          className={cn(
            "rounded-xl border-emerald-100 font-bold gap-1.5 h-9 w-full transition-all text-xs", 
            isTransposed ? "bg-emerald-600 text-white border-emerald-600" : "bg-slate-50/30 text-emerald-700 hover:bg-emerald-50"
          )}
        >
          <ArrowLeftRight size={14} />
          {isRTL ? "تبديل المحاور" : "Transpose Axes"}
        </Button>
      </div>
    </div>
  );
};

export default WeeklyWorkScheduleControls;