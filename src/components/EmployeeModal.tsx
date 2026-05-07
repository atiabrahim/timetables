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
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { showSuccess, showError } from "../utils/toast";

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee?: any;
}

const EmployeeModal: React.FC<EmployeeModalProps> = ({ isOpen, onClose, employee }) => {
  const { t, employees, setEmployees } = useApp();
  const [formData, setFormData] = useState({
    firstName: employee?.firstName || "",
    lastName: employee?.lastName || "",
    category: employee?.category || "Full-time",
    observation: employee?.observation || ""
  });

  const handleSave = () => {
    if (!formData.firstName || !formData.lastName) {
      showError("Name fields are required");
      return;
    }

    if (employee) {
      setEmployees(employees.map(e => e.id === employee.id ? { ...e, ...formData } : e));
      showSuccess("Employee updated successfully");
    } else {
      const newEmp = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9)
      };
      setEmployees([...employees, newEmp]);
      showSuccess("Employee added successfully");
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] border-emerald-100">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-emerald-900">
            {employee ? t.edit : t.addEmployee}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-emerald-700 font-semibold">{t.firstName}</Label>
              <Input 
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="border-emerald-100 focus:ring-emerald-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-emerald-700 font-semibold">{t.lastName}</Label>
              <Input 
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="border-emerald-100 focus:ring-emerald-500"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-emerald-700 font-semibold">{t.category}</Label>
            <Select 
              value={formData.category} 
              onValueChange={(v) => setFormData({ ...formData, category: v })}
            >
              <SelectTrigger className="border-emerald-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Full-time">Full-time</SelectItem>
                <SelectItem value="Part-time">Part-time</SelectItem>
                <SelectItem value="Contract">Contract</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label className="text-emerald-700 font-semibold">{t.observation}</Label>
            <Input 
              value={formData.observation}
              onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
              className="border-emerald-100 focus:ring-emerald-500"
              placeholder="Additional notes..."
            />
          </div>
        </div>
        
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose} className="text-emerald-600">
            {t.cancel}
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8" onClick={handleSave}>
            {t.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeModal;