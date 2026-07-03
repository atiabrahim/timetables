"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { Button } from "@/components/ui/button";
import { Printer, Eye, MapPin, RotateCw, X, SlidersHorizontal } from "lucide-react";
import PageHeader from "../components/shared/PageHeader";
import { DAYS, PERIODS } from "../constants/schedule";
import OfficialPrintWrapper from "../components/shared/OfficialPrintWrapper";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import MasterRoomsScheduleTable from "../components/schedule/MasterRoomsScheduleTable";
import MasterRoomsScheduleControls from "../components/schedule/MasterRoomsScheduleControls";

const MasterRoomsSchedule = () => {
  const { 
    employees, 
    assignments, 
    subjects,
    classes,
    rooms,
    isRTL,
    t,
    user
  } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoomNames, setSelectedRoomNames] = useState<string[]>(["all"]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [orientation, setOrientation] = useState<"landscape" | "portrait">("landscape");
  const [isTransposed, setIsTransposed] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Filter rooms based on search and multi-select
  const filteredRooms = useMemo(() => {
    return rooms.filter(roomName => 
      roomName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedRoomNames.includes("all") || selectedRoomNames.includes(roomName))
    );
  }, [rooms, searchTerm, selectedRoomNames]);

  // Determine active periods per day for filtered rooms
  const activePeriodsPerDay = useMemo(() => {
    const map: Record<number, string[]> = {};
    DAYS.forEach(day => {
      const activePeriods = PERIODS.filter(p => 
        assignments.some(a => 
          a.day === day.id && 
          a.period === p && 
          filteredRooms.includes(a.room || "")
        )
      );
      map[day.id] = activePeriods;
    });
    return map;
  }, [assignments, filteredRooms]);

  const totalActiveColumns = useMemo(() => {
    return DAYS.reduce((sum, day) => sum + (activePeriodsPerDay[day.id]?.length || 0), 0);
  }, [activePeriodsPerDay]);

  const getDayCells = (roomName: string, dayId: number) => {
    const activePeriods = activePeriodsPerDay[dayId] || [];
    const cells = activePeriods.map(p => ({
      period: p,
      colSpan: 1,
      assignment: assignments.find(a => a.room === roomName && a.day === dayId && a.period === p),
      skip: false
    }));

    for (let i = 0; i < cells.length; i++) {
      if (cells[i].skip) continue;
      const asgn1 = cells[i].assignment;
      if (!asgn1) continue;

      for (let j = i + 1; j < cells.length; j++) {
        const asgn2 = cells[j].assignment;
        if (asgn2 && asgn2.subjectId === asgn1.subjectId && asgn2.classId === asgn1.classId) {
          cells[i].colSpan++;
          cells[j].skip = true;
        } else {
          break;
        }
      }
    }
    return cells;
  };

  const getTransposedDayCells = (roomName: string, dayId: number) => {
    const activePeriods = activePeriodsPerDay[dayId] || [];
    const cells = activePeriods.map(p => ({
      period: p,
      rowSpan: 1,
      assignment: assignments.find(a => a.room === roomName && a.day === dayId && a.period === p),
      skip: false
    }));

    for (let i = 0; i < cells.length; i++) {
      if (cells[i].skip) continue;
      const asgn1 = cells[i].assignment;
      if (!asgn1) continue;

      for (let j = i + 1; j < cells.length; j++) {
        const asgn2 = cells[j].assignment;
        if (asgn2 && asgn2.subjectId === asgn1.subjectId && asgn2.classId === asgn1.classId) {
          cells[i].rowSpan++;
          cells[j].skip = true;
        } else {
          break;
        }
      }
    }
    return cells;
  };

  const toggleRoomName = (name: string) => {
    if (name === "all") {
      setSelectedRoomNames(["all"]);
    } else {
      setSelectedRoomNames(prev => {
        const filtered = prev.filter(x => x !== "all");
        if (filtered.includes(name)) {
          const next = filtered.filter(x => x !== name);
          return next.length === 0 ? ["all"] : next;
        } else {
          return [...filtered, name];
        }
      });
    }
  };

  const printSubtitle = (
    <span className="font-bold">{isRTL ? "توزيع استغلال القاعات والورشات" : "Weekly Room & Workshop Utilization"}</span>
  );

  return (
    <div className="space-y-4 pb-12">
      <PageHeader
        title={isRTL ? "الجدول الكلي للقاعات" : "Master Rooms Schedule"}
        subtitle={isRTL ? "مزامنة تلقائية مع جدول الحصص وتكليفات القاعات" : "Auto-sync with timetable and room assignments"}
        icon={MapPin}
        isRTL={isRTL}
      >
        <Button 
          variant="outline" 
          onClick={() => setShowControls(!showControls)} 
          className={cn(
            "rounded-xl border-emerald-100 font-bold gap-1.5 h-9 px-3 transition-all text-xs",
            showControls ? "bg-emerald-50 text-emerald-900 border-emerald-300" : "bg-white text-slate-700"
          )}
        >
          <SlidersHorizontal size={14} />
          {isRTL ? "أدوات التحكم" : "Controls"}
        </Button>
        <Button variant="outline" className="rounded-xl border-emerald-200 text-emerald-700 gap-1.5 font-bold px-4 h-9 bg-white text-xs" onClick={() => setIsPreviewOpen(true)}>
          <Eye size={14} /> {t.preview}
        </Button>
        <Button className="bg-emerald-600 hover:bg-emerald-700 rounded-xl gap-1.5 font-bold px-4 h-9 shadow-md shadow-emerald-100 text-white text-xs" onClick={() => window.print()}>
          <Printer size={14} /> {t.print}
        </Button>
      </PageHeader>

      {showControls && (
        <MasterRoomsScheduleControls
          isRTL={isRTL}
          t={t}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedRoomNames={selectedRoomNames}
          toggleRoomName={toggleRoomName}
          rooms={rooms}
          orientation={orientation}
          setOrientation={setOrientation}
          isTransposed={isTransposed}
          setIsTransposed={setIsTransposed}
        />
      )}

      <div className="print:hidden">
        <MasterRoomsScheduleTable
          isTransposed={isTransposed}
          isRTL={isRTL}
          filteredRooms={filteredRooms}
          activePeriodsPerDay={activePeriodsPerDay}
          totalActiveColumns={totalActiveColumns}
          getDayCells={getDayCells}
          getTransposedDayCells={getTransposedDayCells}
          subjects={subjects}
          employees={employees}
          classes={classes}
          orientation={orientation}
        />
      </div>

      <div className="print-content-master hidden print:block">
        <OfficialPrintWrapper
          title={isRTL ? "الجدول الكلي للقاعات" : "Master Rooms Schedule"}
          subtitle={printSubtitle}
          orientation={orientation}
          rightSignatureTitle={isRTL ? "ختم وتوقيع المدير" : "Director Signature"}
          showSystemFooter={false}
        >
          <MasterRoomsScheduleTable
            isPrint={true}
            isTransposed={isTransposed}
            isRTL={isRTL}
            filteredRooms={filteredRooms}
            activePeriodsPerDay={activePeriodsPerDay}
            totalActiveColumns={totalActiveColumns}
            getDayCells={getDayCells}
            getTransposedDayCells={getTransposedDayCells}
            subjects={subjects}
            employees={employees}
            classes={classes}
            orientation={orientation}
          />
        </OfficialPrintWrapper>
      </div>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-[98vw] w-full h-[95vh] p-0 bg-zinc-900/95 border-none rounded-none flex flex-col z-[9999] print:bg-white print:h-auto print:block">
          <div className="h-14 bg-black/40 border-b border-white/10 flex items-center justify-between px-6 shrink-0 print:hidden">
            <div className="flex items-center gap-2 text-white">
              <Eye className="text-emerald-500" size={16} />
              <h3 className="font-black text-sm">{isRTL ? "معاينة جدول القاعات" : "Rooms Schedule Preview"}</h3>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setOrientation(orientation === "portrait" ? "landscape" : "portrait")} className="text-white border-white/20 bg-transparent rounded-xl h-9 text-xs">
                <RotateCw size={14} className="mr-1.5" />
                {isRTL ? (orientation === "portrait" ? "عرضي" : "طولي") : "Orientation"}
              </Button>
              <Button onClick={() => window.print()} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black px-6 h-9 text-xs">
                <Printer size={14} className="mr-1.5" />
                {t.print}
              </Button>
              <Button variant="ghost" onClick={() => setIsPreviewOpen(false)} className="text-white/70 hover:text-white">
                <X size={18} />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-zinc-950/50 print:bg-white p-6 print:p-0">
            <OfficialPrintWrapper
              title={isRTL ? "الجدول الكلي للقاعات" : "Master Rooms Schedule"}
              subtitle={printSubtitle}
              orientation={orientation}
              rightSignatureTitle={isRTL ? "ختم وتوقيع المدير" : "Director Signature"}
              showSystemFooter={false}
            >
              <MasterRoomsScheduleTable
                isPrint={true}
                isTransposed={isTransposed}
                isRTL={isRTL}
                filteredRooms={filteredRooms}
                activePeriodsPerDay={activePeriodsPerDay}
                totalActiveColumns={totalActiveColumns}
                getDayCells={getDayCells}
                getTransposedDayCells={getTransposedDayCells}
                subjects={subjects}
                employees={employees}
                classes={classes}
                orientation={orientation}
              />
            </OfficialPrintWrapper>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MasterRoomsSchedule;