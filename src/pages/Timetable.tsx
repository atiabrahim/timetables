import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, Printer, Plus, Edit3, Trash2 } from "lucide-react";
import { exportToPdf } from "../lib/export-utils";
import AssignmentDialog from "../components/AssignmentDialog";
import { motion, AnimatePresence } from "framer-motion";

const Timetable = () => {
  const { t, isRTL, periodConfigs, assignments, setAssignments, employees, user } = useApp();
  const [selectedCell, setSelectedCell] = useState<{ day: number, period: string } | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<any>(null);

  const periods = ["Morning", "Afternoon"];
  const days = t.days;

  const handleExport = () => {
    const headers = ["Day", ...periods];
    const body = days.map((day: string, dayIdx: number) => {
      return [
        day,
        ...periods.map(p => {
          const assignment = assignments.find(a => a.day === dayIdx && a.period === p);
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-emerald-900">{t.timetable}</h2>
        <div className="flex space-x-2 rtl:space-x-reverse">
          <Button variant="outline" className="border-emerald-200 text-emerald-700" onClick={handleExport}>
            <FileDown size={18} className={isRTL ? "ml-2" : "mr-2"} />
            {t.exportPdf}
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Printer size={18} className={isRTL ? "ml-2" : "mr-2"} />
            Print
          </Button>
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
                      const assignment = assignments.find(a => a.day === dayIdx && a.period === p);
                      const employee = employees.find(e => e.id === assignment?.employeeId);

                      if (!config?.isActive) {
                        return <td key={p} className="p-4 border-b border-emerald-100 bg-gray-50/50"></td>;
                      }

                      return (
                        <td 
                          key={p} 
                          className="p-4 border-b border-emerald-100 text-center cursor-pointer group relative"
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
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white p-3 rounded-xl border border-emerald-100 shadow-sm hover:shadow-md transition-all text-start"
                              >
                                <div className="flex justify-between items-start mb-1">
                                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-tighter">
                                    {assignment.subject}
                                  </p>
                                  {user?.role === "Admin" && (
                                    <button 
                                      onClick={(e) => handleDelete(assignment.id, e)}
                                      className="text-red-300 hover:text-red-500 transition-colors"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  )}
                                </div>
                                <p className="text-sm font-semibold text-emerald-900">
                                  {employee?.firstName} {employee?.lastName}
                                </p>
                                <p className="text-[10px] text-emerald-500 mt-1">{assignment.department}</p>
                              </motion.div>
                            ) : (
                              <div className="h-16 flex items-center justify-center border-2 border-dashed border-emerald-100 rounded-xl group-hover:border-emerald-300 transition-colors">
                                {user?.role === "Admin" && <Plus className="text-emerald-200 group-hover:text-emerald-400" size={20} />}
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