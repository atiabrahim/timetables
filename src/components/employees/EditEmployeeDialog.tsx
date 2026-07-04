"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit2 } from "lucide-react";

interface EditEmployeeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isRTL: boolean;
  editingEmployee: any;
  setEditingEmployee: (emp: any) => void;
  onSave: () => void;
  cancelText: string;
}

const EditEmployeeDialog = ({
  isOpen,
  onOpenChange,
  isRTL,
  editingEmployee,
  setEditingEmployee,
  onSave,
  cancelText
}: EditEmployeeDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-emerald-950 flex items-center gap-2">
            <Edit2 size={20} className="text-emerald-600" />
            {isRTL ? "تعديل بيانات المعلم" : "Edit Teacher Details"}
          </DialogTitle>
        </DialogHeader>
        {editingEmployee && (
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-emerald-800">{isRTL ? "الاسم" : "First Name"}</label>
                <Input 
                  value={editingEmployee.firstName} 
                  onChange={e => setEditingEmployee({...editingEmployee, firstName: e.target.value})} 
                  className="rounded-xl" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-emerald-800">{isRTL ? "اللقب" : "Last Name"}</label>
                <Input 
                  value={editingEmployee.lastName} 
                  onChange={e => setEditingEmployee({...editingEmployee, lastName: e.target.value})} 
                  className="rounded-xl" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-emerald-800">{isRTL ? "الفئة" : "Category"}</label>
                <Select 
                  value={editingEmployee.category} 
                  onValueChange={v => setEditingEmployee({...editingEmployee, category: v})}
                >
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">{isRTL ? "دوام كامل" : "Full-time"}</SelectItem>
                    <SelectItem value="Part-time">{isRTL ? "دوام جزئي" : "Part-time"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-emerald-800">{isRTL ? "رقم الهاتف" : "Phone Number"}</label>
                <Input 
                  value={editingEmployee.phone} 
                  onChange={e => setEditingEmployee({...editingEmployee, phone: e.target.value})} 
                  className="rounded-xl" 
                  placeholder="0555xxxxxx"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-emerald-800">{isRTL ? "البريد الإلكتروني" : "Email"}</label>
              <Input 
                type="email"
                value={editingEmployee.email} 
                onChange={e => setEditingEmployee({...editingEmployee, email: e.target.value})} 
                className="rounded-xl" 
                placeholder="teacher@edu.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-emerald-800">{isRTL ? "ملاحظات" : "Observation"}</label>
              <Input 
                value={editingEmployee.observation} 
                onChange={e => setEditingEmployee({...editingEmployee, observation: e.target.value})} 
                className="rounded-xl" 
                placeholder="..."
              />
            </div>
          </div>
        )}
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
            {cancelText}
          </Button>
          <Button onClick={onSave} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl px-8 text-white">
            {isRTL ? "حفظ التغييرات" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditEmployeeDialog;