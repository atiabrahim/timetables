import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer, Plus, Trash2, Clock, User as UserIcon, Users2, BookOpen, MapPin } from "lucide-react";
import AssignmentDialog from "../components/AssignmentDialog";
import { cn } from "@/lib/utils";

const Timetable = () => {
  const { t, isRTL, assignments, setAssignments, employees, classes, subjects, user, rooms } = useApp();
  const [selectedCell, setSelectedCell] = useState<{ day: number, period: string } | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<any>(null);
  
  const [classFilter, setClassFilter] = useState<string>("all");
  const [empFilter, setEmpFilter] = useState<string>("all");

  const periods = ["Morning", "Afternoon"];
  const days = t.days;

  const filteredAssignments = useMemo(() => {
    return assignments.filter(a => {
      const matchesClass = classFilter === "all" || a.classId === classFilter;
      const matchesEmp = empFilter === "all" || a.employeeId === empFilter;
      return matchesClass && matchesEmp;
    });
  }, [assignments, classFilter, empFilter]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <div className="flex items-center gap-3">
          <Clock className="text-emerald-600" />
          <h2 className="text-2xl font-bold text-emerald-900">{t.timetable}</h2>
        </div>
        <div className="flex gap-2">
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-40 border-emerald-100"><SelectValue placeholder={isRTL ? "الفوج" : "Class"} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isRTL ? "كل الأفواج" : "All Classes"}</SelectItem>
              {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => window.print()}><Printer size={18} /></Button>
        </div>
      </div>

      <Card className="border-none shadow-xl overflow-hidden glass-card rounded-3xl">
        <CardContent className="p-0">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-emerald-600 text-white">
                <th className="p-4 text-start border-b border-emerald-500 w-32">{isRTL ? "اليوم" : "Day"}</th>
                {periods.map(p => <th key={p} className="p-4 text-center border-b border-emerald-500">{t[p.toLowerCase()]}</th>)}
              </tr>
            </thead>
            <tbody>
              {days.map((day: string, dayIdx: number) => (
                <tr key={day} className="hover:bg-emerald-50/30 transition-colors">
                  <td className="p-4 font-bold text-emerald-900 border-b border-emerald-100 bg-emerald-50/20 text-center">{day}</td>
                  {periods.map(p => {
                    const assignment = filteredAssignments.find(a => a.day === dayIdx && a.period.toLowerCase() === p.toLowerCase());
                    const employee = employees.find(e => e.id === assignment?.employeeId);
                    const subject = subjects.find(s => s.id === assignment?.subjectId);
                    const cls = classes.find(c => c.id === assignment?.classId);

                    return (
                      <td key={p} className="p-3 border-b border-emerald-100 text-center min-w-[200px]" 
                          onClick={() => user?.role === "Admin" && (assignment ? setEditingAssignment(assignment) : setSelectedCell({ day: dayIdx, period: p }))}>
                        {assignment ? (
                          <div className="p-4 rounded-2xl bg-white border border-emerald-100 shadow-sm text-start space-y-2 relative group">
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <BookOpen size={10} /> {subject?.name}
                              </span>
                              {user?.role === "Admin" && (
                                <button onClick={(e) => { e.stopPropagation(); setAssignments(assignments.filter(a => a.id !== assignment.id)); }} 
                                        className="opacity-0 group-hover:opacity-100 text-red-300 hover:text-red-500 transition-opacity"><Trash2 size={14} /></button>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                              <UserIcon size={12} className="text-emerald-400" /> {employee?.firstName} {employee?.lastName}
                            </div>
                            <div className="flex justify-between items-center text-[10px] text-emerald-600">
                              <span className="flex items-center gap-1"><Users2 size={10} /> {cls?.name}</span>
                              <span className="flex items-center gap-1 font-bold"><MapPin size={10} /> {assignment.room}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="h-20 flex items-center justify-center border-2 border-dashed border-emerald-50 rounded-2xl opacity-30">
                            {user?.role === "Admin" && <Plus size={20} />}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {(selectedCell || editingAssignment) && (
        <AssignmentDialog 
          isOpen={true} onClose={() => { setSelectedCell(null); setEditingAssignment(null); }}
          day={selectedCell?.day ?? editingAssignment?.day}
          period={selectedCell?.period ?? editingAssignment?.period}
          existingAssignment={editingAssignment}
        />
      )}
    </div>
  );
};

export default Timetable;