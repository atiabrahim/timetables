"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CalendarX, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Home, 
  Info,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  RotateCw,
  GraduationCap
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import PageHeader from "../components/shared/PageHeader";
import { DAYS, PERIODS } from "../constants/schedule";
import { showSuccess } from "../utils/toast";

const ClassConstraints = () => {
  const { 
    classes, 
    classConstraints, 
    setClassConstraints, 
    isRTL, 
    t 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");

  const filteredClasses = useMemo(() => {
    return classes.filter(cls => 
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cls.code || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [classes, searchTerm]);

  const selectedClass = useMemo(() => 
    classes.find(c => c.id === selectedClassId)
  , [classes, selectedClassId]);

  const toggleAvailability = (dayId: number, period: string) => {
    if (!selectedClassId) return;

    const existingIndex = classConstraints.findIndex(
      c => c.classId === selectedClassId && c.day === dayId && c.period === period
    );

    if (existingIndex > -1) {
      const updated = [...classConstraints];
      updated[existingIndex] = { 
        ...updated[existingIndex], 
        isAvailable: !updated[existingIndex].isAvailable 
      };
      setClassConstraints(updated);
    } else {
      setClassConstraints([
        ...classConstraints, 
        { classId: selectedClassId, day: dayId, period, isAvailable: false }
      ]);
    }
  };

  const isSlotAvailable = (dayId: number, period: string) => {
    const constraint = classConstraints.find(
      c => c.classId === selectedClassId && c.day === dayId && c.period === period
    );
    return constraint ? constraint.isAvailable : true;
  };

  const handleClearClassConstraints = () => {
    if (!selectedClassId) return;
    setClassConstraints(classConstraints.filter(c => c.classId !== selectedClassId));
    showSuccess(isRTL ? "تمت إعادة تعيين توقيت الفوج بنجاح" : "Class schedule reset successfully");
  };

  return (
    <div className="space-y-8 pb-20">
      <PageHeader
        title={isRTL ? "القيود الزمنية للفروع" : "Class Time Constraints"}
        subtitle={isRTL ? "تحديد الأوقات المتاحة للدراسة لكل فوج ومنع الحصص في ساعات معينة" : "Define study availability and block specific slots per class"}
        icon={CalendarX}
        isRTL={isRTL}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Sidebar: Class List */}
        <Card className="border-none shadow-xl shadow-emerald-100/20 rounded-[2rem] overflow-hidden bg-white h-[calc(100vh-250px)]">
          <CardHeader className="bg-emerald-50/50 border-b border-emerald-100 p-6">
            <CardTitle className="text-sm font-black text-emerald-900 flex items-center gap-2">
              <GraduationCap size={16} className="text-emerald-600" />
              {isRTL ? "اختر الفوج" : "Select Class"}
            </CardTitle>
            <div className="relative mt-4">
              <Search className={cn("absolute top-1/2 -translate-y-1/2 text-gray-400", isRTL ? "right-3" : "left-3")} size={14} />
              <Input 
                placeholder={isRTL ? "بحث عن فوج..." : "Search class..."} 
                className={cn("rounded-xl border-emerald-100 bg-white h-10 text-xs", isRTL ? "pr-10" : "pl-10")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-2 overflow-y-auto h-full">
            <div className="space-y-1">
              {filteredClasses.map(cls => (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClassId(cls.id)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-2xl transition-all font-bold text-xs",
                    selectedClassId === cls.id 
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100" 
                      : "hover:bg-emerald-50 text-slate-600 hover:text-emerald-900"
                  )}
                >
                  <span className="truncate">{cls.name}</span>
                  {selectedClassId === cls.id ? (
                    isRTL ? <ChevronLeft size={14} /> : <ChevronRight size={14} />
                  ) : (
                    <div className={cn("w-2 h-2 rounded-full", classConstraints.some(c => c.classId === cls.id && !c.isAvailable) ? "bg-amber-400" : "bg-emerald-200/50")} />
                  )}
                </button>
              ))}
              {filteredClasses.length === 0 && (
                <div className="py-12 text-center text-slate-300 font-bold text-[10px] uppercase tracking-widest">
                  {isRTL ? "لا يوجد نتائج" : "No results"}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main: Availability Grid */}
        <div className="lg:col-span-3 space-y-6">
          {selectedClass ? (
            <Card className="border-none shadow-2xl shadow-emerald-900/5 rounded-[2.5rem] bg-white overflow-hidden">
              <CardHeader className="bg-[#fcfdfd] p-8 border-b border-slate-100 flex flex-row justify-between items-center">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-700 shadow-sm">
                      <Home size={24} />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-black text-slate-900">
                        {selectedClass.name}
                      </CardTitle>
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">
                        {selectedClass.code || "---"} • {isRTL ? "تخصيص جدول الحضور الدراسي" : "Class Time Settings"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleClearClassConstraints}
                    className="rounded-xl border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-100 gap-2 h-11 px-4 font-bold"
                  >
                    <RotateCw size={16} />
                    {isRTL ? "إعادة ضبط كـ متاح دائماً" : "Reset to Always Available"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100 flex items-start gap-4">
                    <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200">
                      <ShieldCheck size={20} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-black text-blue-950 text-sm">{isRTL ? "كيفية الاستخدام" : "How to use"}</h4>
                      <p className="text-[11px] text-blue-700/80 font-bold leading-relaxed">
                        {isRTL 
                          ? "انقر على المربعات لتحويلها للون الأحمر لمنع جدولة أي حصة لهذا الفوج في ذلك الوقت. مفيد جداً للأفواج التي تدرس بتوقيت جزئي أو في أيام محددة."
                          : "Click cells to turn them red to prevent any lessons from being scheduled for this class at that time. Perfect for part-time classes or specific off-days."}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100">
                      <CheckCircle2 size={24} className="text-emerald-500" />
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{isRTL ? "أخضر" : "Green"}</p>
                        <p className="text-xs font-black text-slate-800">{isRTL ? "متاح للجدولة" : "Available"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100">
                      <XCircle size={24} className="text-rose-500" />
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{isRTL ? "أحمر" : "Red"}</p>
                        <p className="text-xs font-black text-slate-800">{isRTL ? "ممنوع (مغلق)" : "Blocked"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="p-3 border-b border-slate-100 w-[100px]"></th>
                        {PERIODS.map(p => (
                          <th key={p} className="p-3 border-b border-slate-100 text-center font-black text-[10px] text-slate-400 uppercase tracking-widest">
                            {isRTL ? `حصة ${p}` : `Slot ${p}`}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {DAYS.map(day => (
                        <tr key={day.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 border-e border-slate-100 font-black text-xs text-slate-600 text-center">
                            {isRTL ? day.name : day.en.substr(0, 3)}
                          </td>
                          {PERIODS.map(p => {
                            const available = isSlotAvailable(day.id, p);
                            return (
                              <td key={p} className="p-1 border border-slate-100/50">
                                <button
                                  onClick={() => toggleAvailability(day.id, p)}
                                  className={cn(
                                    "w-full h-12 rounded-xl transition-all flex items-center justify-center group/cell",
                                    available 
                                      ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-400" 
                                      : "bg-rose-50 hover:bg-rose-100 text-rose-500 shadow-inner"
                                  )}
                                >
                                  {available ? (
                                    <CheckCircle2 size={20} className="opacity-0 group-cell/cell:opacity-100" />
                                  ) : (
                                    <XCircle size={20} />
                                  )}
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
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-slate-200 shadow-sm border border-slate-100">
                <CalendarX size={40} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-400 tracking-tight uppercase">
                  {isRTL ? "لم يتم اختيار فوج" : "No Class Selected"}
                </h3>
                <p className="text-xs font-bold text-slate-300">
                  {isRTL ? "يرجى اختيار فوج من القائمة الجانبية لتعديل فترات دراسته المسموحة" : "Please select a class from the list to manage their study availability"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassConstraints;