"use client";

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { format, startOfWeek, addDays, parseISO, getDay, isSameDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, UserPlus, History } from "lucide-react";
import { PeriodPart } from "../types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { showSuccess } from "../utils/toast";

const Assignments = () => {
  const { employees, periodConfigs, saveAssignment, getEffectiveAssignment, templateAssignments, t, isRTL } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedPeriods, setSelectedPeriods] = useState<PeriodPart[]>([]);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const allPeriods: PeriodPart[] = ["Morning", "Afternoon", "Evening"];

  const handleOpenAssignment = (date: Date, period: PeriodPart) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const effectiveIds = getEffectiveAssignment(dateStr, period);
    
    setSelectedDate(dateStr);
    setSelectedPeriods([period]);
    setSelectedEmployeeIds([...effectiveIds]);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (selectedDate && selectedPeriods.length > 0) {
      saveAssignment(selectedDate, selectedPeriods, selectedEmployeeIds);
      setIsDialogOpen(false);
      showSuccess(t.save);
    }
  };

  const toggleEmployee = (id: string) => {
    setSelectedEmployeeIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const togglePeriodSelection = (period: PeriodPart) => {
    setSelectedPeriods(prev => 
      prev.includes(period) ? prev.filter(p => p !== period) : [...prev, period]
    );
  };

  const resetToTemplate = () => {
    if (!selectedDate || selectedPeriods.length === 0) return;
    const dayIdx = getDay(parseISO(selectedDate));
    const period = selectedPeriods[0];
    const template = templateAssignments.find(t => t.dayIdx === dayIdx && t.period === period);
    setSelectedEmployeeIds(template ? [...template.employeeIds] : []);
    showSuccess(isRTL ? "تمت العودة لتكليفات الجدول الثابت" : "Reverted to fixed schedule assignments");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1 text-right">
          <h2 className="text-2xl font-bold text-slate-800">{t.assignments}</h2>
          <p className="text-xs text-slate-500">{isRTL ? "تعديل التكليفات اليومية (الاستثناءات)" : "Edit daily assignments (exceptions)"}</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
          <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addDays(currentDate, -7))}>
            {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
          <span className="px-4 font-medium text-slate-700 min-w-[180px] text-center">
            {format(weekStart, "MMM d")} - {format(addDays(weekStart, 6), "MMM d, yyyy")}
          </span>
          <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addDays(currentDate, 7))}>
            {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {weekDays.map((day) => {
          const dayIdx = getDay(day);
          const dateStr = format(day, "yyyy-MM-dd");
          const isToday = isSameDay(day, new Date());
          
          return (
            <div key={dateStr} className="flex flex-col gap-3">
              <div className={cn(
                "text-center p-2 rounded-xl font-medium transition-all duration-300",
                isToday ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" : "bg-white border border-slate-200 text-slate-800"
              )}>
                <div className={cn("text-[10px] uppercase", isToday ? "opacity-80" : "text-slate-400")}>{format(day, "EEE")}</div>
                <div className="text-xl font-bold">{format(day, "d")}</div>
              </div>
              
              <div className="space-y-3">
                {allPeriods.map(period => {
                  const config = periodConfigs.find(c => c.day === dayIdx && c.period === period);
                  if (!config?.isActive) return null;
                  
                  const assignedIds = getEffectiveAssignment(dateStr, period);
                  const assignedCount = assignedIds.length;
                  
                  return (
                    <button
                      key={period}
                      onClick={() => handleOpenAssignment(day, period)}
                      className={cn(
                        "w-full text-start p-3 rounded-xl border transition-all duration-300 group",
                        assignedCount > 0 
                          ? "bg-white border-emerald-100 shadow-sm hover:border-emerald-400 hover:shadow-md" 
                          : "bg-slate-50/50 border-dashed border-slate-300 hover:bg-white hover:border-emerald-200"
                      )}
                    >
                      <div className="text-[10px] font-bold text-emerald-400 uppercase mb-2 flex items-center justify-between">
                        {period === "Morning" ? t.morning : period === "Afternoon" ? t.afternoon : t.evening}
                        {assignedCount > 0 && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                      </div>
                      
                      {assignedCount > 0 ? (
                        <div className="space-y-1.5">
                          {assignedIds.slice(0, 3).map(id => {
                            const emp = employees.find(e => e.id === id);
                            return (
                              <div key={id} className="text-xs text-slate-700 truncate font-medium flex items-center gap-1.5">
                                <div className="h-1 w-1 rounded-full bg-slate-300"></div>
                                {emp?.firstName} {emp?.lastName}
                              </div>
                            );
                          })}
                          {assignedCount > 3 && (
                            <div className="text-[10px] text-emerald-600 font-bold mt-1 bg-emerald-50 py-0.5 px-2 rounded-full w-fit">
                              + {assignedCount - 3} {t.more}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-slate-400 text-xs py-1">
                          <UserPlus className="h-3.5 w-3.5" />
                          {t.assign}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-8 border-b bg-emerald-600 text-white">
            <DialogTitle className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{t.assignStaff}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white hover:bg-white/10 gap-2 border border-white/20"
                  onClick={resetToTemplate}
                >
                  <History className="h-4 w-4" />
                  {isRTL ? "استعادة من الجدول الثابت" : "Restore from fixed schedule"}
                </Button>
              </div>
              {selectedDate && (
                <span className="text-emerald-100 font-normal">
                  {format(parseISO(selectedDate), "EEEE, d MMMM yyyy")}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/50">
            <div className="space-y-4">
              <Label className="text-xs font-bold uppercase text-slate-400 tracking-widest">{t.applyToPeriods}</Label>
              <div className="flex flex-wrap gap-3">
                {allPeriods.map(period => {
                  if (!selectedDate) return null;
                  const dayIdx = getDay(parseISO(selectedDate));
                  const config = periodConfigs.find(c => c.day === dayIdx && c.period === period);
                  if (!config?.isActive) return null;

                  const isSelected = selectedPeriods.includes(period);

                  return (
                    <div 
                      key={period}
                      onClick={() => togglePeriodSelection(period)}
                      className={cn(
                        "flex items-center gap-3 px-5 py-2.5 rounded-2xl border-2 cursor-pointer transition-all duration-200",
                        isSelected 
                          ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-100 scale-105" 
                          : "bg-white border-slate-200 text-slate-600 hover:border-emerald-300"
                      )}
                    >
                      <Checkbox 
                        checked={isSelected}
                        className={cn("border-white/50 data-[state=checked]:bg-white data-[state=checked]:text-emerald-600 pointer-events-none")}
                      />
                      <span className="text-sm font-bold">{period === "Morning" ? t.morning : period === "Afternoon" ? t.afternoon : t.evening}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-xs font-bold uppercase text-slate-400 tracking-widest">{t.selectEmployees}</Label>
              <div className="grid gap-3">
                {employees.length > 0 ? (
                  employees.map(emp => {
                    const isSelected = selectedEmployeeIds.includes(emp.id);

                    return (
                      <div 
                        key={emp.id} 
                        className={cn(
                          "flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200",
                          isSelected ? "bg-emerald-50 border-emerald-500 shadow-sm" : "bg-white border-slate-100 hover:border-emerald-200"
                        )}
                        onClick={() => toggleEmployee(emp.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "h-10 w-10 rounded-xl flex items-center justify-center font-bold transition-colors",
                            isSelected ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"
                          )}>
                            {emp.firstName[0]}{emp.lastName[0]}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">{emp.firstName} {emp.lastName}</div>
                            <div className="text-[10px] text-slate-500 font-medium flex items-center gap-2">
                              <Badge variant="outline" className="text-[9px] py-0">{emp.category === "Full-time" ? t.fullTime : t.partTime}</Badge>
                              <span>ID: {emp.id}</span>
                            </div>
                          </div>
                        </div>

                        <Checkbox 
                          checked={isSelected}
                          className="scale-110"
                        />
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-slate-400 italic border-4 border-dashed border-slate-100 rounded-3xl bg-white">
                    {t.noEmployeesFound}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter className="p-8 border-t bg-white flex items-center gap-4">
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl px-8 hover:bg-slate-100 font-bold">{t.cancel}</Button>
            <Button 
              onClick={handleSave} 
              disabled={selectedPeriods.length === 0}
              className="bg-emerald-600 hover:bg-emerald-700 rounded-xl px-12 h-12 shadow-xl shadow-emerald-100 font-bold transition-all hover:scale-105 text-white"
            >
              {t.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Assignments;