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
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle, MapPin } from "lucide-react";
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
  const { t, employees, departments, rooms, assignments, setAssignments, isRTL } = useApp();
  const [employeeId, setEmployeeId] = useState(existingAssignment?.employeeId || "");
  const [subject, setSubject] = useState(existingAssignment?.subject || "");
  const [department, setDepartment] = useState(existingAssignment?.department || departments[0]);
  const [room, setRoom] = useState(existingAssignment?.room || rooms[0]);
  const [conflict, setConflict] = useState<string | null>(null);

  useEffect(() => {
    if (employeeId || room) {
      // التحقق من تعارض الموظف
      const empConflict = assignments.find(a => 
        a.employeeId === employeeId && 
        a.day === day && 
        a.period.toLowerCase() === period.toLowerCase() && 
        a.id !== existingAssignment?.id
      );
      
      // التحقق من تعارض القاعة
      const roomConflict = assignments.find(a => 
        a.room === room && 
        a.day === day && 
        a.period.toLowerCase() === period.toLowerCase() && 
        a.id !== existingAssignment?.id
      );

      if (empConflict) {
        const emp = employees.find(e => e.id === employeeId);
        setConflict(isRTL 
          ? `${emp?.firstName} ${emp?.lastName} لديه تعيين بالفعل في هذا الوقت.` 
          : `${emp?.firstName} ${emp?.lastName} is already assigned during this period.`);
      } else if (roomConflict) {
        setConflict(isRTL 
          ? `القاعة ${room} محجوزة بالفعل في هذا الوقت.` 
          : `Room ${room} is already booked during this period.`);
      } else {
        setConflict(null);
      }
    }
  }, [employeeId, room, day, period, assignments, existingAssignment, employees, isRTL]);

  const handleSave = () => {
    if (!employeeId || !subject) {
      showError(isRTL ? "يرجى ملء جميع الحقول المطلوبة" : "Please fill in all required fields");
      return;
    }
    if (conflict) {
      showError(isRTL ? "يوجد تعارض، يرجى الحل قبل الحفظ" : "Conflict detected. Please resolve before saving.");
      return;
    }

    if (existingAssignment) {
      setAssignments(assignments.map(a => 
        a.id === existingAssignment.id 
          ? { ...a, employeeId, subject, department, room } 
          : a
      ));
    } else {
      const newAssignment = {
        id: Math.random().toString(36).substr(2, 9),
        employeeId,
        day,
        period,
        subject,
        department,
        room
      };
      setAssignments([...assignments, newAssignment]);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] border-emerald-100">
        <DialogHeader>
          <DialogTitle className="text-emerald-900">
            {existingAssignment ? t.edit : t.addEmployee} - {t.days[day]} ({t[period.toLowerCase() as keyof typeof t]})
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {conflict && (
            <Alert variant="destructive" className="bg-red-50 border-red-100 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{conflict}</AlertDescription>
            </Alert>
          )}
          
          <div className="grid gap-2">
            <Label className="text-emerald-700 font-semibold">{t.employees}</Label>
            <Select value={employeeId} onValueChange={setEmployeeId}>
              <SelectTrigger className="border-emerald-100 focus:ring-emerald-500">
                <SelectValue placeholder={isRTL ? "اختر الموظف" : "Select Employee"} />
              </SelectTrigger>
              <SelectContent>
                {employees.map(emp => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label className="text-emerald-700 font-semibold">{isRTL ? "المادة / النشاط" : "Subject / Activity"}</Label>
            <Input 
              value={subject} 
              onChange={(e) => setSubject(e.target.value)} 
              placeholder="e.g. Mathematics"
              className="border-emerald-100 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label className="text-emerald-700 font-semibold">{t.stats.departments}</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger className="border-emerald-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label className="text-emerald-700 font-semibold">{isRTL ? "القاعة" : "Room"}</Label>
              <Select value={room} onValueChange={setRoom}>
                <SelectTrigger className="border-emerald-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map(r => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose} className="text-emerald-600 hover:bg-emerald-50">
            {t.cancel}
          </Button>
          <Button 
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100" 
            onClick={handleSave}
            disabled={!!conflict}
          >
            {t.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignmentDialog;