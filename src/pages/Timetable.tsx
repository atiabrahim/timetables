import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileDown, Printer, Plus, Trash2, Filter, User as UserIcon, Building, Clock, Search, MapPin } from "lucide-react";
import { exportToPdf } from "../lib/export-utils";
import AssignmentDialog from "../components/AssignmentDialog";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

const Timetable = () => {
  const { t, isRTL, periodConfigs, assignments, setAssignments, employees, user, departments, rooms } = useApp();
  const [selectedCell, setSelectedCell] = useState<{ day: number, period: string } | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<any>(null);
  
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [empFilter, setEmpFilter] = useState<string>(user?.role === "Teacher" ? employees.find(e => e.firstName.includes(user.username))?.id || "all" : "all");
  const [roomFilter, setRoomFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const periods = ["Morning", "Afternoon"];
  const days = t.days;

  const filteredAssignments = useMemo(() => {
    return assignments.filter(a => {
      const matchesDept = deptFilter === "all" || a.department === deptFilter;
      const matchesEmp = empFilter === "all" || a.employeeId === empFilter;
      const matchesRoom = roomFilter === "all" || a.room === roomFilter;
      const matchesSearch = searchQuery === "" || 
        a.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employees.find(e => e.id === a.employeeId)?.firstName.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesDept && matchesEmp && matchesRoom && matchesSearch;
    });
  }, [assignments, deptFilter, empFilter, roomFilter, searchQuery, employees]);

  const handlePrint = () => {
    window.print();
  };

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
            return `${emp?.firstName} ${emp?.lastName}\n(${assignment.subject})\n[${assignment.room || '-'}]`;
          }
          return "-";
        })
      ];
    });
    exportToPdf(headers, body, t.timetable);
  };

  return (
    <div className="space-y-6 print:p-0">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 p-2 rounded-lg text-white">
            <Clock size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-emerald-900">{t.timetable}</h2>
            {user?.role === "Teacher" && <p className="text-xs text-emerald-600 font-medium">{isRTL ? "عرض جدولك الشخصي" : "Viewing your personal schedule"}</p>}
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className={cn("absolute top-1/2 -translate-y-1/2 text-emerald-400", isRTL ? "right-3" : "left-3")} size={16} />
            <Input 
              placeholder={isRTL ? "بحث عن مادة أو معلم..." : "Search subject or teacher..."}
              className={cn("border-emerald-100 focus:ring-emerald-500 rounded-xl h-10 text-sm", isRTL ? "pr-10" : "pl-10")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-emerald-200 text-emerald-700 h-10 rounded-xl" onClick={handleExport}>
              <FileDown size={18} className={isRTL ? "ml-2" : "mr-2"} />
              {t.exportPdf}
            </Button>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 h-10 rounded-xl shadow-lg shadow-emerald-100" onClick={handlePrint}>
              <Printer size={18} className={isRTL ? "ml-2" : "mr-2"} />
              {isRTL ? "طباعة" : "Print"}
            </Button>
          </div>
        </div>
      </div>

      {/* Advanced Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/50 p-4 rounded-2xl border border-emerald-100 print:hidden">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-emerald-600 uppercase px-1">{t.stats.departments}</label>
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="border-emerald-100 bg-white rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isRTL ? "كل المصالح" : "All Departments"}</SelectItem>
              {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-emerald-600 uppercase px-1">{t.employees}</label>
          <Select value={empFilter} onValueChange={setEmpFilter}>
            <SelectTrigger className="border-emerald-100 bg-white rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isRTL ? "كل الموظفين" : "All Employees"}</SelectItem>
              {employees.map(e => (
                <SelectItem key={e.id} value={e.id}>{e.firstName} {e.lastName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-emerald-600 uppercase px-1">{isRTL ? "القاعات" : "Rooms"}</label>
          <Select value={roomFilter} onValueChange={setRoomFilter}>
            <SelectTrigger className="border-emerald-100 bg-white rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isRTL ? "كل القاعات" : "All Rooms"}</SelectItem>
              {rooms.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="border-none shadow-2xl overflow-hidden glass-card rounded-3xl print:shadow-none print:border print:rounded-none">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-emerald-600 text-white print:bg-gray-100 print:text-black">
                  <th className="p-6 text-start border-b border-emerald-500 w-40 text-lg font-bold print:p-2 print:text-sm">
                    {isRTL ? "اليوم" : "Day"}
                  </th>
                  {periods.map(p => (
                    <th key={p} className="p-6 text-center border-b border-emerald-500 text-lg font-bold print:p-2 print:text-sm">
                      {t[p.toLowerCase() as keyof typeof t]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {days.map((day: string, dayIdx: number) => (
                  <tr key={day} className="hover:bg-emerald-50/50 transition-colors group">
                    <td className="p-6 font-bold text-emerald-900 border-b border-emerald-100 bg-emerald-50/30 text-center print:p-2 print:text-sm">
                      <div className="flex flex-col items-center">
                        <span className="text-lg print:text-sm">{day}</span>
                      </div>
                    </td>
                    {periods.map(p => {
                      const config = periodConfigs.find(c => c.day === dayIdx && c.period.toLowerCase() === p.toLowerCase());
                      const assignment = filteredAssignments.find(a => a.day === dayIdx && a.period.toLowerCase() === p.toLowerCase());
                      const employee = employees.find(e => e.id === assignment?.employeeId);
                      
                      const isActive = config ? config.isActive : true;

                      if (!isActive && !assignment) {
                        return (
                          <td key={p} className="p-6 border-b border-emerald-100 bg-gray-50/40 print:p-2">
                            <div className="flex items-center justify-center opacity-20">
                              <div className="w-full h-px bg-emerald-200 rotate-12" />
                            </div>
                          </td>
                        );
                      }

                      return (
                        <td 
                          key={p} 
                          className="p-4 border-b border-emerald-100 text-center cursor-pointer relative min-w-[250px] print:p-2 print:min-w-0"
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
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={cn(
                                  "p-5 rounded-2xl border shadow-sm transition-all text-start relative overflow-hidden group/card print:p-2 print:rounded-none print:shadow-none print:border-gray-300",
                                  assignment.employeeId === employees.find(e => e.firstName.includes(user?.username || ""))?.id
                                    ? "bg-emerald-600 text-white border-emerald-700" 
                                    : "bg-white border-emerald-100"
                                )}
                              >
                                <div className="flex justify-between items-start mb-3 print:mb-1">
                                  <span className={cn(
                                    "text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full print:px-0 print:text-[8px]",
                                    assignment.employeeId === employees.find(e => e.firstName.includes(user?.username || ""))?.id ? "bg-emerald-500 text-white" : "bg-emerald-50 text-emerald-600 print:bg-transparent print:text-black"
                                  )}>
                                    {assignment.subject}
                                  </span>
                                  {user?.role === "Admin" && (
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setAssignments(assignments.filter(a => a.id !== assignment.id));
                                      }}
                                      className="opacity-0 group-hover/card:opacity-100 transition-opacity text-red-300 hover:text-red-500 print:hidden"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  )}
                                </div>
                                
                                <div className="space-y-2 print:space-y-0">
                                  <div className="flex items-center gap-2">
                                    <UserIcon size={14} className="text-emerald-400 print:hidden" />
                                    <p className="text-sm font-bold print:text-xs">
                                      {employee?.firstName} {employee?.lastName}
                                    </p>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Building size={12} className="text-emerald-400 print:hidden" />
                                      <p className="text-[10px] opacity-80 print:text-[8px]">
                                        {assignment.department}
                                      </p>
                                    </div>
                                    {assignment.room && (
                                      <div className="flex items-center gap-1 bg-emerald-50/50 px-2 py-0.5 rounded-lg print:bg-transparent print:p-0">
                                        <MapPin size={10} className="text-emerald-500 print:hidden" />
                                        <span className="text-[10px] font-bold text-emerald-700 print:text-black print:text-[8px]">{assignment.room}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            ) : (
                              <div className="h-24 flex items-center justify-center border-2 border-dashed border-emerald-100 rounded-2xl print:hidden">
                                {user?.role === "Admin" && <Plus className="text-emerald-100" size={24} />}
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