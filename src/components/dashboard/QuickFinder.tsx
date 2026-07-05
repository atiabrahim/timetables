"use client";

import React from "react";
import { Search, Users, GraduationCap, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  name: string;
  type: "teacher" | "class" | "room";
  sub: string;
}

interface QuickFinderProps {
  globalSearch: string;
  setGlobalSearch: (val: string) => void;
  isSearchFocused: boolean;
  setIsSearchFocused: (val: boolean) => void;
  searchResults: SearchResult[];
  isRTL: boolean;
  onSelectResult: (type: string, id: string) => void;
}

const QuickFinder = ({
  globalSearch,
  setGlobalSearch,
  isSearchFocused,
  setIsSearchFocused,
  searchResults,
  isRTL,
  onSelectResult
}: QuickFinderProps) => {
  return (
    <div className="relative max-w-2xl mx-auto z-40">
      <div className={cn(
        "flex items-center bg-white rounded-3xl border-2 transition-all duration-300 shadow-lg px-4 h-14",
        isSearchFocused ? "border-emerald-500 ring-4 ring-emerald-50" : "border-slate-100"
      )}>
        <Search className="text-slate-400 shrink-0" size={20} />
        <Input 
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          placeholder={isRTL ? "الباحث السريع: ابحث عن أستاذ، فوج، أو قاعة لعرض جدولهم فوراً..." : "Quick Finder: Search teacher, class, or room to view schedule..."}
          className="border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-full text-sm font-bold flex-1"
        />
        {globalSearch && (
          <Button variant="ghost" size="icon" onClick={() => setGlobalSearch("")} className="h-8 w-8 rounded-full text-slate-400 hover:text-slate-600">
            ✕
          </Button>
        )}
      </div>

      {isSearchFocused && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-3xl shadow-2xl overflow-hidden p-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
          {searchResults.map((res) => (
            <button
              key={`${res.type}-${res.id}`}
              onClick={() => onSelectResult(res.type, res.id)}
              className="w-full flex items-center justify-between p-3 hover:bg-emerald-50/50 rounded-2xl transition-colors text-start"
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                  res.type === "teacher" && "bg-emerald-50 text-emerald-600",
                  res.type === "class" && "bg-blue-50 text-blue-600",
                  res.type === "room" && "bg-rose-50 text-rose-600"
                )}>
                  {res.type === "teacher" && <Users size={16} />}
                  {res.type === "class" && <GraduationCap size={16} />}
                  {res.type === "room" && <MapPin size={16} />}
                </div>
                <div>
                  <p className="text-xs font-black text-slate-800">{res.name}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{res.sub}</p>
                </div>
              </div>
              <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-widest">
                {res.type === "teacher" ? (isRTL ? "أستاذ" : "Teacher") : res.type === "class" ? (isRTL ? "فوج" : "Class") : (isRTL ? "قاعة" : "Room")}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuickFinder;