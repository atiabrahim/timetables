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
  const { t, employees, departments, assignments, setAssignments } = useApp();
  const [employeeId, setEmployeeId] = useState(existingAssignment?.employeeId || "");
  const [subject, setSubject] = useState(existingAssignment?.subject || "");
  const [department, setDepartment] = useState(existingAssignment?.department || departments[0]);
  const [conflict, setConflict] = useState<string | null>(null);

  useEffect(() => {
    if (employeeId) {
      const isBusy = assignments.find(a => 
        a.employeeId === employeeId && 
        a.day === day && 
        a.period === period && 
        a.id !== existingAssignment?.id
      );
      
      if (isBusy) {
        const emp = employees.find(e => e.id === employeeId);
        setConflict(`${emp?.firstName} ${emp?.lastName} is already assigned to ${isBusy.subject} during this period.`);
      } else {
        setConflict(null);
      }
    }
  }, [employeeId, day, period, assignments, existingAssignment, employees]);

  const handleSave = () => {
    if (!employeeId || !subject) {
      showError("Please fill in all required fields");
      return;
    }
    if (conflict) {
      showError("Conflict detected. Please resolve before saving.");
      return;
    }

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
            <Label className="text-emerald-700 font-semibold">Subject / Activity</Label>
            <Input 
              value={subject} 
              onChange={(e) => setSubject(e.target.value)} 
              placeholder="e.g. Mathematics"
              className="border-emerald-100 focus:ring-emerald-500"
            />
          </div>
          
          <div className="grid gap-2">
            <Label className="text-emerald-700 font-semibold">{t.stats.departments}</Label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger className="border-emerald-100 focus:ring-emerald-500">
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