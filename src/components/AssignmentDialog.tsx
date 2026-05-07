import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle } from "lucide-react";
import { showError } from "../utils/toast";

interface AssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  day: number;
  period: string;
  existingAssignment?: any;
}

const AssignmentDialog: React.FC<AssignmentDialogProps> = ({ 
  isOpen, onClose, day, period, existingAssignment 
}) => {
  const { t, employees, departments, rooms, classes, subjects, assignments, setAssignments, isRTL } = useApp();
  const [employeeId, setEmployeeId] = useState(existingAssignment?.employeeId || "");
  const [subjectId, setSubjectId] = useState(existingAssignment?.subjectId || "");
  const [classId, setClassId] = useState(existingAssignment?.classId || "");
  const [department, setDepartment] = useState(existingAssignment?.department || departments[0]);
  const [room, setRoom] = useState(existingAssignment?.room || rooms[0]);
  const [conflict, setConflict] = useState<string | null>(null);

  useEffect(() => {
    if (employeeId || room || classId) {
      const timeMatch = (a: any) => a.day === day && a.period.toLowerCase() === period.toLowerCase() && a.id !== existingAssignment?.id;

      const empConflict = assignments.find(a => a.employeeId === employeeId && timeMatch(a));
      const roomConflict = assignments.find(a => a.room === room && timeMatch(a));
      const classConflict = assignments.find(a => a.classId === classId && timeMatch(a));

      if (empConflict) {
        const emp = employees.find(e => e.id === employeeId);
        setConflict(isRTL ? `${emp?.firstName} ${emp?.lastName} لديه حصة بالفعل.` : `${emp?.firstName} ${emp?.lastName} is busy.`);
      } else if (roomConflict) {
        setConflict(isRTL ? `القاعة ${room} محجوزة.` : `Room ${room} is booked.`);
      } else if (classConflict) {
        const cls = classes.find(c => c.id === classId);
        setConflict(isRTL ? `الفوج ${cls?.name} لديه حصة أخرى.` : `Class ${cls?.name} is busy.`);
      } else {
        setConflict(null);
      }
    }
  }, [employeeId, room, classId, day, period, assignments, existingAssignment, employees, classes, isRTL]);

  const handleSave = () => {
    if (!employeeId || !subjectId || !classId) {
      showError(isRTL ? "يرجى ملء جميع الحقول" : "Please fill all fields");
      return;
    }
    if (conflict) return;

    const data = {
      id: existingAssignment?.id || Math.random().toString(36).substr(2, 9),
      employeeId, subjectId, classId, department, room, day, period
    };

    if (existingAssignment) {
      setAssignments(assignments.map(a => a.id === data.id ? data : a));
    } else {
      setAssignments([...assignments, data]);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] border-emerald-100">
        <DialogHeader>
          <DialogTitle className="text-emerald-900">
            {existingAssignment ? t.edit : t.addEmployee} - {t.days[day]}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {conflict && (
            <Alert variant="destructive" className="bg-red-50 border-red-100 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{conflict}</AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-emerald-700 font-semibold">{t.employees}</Label>
              <Select value={employeeId} onValueChange={setEmployeeId}>
                <SelectTrigger className="border-emerald-100"><SelectValue placeholder="..." /></SelectTrigger>
                <SelectContent>{employees.map(e => <SelectItem key={e.id} value={e.id}>{e.firstName} {e.lastName}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-emerald-700 font-semibold">{isRTL ? "الفوج التربوي" : "Class/Group"}</Label>
              <Select value={classId} onValueChange={setClassId}>
                <SelectTrigger className="border-emerald-100"><SelectValue placeholder="..." /></SelectTrigger>
                <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-emerald-700 font-semibold">{isRTL ? "المادة الدراسية" : "Subject"}</Label>
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger className="border-emerald-100"><SelectValue placeholder="..." /></SelectTrigger>
              <SelectContent>{subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-emerald-700 font-semibold">{t.stats.departments}</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger className="border-emerald-100"><SelectValue /></SelectTrigger>
                <SelectContent>{departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-emerald-700 font-semibold">{isRTL ? "القاعة" : "Room"}</Label>
              <Select value={room} onValueChange={setRoom}>
                <SelectTrigger className="border-emerald-100"><SelectValue /></SelectTrigger>
                <SelectContent>{rooms.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>{t.cancel}</Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSave} disabled={!!conflict}>{t.save}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignmentDialog;