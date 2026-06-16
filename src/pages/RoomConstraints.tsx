"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Search, 
  CheckCircle2, 
  XCircle, 
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  RotateCw,
  CopyCheck,
  Check,
  X
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import PageHeader from "../components/shared/PageHeader";
import { DAYS, PERIODS } from "../constants/schedule";
import { showSuccess, showError } from "../utils/toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

const RoomConstraints = () => {
  const { 
    rooms, 
    roomConstraints, 
    setRoomConstraints, 
    isRTL, 
    t 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  
  const [isApplyToOthersOpen, setIsApplyToOthersOpen] = useState(false);
  const [targetRooms, setTargetRooms] = useState<string[]>([]);
  const [targetSearch, setTargetSearch] = useState("");

  const filteredRooms = useMemo(() => {
    return rooms.filter(r => 
      r.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rooms, searchTerm]);

  const otherRooms = useMemo(() => {
    return rooms.filter(r => 
      r !== selectedRoom && 
      r.toLowerCase().includes(targetSearch.toLowerCase())
    );
  }, [rooms, selectedRoom, targetSearch]);

  const toggleAvailability = (dayId: number, period: string) => {
    if (!selectedRoom) return;

    const existingIndex = roomConstraints.findIndex(
      c => c.roomName === selectedRoom && c.day === dayId && c.period === period
    );

    if (existingIndex > -1) {
      const updated = [...roomConstraints];
      updated[existingIndex] = { 
        ...updated[existingIndex], 
        isAvailable: !updated[existingIndex].isAvailable 
      };
      setRoomConstraints(updated);
    } else {
      setRoomConstraints([
        ...roomConstraints, 
        { roomName: selectedRoom, day: dayId, period, isAvailable: false }
      ]);
    }
  };

  const isSlotAvailable = (dayId: number, period: string) => {
    const constraint = roomConstraints.find(
      c => c.roomName === selectedRoom && c.day === dayId && c.period === period
    );
    return constraint ? constraint.isAvailable : true;
  };

  const toggleColumnAvailability = (period: string) => {
    if (!selectedRoom) return;
    
    const allAvailable = DAYS.every(day => isSlotAvailable(day.id, period));
    const targetState = !allAvailable;

    let updated = [...roomConstraints];
    DAYS.forEach(day => {
      const existingIndex = updated.findIndex(
        c => c.roomName === selectedRoom && c.day === day.id && c.period === period
      );
      if (existingIndex > -1) {
        updated[existingIndex] = { ...updated[existingIndex], isAvailable: targetState };
      } else {
        updated.push({ roomName: selectedRoom, day: day.id, period, isAvailable: targetState });
      }
    });
    setRoomConstraints(updated);
    showSuccess(isRTL ? "تم تعديل حالة العمود بالكامل" : "Column availability toggled");
  };

  const toggleRowAvailability = (dayId: number) => {
    if (!selectedRoom) return;

    const allAvailable = PERIODS.every(p => isSlotAvailable(dayId, p));
    const targetState = !allAvailable;

    let updated = [...roomConstraints];
    PERIODS.forEach(p => {
      const existingIndex = updated.findIndex(
        c => c.roomName === selectedRoom && c.day === dayId && c.period === p
      );
      if (existingIndex > -1) {
        updated[existingIndex] = { ...updated[existingIndex], isAvailable: targetState };
      } else {
        updated.push({ roomName: selectedRoom, day: dayId, period: p, isAvailable: targetState });
      }
    });
    setRoomConstraints(updated);
    showSuccess(isRTL ? "تم تعديل حالة اليوم بالكامل" : "Row availability toggled");
  };

  const handleClearConstraints = () => {
    if (!selectedRoom) return;
    setRoomConstraints(roomConstraints.filter(c => c.roomName !== selectedRoom));
    showSuccess(isRTL ? "تمت إعادة تعيين توقيت القاعة بنجاح" : "Room schedule reset successfully");
  };

  const handleApplyToOthers = () => {
    if (targetRooms.length === 0) {
      showError(isRTL ? "يرجى اختيار قاعة واحدة على الأقل" : "Please select at least one room");
      return;
    }

    const currentSourceConstraints = roomConstraints.filter(c => c.roomName === selectedRoom);
    let newConstraints = [...roomConstraints];

    targetRooms.forEach(targetName => {
      newConstraints = newConstraints.filter(c => c.roomName !== targetName);
      const copied = currentSourceConstraints.map(c => ({
        ...c,
        roomName: targetName
      }));
      newConstraints = [...newConstraints, ...copied];
    });

    setRoomConstraints(newConstraints);
    setIsApplyToOthersOpen(false);
    setTargetRooms([]);
    showSuccess(isRTL ? `تم نسخ القيود إلى ${targetRooms.length} قاعات بنجاح` : `Constraints copied to ${targetRooms.length} rooms`);
  };

  const toggleTargetRoom = (name: string) => {
    setTargetRooms(prev => 
      prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]
    );
  };

  return (
    <div className="space-y-8 pb-20">
      <PageHeader
        title={isRTL ? "قيود القاعات والورشات" : "Room & Workshop Constraints"}
        subtitle={isRTL ? "تحديد الأوقات المتاحة لاستغلال القاعات والورشات ومنع الحجز في ساعات معينة" : "Define availability and block specific slots per room or workshop"}
        icon={MapPin}
        isRTL={isRTL}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Sidebar: Room List */}
        <Card className="border-none shadow-xl shadow-emerald-100/20 rounded-[2rem] overflow-hidden bg-white h-[calc(100vh-250px)]">
          <CardHeader className="bg-emerald-50/50 border-b border-emerald-100 p-6">
            <CardTitle className="text-sm font-black text-emerald-900 flex items-center gap-2">
              <MapPin size={16} className="text-emerald-600" />
              {isRTL ? "اختر القاعة / الورشة" : "Select Room"}
            </CardTitle>
            <div className="relative mt-4">
              <Search className={cn("absolute top-1/2 -translate-y-1/2 text-gray-400", isRTL ? "right-3" : "left-3")} size={14} />
              <Input 
                placeholder={isRTL ? "بحث عن قاعة..." : "Search room..."} 
                className={cn("rounded-xl border-emerald-100 bg-white h-10 text-xs", isRTL ? "pr-10" : "pl-10")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-2 overflow-y-auto h-full">
            <div className="space-y-1">
              {filteredRooms.map(room => (
                <button
                  key={room}
                  onClick={() => setSelectedRoom(room)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-2xl transition-all font-bold text-xs",
                    selectedRoom === room 
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100" 
                      : "hover:bg-emerald-50 text-slate-600 hover:text-emerald-900"
                  )}
                >
                  <span className="truncate">{room}</span>
                  {selectedRoom === room ? (
                    isRTL ? <ChevronLeft size={14} /> : <ChevronRight size={14} />
                  ) : (
                    <div className={cn("w-2 h-2 rounded-full", roomConstraints.some(c => c.roomName === room && !c.isAvailable) ? "bg-amber-400" : "bg-emerald-200/50")} />
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Grid */}
        <div className="lg:col-span-3 space-y-6">
          {selectedRoom ? (
            <Card className="border-none shadow-2xl shadow-emerald-900/5 rounded-[2.5rem] bg-white overflow-hidden">
              <CardHeader className="bg-[#fcfdfd] p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-700 shadow-sm">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-black text-slate-900">{selectedRoom}</CardTitle>
                      <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">{isRTL ? "تخصيص فترات إشغال القاعة" : "Room Availability Settings"}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => { setTargetRooms([]); setIsApplyToOthersOpen(true); }} className="rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50 gap-2 h-11 px-4 font-bold">
                    <CopyCheck size={16} /> {isRTL ? "طبق أيضاً على..." : "Apply to others..."}
                  </Button>
                  <Button variant="outline" onClick={handleClearConstraints} className="rounded-xl border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-100 gap-2 h-11 px-4 font-bold">
                    <RotateCw size={16} /> {isRTL ? "تصفير القيود" : "Reset"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="p-6 bg-rose-50/50 rounded-[2rem] border border-rose-100 flex items-start gap-4">
                    <div className="p-3 bg-rose-600 rounded-2xl text-white shadow-lg shadow-rose-200"><ShieldCheck size={20} /></div>
                    <div className="space-y-1">
                      <h4 className="font-black text-rose-950 text-sm">{isRTL ? "كيفية الاستخدام" : "How to use"}</h4>
                      <p className="text-[11px] text-rose-700/80 font-bold leading-relaxed">{isRTL ? "انقر على المربعات لتحويلها للون الأحمر لمنع جدولة أي حصة في هذه القاعة. المربعات الحمراء تعني أن القاعة غير متاحة (مثلاً للصيانة أو الاستخدام الخارجي)." : "Click cells to block room usage. Red slots mean the room is unavailable for scheduling during those times."}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100">
                      <CheckCircle2 size={24} className="text-emerald-500" />
                      <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Green</p><p className="text-xs font-black text-slate-800">{isRTL ? "متاح" : "Available"}</p></div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100">
                      <XCircle size={24} className="text-rose-500" />
                      <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Red</p><p className="text-xs font-black text-slate-800">{isRTL ? "مغلق" : "Blocked"}</p></div>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="p-3 border-b border-slate-100 w-[100px]"></th>
                        {PERIODS.map(p => (
                          <th key={p} onClick={() => toggleColumnAvailability(p)} className="p-3 border-b border-slate-100 text-center font-black text-[10px] text-slate-400 uppercase tracking-widest cursor-pointer hover:text-rose-600 hover:bg-rose-50/50 transition-colors rounded-t-xl">{isRTL ? `حصة ${p}` : `Slot ${p}`}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {DAYS.map(day => (
                        <tr key={day.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td onClick={() => toggleRowAvailability(day.id)} className="p-4 border-e border-slate-100 font-black text-xs text-slate-600 text-center cursor-pointer hover:text-rose-600 hover:bg-rose-50/50 transition-colors rounded-l-xl">{isRTL ? day.name : day.en.substr(0, 3)}</td>
                          {PERIODS.map(p => {
                            const available = isSlotAvailable(day.id, p);
                            return (
                              <td key={p} className="p-1 border border-slate-100/50">
                                <button onClick={() => toggleAvailability(day.id, p)} className={cn("w-full h-12 rounded-xl transition-all flex items-center justify-center group/cell", available ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-400" : "bg-rose-50 hover:bg-rose-100 text-rose-500 shadow-inner")}>
                                  {available ? <CheckCircle2 size={20} className="opacity-0 group-cell/cell:opacity-100" /> : <XCircle size={20} />}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200 py-40 text-center space-y-4">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-slate-200 shadow-sm border border-slate-100"><MapPin size={40} /></div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-400 tracking-tight uppercase">{isRTL ? "لم يتم اختيار قاعة" : "No Room Selected"}</h3>
                <p className="text-xs font-bold text-slate-300">{isRTL ? "يرجى اختيار قاعة من القائمة الجانبية لتعديل فترات توافرها" : "Please select a room from the list to manage its availability"}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isApplyToOthersOpen} onOpenChange={setIsApplyToOthersOpen}>
        <DialogContent className="sm:max-w-xl rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-8 bg-rose-600 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <DialogTitle className="text-2xl font-black flex items-center gap-3 relative z-10"><CopyCheck size={28} /> {isRTL ? "طبق القيود أيضاً على..." : "Apply to other rooms..."}</DialogTitle>
          </DialogHeader>
          <div className="p-6 bg-white space-y-4">
            <div className="relative">
              <Search className={cn("absolute top-1/2 -translate-y-1/2 text-gray-400", isRTL ? "right-4" : "left-4")} size={18} />
              <Input placeholder={isRTL ? "بحث عن قاعة..." : "Search room..."} value={targetSearch} onChange={(e) => setTargetSearch(e.target.value)} className={cn("h-12 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white transition-all", isRTL ? "pr-12" : "pl-12")} />
            </div>
            <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar grid grid-cols-1 md:grid-cols-2 gap-2">
              {otherRooms.map(room => (
                <div key={room} onClick={() => toggleTargetRoom(room)} className={cn("flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer group", targetRooms.includes(room) ? "bg-rose-50 border-rose-500 shadow-md" : "bg-white border-slate-100 hover:border-rose-200")}>
                  <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all", targetRooms.includes(room) ? "bg-rose-600 border-rose-600 text-white" : "border-slate-200 bg-white")}>{targetRooms.includes(room) && <Check size={14} strokeWidth={4} />}</div>
                  <p className={cn("font-bold text-sm truncate", targetRooms.includes(room) ? "text-rose-900" : "text-slate-700")}>{room}</p>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
            <span className="text-[10px] font-black text-rose-600 bg-rose-100 px-3 py-1 rounded-full uppercase">{targetRooms.length} {isRTL ? "محدد" : "Selected"}</span>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setIsApplyToOthersOpen(false)} className="rounded-xl h-11 px-6 font-bold text-slate-500">{t.cancel}</Button>
              <Button onClick={handleApplyToOthers} disabled={targetRooms.length === 0} className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-11 px-10 font-black shadow-lg shadow-rose-200 transition-all disabled:opacity-50">{isRTL ? "تأكيد النسخ" : "Confirm Apply"}</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoomConstraints;