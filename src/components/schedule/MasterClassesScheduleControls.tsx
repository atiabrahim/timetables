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

interface MasterClassesScheduleControlsProps {
  isRTL: boolean;
  t: any;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  selectedClassIds: string[];
  toggleClassId: (id: string) => void;
  classes: any[];
  orientation: "landscape" | "portrait";
  setOrientation: (v: "landscape" | "portrait") => void;
  isTransposed: boolean;
  setIsTransposed: (v: boolean) => void;
}

const MasterClassesScheduleControls = ({
  isRTL,
  t,
  searchTerm,
  setSearchTerm,
  selectedClassIds,
  toggleClassId,
  classes,
  orientation,
  setOrientation,
  isTransposed,
  setIsTransposed
}: MasterClassesScheduleControlsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm mb-4 print:hidden">
      {/* 1. البحث عن فرع */}
      <div className="space-y-1">
        <label className="text-[9px] font-black text-emerald-700 uppercase tracking-widest px-1">
          {isRTL ? "بحث عن فرع" : "Search Branch"}
        </label>
        <div className="relative">
          <Search className={cn("absolute top-1/2 -translate-y-1/2 text-gray-400", isRTL ? "right-2.5" : "left-2.5")} size={14} />
          <Input 
            placeholder={t.search} 
            className={cn("rounded-xl border-emerald-100 bg-white h-9 text-xs", isRTL ? "pr-8" : "pl-8")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 2. الفروع المعنية بالعرض (تحديد متعدد) */}
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

      {/* 3. اتجاه الصفحة */}
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

      {/* 4. تبديل المحاور */}
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
          {isRTL ? "تبديل المحاور (أسطر/أعمدة)" : "Transpose Axes"}
        </Button>
      </div>
    </div>
  );
};

export default MasterClassesScheduleControls;