"use client";

import React from "react";
import { Search, SlidersHorizontal, ArrowLeftRight, MapPin } from "lucide-react";
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

interface MasterRoomsScheduleControlsProps {
  isRTL: boolean;
  t: any;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  selectedRoomNames: string[];
  toggleRoomName: (name: string) => void;
  rooms: string[];
  orientation: "landscape" | "portrait";
  setOrientation: (v: "landscape" | "portrait") => void;
  isTransposed: boolean;
  setIsTransposed: (v: boolean) => void;
}

const MasterRoomsScheduleControls = ({
  isRTL,
  t,
  searchTerm,
  setSearchTerm,
  selectedRoomNames,
  toggleRoomName,
  rooms,
  orientation,
  setOrientation,
  isTransposed,
  setIsTransposed
}: MasterRoomsScheduleControlsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm mb-4 print:hidden">
      {/* 1. Search */}
      <div className="space-y-1">
        <label className="text-[9px] font-black text-emerald-700 uppercase tracking-widest px-1">
          {isRTL ? "بحث عن قاعة" : "Search Room"}
        </label>
        <div className="relative">
          <Search className={cn("absolute top-1/2 -translate-y-1/2 text-gray-400", isRTL ? "right-2.5" : "left-2.5")} size={14} />
          <Input 
            placeholder={isRTL ? "بحث..." : "Search..."} 
            className={cn("rounded-xl border-emerald-100 bg-white h-9 text-xs", isRTL ? "pr-8" : "pl-8")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 2. Target Rooms Selection */}
      <div className="space-y-1">
        <label className="text-[9px] font-black text-emerald-700 uppercase tracking-widest px-1">
          {isRTL ? "القاعات المعنية بالعرض" : "Target Rooms"}
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="rounded-xl border-emerald-100 bg-slate-50/30 h-9 font-bold text-xs w-full justify-between">
              <span className="truncate">
                {selectedRoomNames.includes("all") 
                  ? (isRTL ? "جميع القاعات" : "All Rooms") 
                  : (isRTL ? `محدد (${selectedRoomNames.length})` : `Selected (${selectedRoomNames.length})`)}
              </span>
              <SlidersHorizontal size={12} className="opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60 p-2 rounded-2xl bg-white border border-slate-100 shadow-xl max-h-64 overflow-y-auto z-[999]">
            <div className="space-y-1">
              <div 
                className="flex items-center gap-2.5 p-2 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors"
                onClick={() => toggleRoomName("all")}
              >
                <Checkbox checked={selectedRoomNames.includes("all")} />
                <span className="text-xs font-bold">{isRTL ? "جميع القاعات" : "All Rooms"}</span>
              </div>
              {rooms.map(room => (
                <div 
                  key={room} 
                  className="flex items-center gap-2.5 p-2 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors"
                  onClick={() => toggleRoomName(room)}
                >
                  <Checkbox checked={selectedRoomNames.includes(room)} />
                  <span className="text-xs font-bold">{room}</span>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* 3. Orientation */}
      <div className="space-y-1">
        <label className="text-[9px] font-black text-emerald-700 uppercase tracking-widest px-1">
          {isRTL ? "اتجاه الصفحة" : "Orientation"}
        </label>
        <Select value={orientation} onValueChange={(v: any) => setOrientation(v)}>
          <SelectTrigger className="rounded-xl border-emerald-100 bg-slate-50/30 h-9 font-bold text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="landscape">{isRTL ? "عرضي" : "Landscape"}</SelectItem>
            <SelectItem value="portrait">{isRTL ? "طولي" : "Portrait"}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 4. Transpose Axes */}
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

export default MasterRoomsScheduleControls;