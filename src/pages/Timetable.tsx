import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileDown, Printer, Plus, Trash2, Filter, User as UserIcon, Building, Clock, Eye, EyeOff } from "lucide-react";
import { exportToPdf } from "../lib/export-utils";
import AssignmentDialog from "../components/AssignmentDialog";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const Timetable = () => {
  const { t, isRTL, periodConfigs, assignments, setAssignments, employees, user, departments } = useApp();
  const [selectedCell, setSelectedCell] = useState<{ day: number, period: string } | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<any>(null);
  const [isPrintMode, setIsPrintMode] = useState(false);
  
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [empFilter, setEmpFilter] = useState<string>("all");

  const periods = ["Morning", "Afternoon"];
  const days = t.days;

  const filteredAssignments = useMemo(() => {
    let filtered = assignments;
    if (deptFilter !== "all") filtered = filtered.filter(a => a.department === deptFilter);
    if (empFilter !== "all") filtered = filtered.filter(a => a.employeeId === empFilter);
    return filtered;
  }, [assignments, deptFilter, empFilter]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={cn("space-y-6", isPrintMode && "print-container")}>
      {/* Header - Hidden in Print */}
      <div className={cn("flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 print:hidden")}>
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 p-2 rounded-lg text-white">
            <Clock size={24} />
          </div>
          <h2 className="text-2xl font-bold text-emerald-900">{t.timetable}</h2>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-emerald-100 shadow-sm">
            <Filter size={16} className="text-emerald-500 mx-2" />
            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger className="w-[150px] border-none focus:ring-0 h-8 text-xs">
                <SelectValue placeholder={t.stats.departments} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isRTL ? "كل المصالح" : "All Departments"}</SelectItem>
                {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="w-px h-4 bg-emerald-100" />
            <Select value={empFilter} onValueChange={setEmpFilter}>
              <SelectTrigger className="w-[150px] border-none focus:ring-0 h-8 text-xs">
                <SelectValue placeholder={t.employees} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isRTL ? "كل الموظفين" : "All Employees"}</SelectItem>
                {employees.map(e => (
                  <SelectItem key={e.id} value={e.id}>{e.firstName} {e.lastName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className={cn("border-emerald-200 h-10 rounded-xl", isPrintMode ? "bg-emerald-100 text-emerald-800" : "text-emerald-700")}
              onClick={() => setIsPrintMode(!isPrintMode)}
            >
              {isPrintMode ? <EyeOff size={18} className={isRTL ? "ml-2" : "mr-2"} /> : <Eye size={18} className={isRTL ? "ml-2" : "mr-2"} />}
              {isPrintMode ? (isRTL ? "إلغاء المعاينة" : "Exit Preview") : (isRTL ? "معاينة الطباعة" : "Print Preview")}
            </Button>
            <Button 
              size="sm" 
              className="bg-emerald-600 hover:bg-emerald-700 h-10 rounded-xl shadow-lg shadow-emerald-100"
              onClick={handlePrint}
            >
              <Printer size={18} className={isRTL ? "ml-2" : "mr-2"} />
              {isRTL ? "طباعة" : "Print"}
            </Button>
          </div>
        </div>
      </div>

      {/* Print Header - Only visible in Print */}
      <div className="hidden print:block text-center mb-8 border-b-2 border-emerald-900 pb-4">
        <h1 className="text-3xl font-bold text-emerald-900">{t.title}</h1>
        <p className="text-emerald-600 mt-2">{t.timetable} - {new Date().toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}</p>
        {deptFilter !== "all" && <p className="font-bold mt-1">{isRTL ? "المصلحة:" : "Department:"} {deptFilter}</p>}
      </div>

      <Card className={cn(
        "border-none shadow-2xl overflow-hidden glass-card rounded-3xl",
        isPrintMode && "shadow-none border border-gray-200 rounded-none"
      )}>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-emerald-600 text-white print:bg-gray-100 print:text-black">
                  <th className="p-6 text-start border-b border-emerald-500 w-40 text-lg font-bold print:p-4 print:border-gray-300">
                    {isRTL ? "اليوم" : "Day"}
                  </th>
                  {periods.map(p => (
                    <th key={p} className="p-6 text-center border-b border-emerald-500 text-lg font-bold print:p-4 print:border-gray-300">
                      {t[p.toLowerCase() as keyof typeof t]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {days.map((day: string, dayIdx: number) => (
                  <tr key={day} className="hover:bg-emerald-50/50 transition-colors group print:hover:bg-transparent">
                    <td className="p-6 font-bold text-emerald-900 border-b border-emerald-100 bg-emerald-50/30 text-center print:p-4 print:border-gray-300 print:bg-transparent">
                      <div className="flex flex-col items-center">
                        <span className="text-lg">{day}</span>
                      </div>
                    </td>
                    {periods.map(p => {
                      const config = periodConfigs.find(c => c.day === dayIdx && c.period.toLowerCase() === p.toLowerCase());
                      const assignment = filteredAssignments.find(a => a.day === dayIdx && a.period.toLowerCase() === p.toLowerCase());
                      const employee = employees.find(e => e.id === assignment?.employeeId);
                      
                      const isOwnSchedule = user?.role === "Teacher" && employee?.firstName.includes(user.username);
                      const isActive = config ? config.isActive : true;

                      if (!isActive && !assignment) {
                        return (
                          <td key={p} className="p-6 border-b border-emerald-100 bg-gray-50/40 print:border-gray-300">
                            <div className="flex items-center justify-center opacity-20 print:hidden">
                              <div className="w-full h-px bg-emerald-200 rotate-12" />
                            </div>
                          </td>
                        );
                      }

                      return (
                        <td 
                          key={p} 
                          className="p-4 border-b border-emerald-100 text-center cursor-pointer relative min-w-[250px] print:border-gray-300 print:p-2"
                          onClick={() => {
                            if (user?.role === "Admin" && !isPrintMode) {
                              if (assignment) setEditingAssignment(assignment);
                              else setSelectedCell({ day: dayIdx, period: p });
                            }
                          }}
                        >
                          {assignment ? (
                            <div className={cn(
                              "p-5 rounded-2xl border shadow-sm transition-all text-start relative overflow-hidden group/card print:shadow-none print:border-gray-400 print:p-3",
                              isOwnSchedule 
                                ? "bg-emerald-600 text-white border-emerald-700 shadow-emerald-200 print:bg-transparent print:text-black" 
                                : "bg-white border-emerald-100 hover:border-emerald-300 hover:shadow-md print:bg-transparent"
                            )}>
                              <div className="flex justify-between items-start mb-3">
                                <span className={cn(
                                  "text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full",
                                  isOwnSchedule ? "bg-emerald-500 text-white print:bg-gray-100 print:text-black" : "bg-emerald-50 text-emerald-600 print:bg-gray-100 print:text-black"
                                )}>
                                  {assignment.subject}
                                </span>
                                {user?.role === "Admin" && !isPrintMode && (
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setAssignments(assignments.filter(a => a.id !== assignment.id));
                                    }}
                                    className={cn(
                                      "opacity-0 group-hover/card:opacity-100 transition-opacity print:hidden",
                                      isOwnSchedule ? "text-emerald-200 hover:text-white" : "text-red-300 hover:text-red-500"
                                    )}
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <UserIcon size={14} className={isOwnSchedule ? "text-emerald-200 print:text-black" : "text-emerald-400 print:text-black"} />
                                  <p className={cn("text-base font-bold", isOwnSchedule ? "text-white print:text-black" : "text-emerald-900 print:text-black")}>
                                    {employee?.firstName} {employee?.lastName}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Building size={14} className={isOwnSchedule ? "text-emerald-200 print:text-black" : "text-emerald-400 print:text-black"} />
                                  <p className={cn("text-xs", isOwnSchedule ? "text-emerald-100 print:text-black" : "text-emerald-500 print:text-black")}>
                                    {assignment.department} {assignment.room && `• ${assignment.room}`}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="h-24 flex items-center justify-center border-2 border-dashed border-emerald-100 rounded-2xl print:hidden">
                              {user?.role === "Admin" && !isPrintMode && (
                                <Plus className="text-emerald-200" size={28} />
                              )}
                            </div>
                          )}
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

      {/* Print Footer - Only visible in Print */}
      <div className="hidden print:flex justify-between mt-12 text-sm text-gray-500 border-t pt-4">
        <p>{isRTL ? "توقيع المدير" : "Director's Signature"}</p>
        <p>{isRTL ? "ختم المؤسسة" : "Institution Stamp"}</p>
      </div>

      {(selectedCell || editingAssignment) && (
        <AssignmentDialog 
          isOpen={true}
          onClose={() => {
            setSelectedCell(null);
            setEditingAssignment(null);
          }}
          day={selectedCell?.day ?? editingAssignment?.day}
          period={selectedCell?.period ?? editingAssignment?.period}
          existingAssignment={editingAssignment}
        />
      )}
    </div>
  );
};

export default Timetable;