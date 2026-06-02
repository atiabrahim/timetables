"use client";

import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface EditLessonDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isRTL: boolean;
  editingLesson: any;
  setEditingLesson: (lesson: any) => void;
  subjects: any[];
  employees: any[];
  classes: any[];
  DAYS: any[];
  PERIODS: string[];
  onSave: () => void;
  cancelText: string;
}

const EditLessonDialog = ({
  isOpen, onOpenChange, isRTL, editingLesson, setEditingLesson,
  subjects, employees, classes, DAYS, PERIODS, onSave, cancelText
}: EditLessonDialogProps) => {
  if (!editingLesson) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-emerald-950">
            {isRTL ? "تعديل بيانات الحصة" : "Edit Lesson Details"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-emerald-800">{isRTL ? "المادة" : "Subject"}</label>
            <Select 
              value={editingLesson.subjectId} 
              onValueChange={v => setEditingLesson({...editingLesson, subjectId: v})}
            >
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-emerald-800">{isRTL ? "الأستاذ" : "Teacher"}</label>
            <Select 
              value={editingLesson.employeeId} 
              onValueChange={v => setEditingLesson({...editingLesson, employeeId: v})}
            >
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.lastName} {e.firstName}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-emerald-800">{isRTL ? "الفوج" : "Class"}</label>
            <Select 
              value={editingLesson.classId} 
              onValueChange={v => setEditingLesson({...editingLesson, classId: v})}
            >
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-emerald-800">{isRTL ? "اسم القاعدة" : "Base Name"}</label>
            <Input 
              value={editingLesson.department || ""} 
              onChange={e => setEditingLesson({...editingLesson, department: e.target.value})}
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-emerald-800">{isRTL ? "اليوم" : "Day"}</label>
            <Select 
              value={editingLesson.day.toString()} 
              onValueChange={v => setEditingLesson({...editingLesson, day: parseInt(v)})}
            >
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                {DAYS.map(d => <SelectItem key={d.id} value={d.id.toString()}>{isRTL ? d.name : d.en}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-emerald-800">{isRTL ? "الحصة" : "Period"}</label>
            <Select 
              value={editingLesson.period} 
              onValueChange={v => setEditingLesson({...editingLesson, period: v})}
            >
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PERIODS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-emerald-800">{isRTL ? "القاعة" : "Room"}</label>
            <Input 
              value={editingLesson.room || ""} 
              onChange={e => setEditingLesson({...editingLesson, room: e.target.value})}
              className="rounded-xl"
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
            {cancelText}
          </Button>
          <Button onClick={onSave} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl">
            {isRTL ? "حفظ التغييرات" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditLessonDialog;