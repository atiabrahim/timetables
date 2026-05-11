"use client";

import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface AddLessonDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isRTL: boolean;
  cancelText: string;
  subjects: any[];
  employees: any[];
  classes: any[];
  rooms: string[];
  viewMode: "class" | "teacher";
  newAssignment: any;
  setNewAssignment: (val: any) => void;
  onSave: () => void;
}

const AddLessonDialog = ({ 
  isOpen, onOpenChange, isRTL, cancelText, subjects, employees, classes, rooms, viewMode, newAssignment, setNewAssignment, onSave 
}: AddLessonDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-emerald-950 flex items-center gap-2">
            <Plus className="text-emerald-600" />
            {isRTL ? "إضافة حصة جديدة" : "Add New Lesson"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{isRTL ? "المادة" : "Subject"}</label>
            <Select value={newAssignment.subjectId} onValueChange={v => setNewAssignment({...newAssignment, subjectId: v})}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {viewMode === "class" ? (
            <div className="space-y-2">
              <label className="text-sm font-medium">{isRTL ? "الأستاذ" : "Teacher"}</label>
              <Select value={newAssignment.employeeId} onValueChange={v => setNewAssignment({...newAssignment, employeeId: v})}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.lastName} {e.firstName}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium">{isRTL ? "الفوج" : "Class"}</label>
              <Select value={newAssignment.classId} onValueChange={v => setNewAssignment({...newAssignment, classId: v})}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>) }
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium">{isRTL ? "القاعة / الورشة" : "Room / Workshop"}</label>
            <Select value={newAssignment.room} onValueChange={v => setNewAssignment({...newAssignment, room: v})}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder={isRTL ? "اختر القاعة..." : "Select room..."} />
              </SelectTrigger>
              <SelectContent>
                {rooms.map((r, idx) => <SelectItem key={idx} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">{cancelText}</Button>
          <Button onClick={onSave} className="bg-emerald-600 rounded-xl">{isRTL ? "حفظ" : "Save"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddLessonDialog;