import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileDown, Printer, Plus, Trash2, Filter, User as UserIcon, Building } from "lucide-react";
import { exportToPdf } from "../lib/export-utils";
import AssignmentDialog from "../components/AssignmentDialog";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const Timetable = () => {
  const { t, isRTL, periodConfigs, assignments, setAssignments, employees, user, departments } = useApp();
  const [selectedCell, setSelectedCell] = useState<{ day: number, period: string } | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<any>(null);
  
  // Filters
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [empFilter, setEmpFilter] = useState<string>("all");

  const periods = ["Morning", "Afternoon"];
  const days = t.days;

  const filteredAssignments = useMemo(() => {
    let filtered = assignments;
    
    // If user is a teacher, they might only want to see their own schedule by default
    // but we allow them to see others if they want, unless restricted.
    // For this implementation, we'll allow viewing all but highlight theirs.
    
    if (deptFilter !== "all") {
      filtered = filtered.filter(a => a.department === deptFilter);
    }
    
    if (empFilter !== "all") {
      filtered = filtered.filter(a => a.employeeId === empFilter);
    }
    
    return filtered;
  }, [assignments, deptFilter, empFilter]);

  const handleExport = () => {
    const headers = ["Day", ...periods];
    const body = days.map((day: string, dayIdx: number) => {
      return [
        day,
        ...periods.map(p => {
          const assignment = filteredAssignments.find(a => a.day === dayIdx && a.period === p);
          if (assignment) {
            const emp = employees.find(e => e.id === assignment.employeeId);
            return `${emp?.firstName} - ${assignment.subject}`;
          }
          return "-";
        })
      ];
    });
    exportToPdf(headers, body, t.timetable);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAssignments(assignments.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <h2 className="text-2xl font-bold text-emerald-900">{t.timetable}</h2>
        
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Filters */}
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-emerald-100 shadow-sm">
            <div className="flex items-center px-2 text-emerald-500">
              <Filter size={16} />
            </div>
            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger className="w-[140px] border-none focus:ring-0 h-8 text-xs">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="w-px h-4 bg-emerald-100" />
            <Select value={empFilter} onValueChange={setEmpFilter}>
              <SelectTrigger className="w-[140px] border-none focus:ring-0 h-8 text-xs">
                <SelectValue placeholder="Employee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employees</SelectItem>
                {employees.map(e => (
                  <SelectItem key={e.id} value={e.id}>{e.firstName} {e.lastName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-emerald-200 text-emerald-700 h-10" onClick={handleExport}>
              <FileDown size={18} className={isRTL ? "ml-2" : "mr-2"} />
              {t.exportPdf}
            </Button>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 h-10 shadow-md shadow-emerald-100">
              <Printer size={18} className={isRTL ? "ml-2" : "mr-2"} />
              Print
            </Button>
          </div>
        </div>
      </div>

      <Card className="border-none shadow-xl overflow-hidden glass-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-emerald-600 text-white">
                  <th className="p-4 text-start border-b border-emerald-500 w-32">{isRTL ? "اليوم" : "Day"}</th>
                  {periods.map(p => (
                    <th key={p} className="p-4 text-center border-b border-emerald-500">
                      {t[p.toLowerCase() as keyof typeof t]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {days.map((day: string, dayIdx: number) => (
                  <tr key={day} className="hover:bg-emerald-50/50 transition-colors">
                    <td className="p-4 font-bold text-emerald-900 border-b border-emerald-100 bg-emerald-50/30">
                      {day}
                    </td>
                    {periods.map(p => {
                      const config = periodConfigs.find(c => c.day === dayIdx && c.period === p);
                      const assignment = filteredAssignments.find(a => a.day === dayIdx && a.period === p);
                      const employee = employees.find(e => e.id === assignment?.employeeId);
                      
                      const isOwnSchedule = user?.role === "Teacher" && employee?.firstName.includes(user.username);

                      if (!config?.isActive) {
                        return <td key={p} className="p-4 border-b border-emerald-100 bg-gray-50/50"></td>;
                      }

                      return (
                        <td 
                          key={p} 
                          className="p-4 border-b border-emerald-100 text-center cursor-pointer group relative min-w-[200px]"
                          onClick={() => {
                            if (user?.role === "Admin") {
                              if (assignment) {
                                setEditingAssignment(assignment);
                              } else {
                                setSelectedCell({ day: dayIdx, period: p });
                              }
                            }
                          }}
                        >
                          <AnimatePresence mode="wait">
                            {assignment ? (
                              <motion.div 
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={cn(
                                  "p-4 rounded-2xl border shadow-sm transition-all text-start relative overflow-hidden",
                                  isOwnSchedule 
                                    ? "bg-emerald-600 text-white border-emerald-700 shadow-emerald-200" 
                                    : "bg-white border-emerald-100 hover:border-emerald-300"
                                )}
                              >
                                {isOwnSchedule && (
                                  <div className="absolute top-0 right-0 p-1 bg-emerald-500/50 rounded-bl-lg">
                                    <UserIcon size={10} />
                                  </div>
                                )}
                                
                                <div className="flex justify-between items-start mb-2">
                                  <span className={cn(
                                    "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full",
                                    isOwnSchedule ? "bg-emerald-500 text-white" : "bg-emerald-50 text-emerald-600"
                                  )}>
                                    {assignment.subject}
                                  </span>
                                  {user?.role === "Admin" && (
                                    <button 
                                      onClick={(e) => handleDelete(assignment.id, e)}
                                      className={cn(
                                        "transition-colors",
                                        isOwnSchedule ? "text-emerald-200 hover:text-white" : "text-red-200 hover:text-red-500"
                                      )}
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  )}
                                </div>
                                
                                <div className="space-y-1">
                                  <p className={cn("text-sm font-bold", isOwnSchedule ? "text-white" : "text-emerald-900")}>
                                    {employee?.firstName} {employee?.lastName}
                                  </p>
                                  <div className="flex items-center gap-1">
                                    <Building size={10} className={isOwnSchedule ? "text-emerald-200" : "text-emerald-400"} />
                                    <p className={cn("text-[10px]", isOwnSchedule ? "text-emerald-100" : "text-emerald-500")}>
                                      {assignment.department}
                                    </p>
                                  </div>
                                </div>
                              </motion.div>
                            ) : (
                              <div className="h-20 flex items-center justify-center border-2 border-dashed border-emerald-100 rounded-2xl group-hover:border-emerald-300 transition-all group-hover:bg-emerald-50/30">
                                {user?.role === "Admin" && (
                                  <div className="flex flex-col items-center gap-1">
                                    <Plus className="text-emerald-200 group-hover:text-emerald-500 transition-colors" size={24} />
                                    <span className="text-[10px] text-emerald-300 group-hover:text-emerald-500 font-medium">Assign</span>
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