import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileDown, Printer, Plus, Trash2, Filter, User as UserIcon, Building, Clock } from "lucide-react";
import { exportToPdf } from "../lib/export-utils";
import AssignmentDialog from "../components/AssignmentDialog";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const Timetable = () => {
  const { t, isRTL, periodConfigs, assignments, setAssignments, employees, user, departments } = useApp();
  const [selectedCell, setSelectedCell] = useState<{ day: number, period: string } | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<any>(null);
  
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

  const handleExport = () => {
    const headers = [isRTL ? "اليوم" : "Day", ...periods.map(p => t[p.toLowerCase()])];
    const body = days.map((day: string, dayIdx: number) => {
      return [
        day,
        ...periods.map(p => {
          const assignment = filteredAssignments.find(a => 
            a.day === dayIdx && a.period.toLowerCase() === p.toLowerCase()
          );
          if (assignment) {
            const emp = employees.find(e => e.id === assignment.employeeId);
            return `${emp?.firstName} ${emp?.lastName}\n(${assignment.subject})`;
          }
          return "-";
        })
      ];
    });
    exportToPdf(headers, body, t.timetable);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
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
            <Button variant="outline" size="sm" className="border-emerald-200 text-emerald-700 h-10 rounded-xl" onClick={handleExport}>
              <FileDown size={18} className={isRTL ? "ml-2" : "mr-2"} />
              {t.exportPdf}
            </Button>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 h-10 rounded-xl shadow-lg shadow-emerald-100">
              <Printer size={18} className={isRTL ? "ml-2" : "mr-2"} />
              {isRTL ? "طباعة" : "Print"}
            </Button>
          </div>
        </div>
      </div>

      <Card className="border-none shadow-2xl overflow-hidden glass-card rounded-3xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-emerald-600 text-white">
                  <th className="p-6 text-start border-b border-emerald-500 w-40 text-lg font-bold">
                    {isRTL ? "اليوم" : "Day"}
                  </th>
                  {periods.map(p => (
                    <th key={p} className="p-6 text-center border-b border-emerald-500 text-lg font-bold">
                      {t[p.toLowerCase() as keyof typeof t]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {days.map((day: string, dayIdx: number) => (
                  <tr key={day} className="hover:bg-emerald-50/50 transition-colors group">
                    <td className="p-6 font-bold text-emerald-900 border-b border-emerald-100 bg-emerald-50/30 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-lg">{day}</span>
                        <span className="text-[10px] text-emerald-400 font-normal uppercase tracking-widest mt-1">Weekday</span>
                      </div>
                    </td>
                    {periods.map(p => {
                      const config = periodConfigs.find(c => c.day === dayIdx && c.period.toLowerCase() === p.toLowerCase());
                      const assignment = filteredAssignments.find(a => a.day === dayIdx && a.period.toLowerCase() === p.toLowerCase());
                      const employee = employees.find(e => e.id === assignment?.employeeId);
                      
                      const isOwnSchedule = user?.role === "Teacher" && employee?.firstName.includes(user.username);

                      // إذا كانت الفترة غير نشطة في الإعدادات، ولكن يوجد تعيين مستورد، سنعرضه على أي حال
                      // أو إذا لم تكن هناك إعدادات للفترة، سنعتبرها نشطة افتراضياً
                      const isActive = config ? config.isActive : true;

                      if (!isActive && !assignment) {
                        return (
                          <td key={p} className="p-6 border-b border-emerald-100 bg-gray-50/40">
                            <div className="flex items-center justify-center opacity-20">
                              <div className="w-full h-px bg-emerald-200 rotate-12" />
                            </div>
                          </td>
                        );
                      }

                      return (
                        <td 
                          key={p} 
                          className="p-4 border-b border-emerald-100 text-center cursor-pointer relative min-w-[250px]"
                          onClick={() => {
                            if (user?.role === "Admin") {
                              if (assignment) setEditingAssignment(assignment);
                              else setSelectedCell({ day: dayIdx, period: p });
                            }
                          }}
                        >
                          <AnimatePresence mode="wait">
                            {assignment ? (
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={cn(
                                  "p-5 rounded-2xl border shadow-sm transition-all text-start relative overflow-hidden group/card",
                                  isOwnSchedule 
                                    ? "bg-emerald-600 text-white border-emerald-700 shadow-emerald-200" 
                                    : "bg-white border-emerald-100 hover:border-emerald-300 hover:shadow-md"
                                )}
                              >
                                <div className="flex justify-between items-start mb-3">
                                  <span className={cn(
                                    "text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full",
                                    isOwnSchedule ? "bg-emerald-500 text-white" : "bg-emerald-50 text-emerald-600"
                                  )}>
                                    {assignment.subject}
                                  </span>
                                  {user?.role === "Admin" && (
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setAssignments(assignments.filter(a => a.id !== assignment.id));
                                      }}
                                      className={cn(
                                        "opacity-0 group-hover/card:opacity-100 transition-opacity",
                                        isOwnSchedule ? "text-emerald-200 hover:text-white" : "text-red-300 hover:text-red-500"
                                      )}
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  )}
                                </div>
                                
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <UserIcon size={14} className={isOwnSchedule ? "text-emerald-200" : "text-emerald-400"} />
                                    <p className={cn("text-base font-bold", isOwnSchedule ? "text-white" : "text-emerald-900")}>
                                      {employee?.firstName} {employee?.lastName}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Building size={14} className={isOwnSchedule ? "text-emerald-200" : "text-emerald-400"} />
                                    <p className={cn("text-xs", isOwnSchedule ? "text-emerald-100" : "text-emerald-500")}>
                                      {assignment.department}
                                    </p>
                                  </div>
                                </div>
                              </motion.div>
                            ) : (
                              <div className="h-24 flex items-center justify-center border-2 border-dashed border-emerald-100 rounded-2xl hover:border-emerald-300 transition-all hover:bg-emerald-50/30 group/empty">
                                {user?.role === "Admin" && (
                                  <div className="flex flex-col items-center gap-2">
                                    <Plus className="text-emerald-200 group-hover/empty:text-emerald-500 transition-colors" size={28} />
                                    <span className="text-xs text-emerald-300 group-hover/empty:text-emerald-500 font-medium">
                                      {isRTL ? "تعيين" : "Assign"}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </AnimatePresence>
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