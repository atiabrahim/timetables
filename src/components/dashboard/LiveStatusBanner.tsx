"use client";

import React from "react";
import { Card, LayoutGrid, UserCheck, MapPin, CircleDot } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface LiveStatusBannerProps {
  currentTime: Date;
  liveContext: {
    currentP: string | null;
    nextP: string | null;
    activeLessons: any[];
    freeStaff: any[];
    vacantRooms: any[];
  };
  isRTL: boolean;
  t: any;
  employees: any[];
}

const LiveStatusBanner = ({
  currentTime,
  liveContext,
  isRTL,
  t,
  employees
}: LiveStatusBannerProps) => {
  return (
    <div className="border-none shadow-xl bg-white overflow-hidden rounded-[2.5rem] flex flex-col md:flex-row">
      <div className="bg-emerald-950 text-white p-8 md:w-1/3 flex flex-col justify-between border-b md:border-b-0 md:border-e border-emerald-900/50">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full mb-4">
            <CircleDot size={12} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">{t.liveStatus}</span>
          </div>
          <h3 className="text-4xl font-black tracking-tighter">
            {format(currentTime, "HH:mm")}
          </h3>
          <p className="text-emerald-100/50 font-bold text-xs uppercase tracking-widest">
            {format(currentTime, "EEEE, d MMM")}
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="text-[10px] font-black text-emerald-400/60 uppercase">{t.currentPeriod}</span>
            <span className="text-sm font-black">
              {liveContext.currentP ? (isRTL ? `حصة ${liveContext.currentP}` : `Period ${liveContext.currentP}`) : "---"}
            </span>
          </div>
          {liveContext.nextP && (
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
              <span className="text-[10px] font-black text-white/30 uppercase">{t.nextPeriod}</span>
              <span className="text-sm font-black text-white/50">
                {isRTL ? `حصة ${liveContext.nextP}` : `Period ${liveContext.nextP}`}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="p-8 md:w-2/3 bg-slate-50/30">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <LayoutGrid size={12} /> {t.inClass}
            </h4>
            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {liveContext.activeLessons.length > 0 ? liveContext.activeLessons.map((l, i) => {
                const emp = employees.find(e => e.id === l.employeeId);
                return (
                  <div key={i} className="p-3 bg-white border border-slate-100 rounded-xl flex items-center gap-2 shadow-sm">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-black text-[10px]">
                      {emp?.lastName[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-black text-slate-800 truncate">{emp?.lastName}</p>
                      <p className="text-[9px] font-bold text-slate-400 truncate">{l.room || "---"}</p>
                    </div>
                  </div>
                );
              }) : <p className="text-[10px] font-bold text-slate-300 italic">{t.noLessonsNow}</p>}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5">
              <UserCheck size={12} /> {t.freeStaff}
            </h4>
            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {liveContext.freeStaff.length > 0 ? liveContext.freeStaff.map((e, i) => (
                <div key={i} className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-black text-[10px]">
                    {e.lastName[0]}
                  </div>
                  <p className="text-[11px] font-black text-emerald-900 truncate">{e.lastName}</p>
                </div>
              )) : <p className="text-[10px] font-bold text-slate-300 italic">None</p>}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-rose-600 uppercase tracking-widest flex items-center gap-1.5">
              <MapPin size={12} /> {t.vacantRooms}
            </h4>
            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {liveContext.vacantRooms.length > 0 ? liveContext.vacantRooms.map((r, i) => (
                <div key={i} className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center font-black text-[10px] truncate px-0.5">
                    {r}
                  </div>
                  <p className="text-[11px] font-black text-rose-900 truncate">{r}</p>
                </div>
              )) : <p className="text-[10px] font-bold text-slate-300 italic">None</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveStatusBanner;