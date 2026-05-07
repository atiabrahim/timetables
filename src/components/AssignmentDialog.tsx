import React, { useState } from "react";
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
  const { t, employees, departments, assignments, setAssignments } = useApp();
  const [employeeId, setEmployeeId] = useState(existingAssignment?.employeeId || "");
  const [subject, setSubject] = useState(existingAssignment?.subject || "");
  const [department, setDepartment] = useState(existingAssignment?.department || departments[0]);

  const handleSave = () => {
    if (!employeeId || !subject) return;

    if (existingAssignment) {
      setAssignments(assignments.map(a => 
        a.id === existingAssignment.id 
          ? { ...a, employeeId, subject, department } 
          : a
      ));
    } else {
      const newAssignment = {
        id: Math.random().toString(36).substr(2, 9),
        employeeId,
        day,
        period,
        subject,
        department
      };
      setAssignments([...assignments, newAssignment]);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-emerald-900">
            {existingAssignment ? t.edit : t.addEmployee} - {t.days[day]} ({t[period.toLowerCase() as keyof typeof t]})
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>{t.employees}</Label>
            <Select value={employeeId} onValueChange={setEmployeeId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Employee" />
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
            <Label>Subject</Label>
            <Input 
              value={subject} 
              onChange={(e) => setSubject(e.target.value)} 
              placeholder="e.g. Mathematics"
            />
          </div>
          <div className="grid gap-2">
            <Label>{t.stats.departments}</Label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t.cancel}</Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSave}>{t.save}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignmentDialog;