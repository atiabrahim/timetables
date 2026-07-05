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
import { Plus } from "lucide-react";

interface AddLessonDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isRTL: boolean;
  newLesson: any;
  setNewLesson: (lesson: any) => void;
  subjects: any[];
  employees: any[];
  classes: any[];
  DAYS: any[];
  PERIODS: string[];
  onSave: () => void;
  cancelText: string;
}

const AddLessonDialog = ({
  isOpen, onOpenChange, isRTL, newLesson, setNewLesson,
  subjects, employees, classes, DAYS, PERIODS, onSave, cancelText
}: AddLessonDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-emerald-950 flex items-center gap-2">
            <Plus size={20} className="text-emerald-600" />
            {isRTL ? "إضافة حصة دراسية جديدة" : "Add New Lesson"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-emerald-800">{isRTL ? "المادة" : "Subject"}</label>
            <Select 
              value={newLesson.subjectId} 
              onValueChange={v => setNewLesson({...newLesson, subjectId: v})}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder={isRTL ? "اختر المادة..." : "Select Subject..."} />
              </SelectTrigger>
              <SelectContent>
                {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-emerald-800">{isRTL ? "الأستاذ" : "Teacher"}</label>
            <Select 
              value={newLesson.employeeId} 
              onValueChange={v => setNewLesson({...newLesson, employeeId: v})}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder={isRTL ? "اختر الأستاذ..." : "Select Teacher..."} />
              </SelectTrigger>
              <SelectContent>
                {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.lastName} {e.firstName}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-emerald-800">{isRTL ? "الفوج" : "Class"}</label>
            <Select 
              value={newLesson.classId} 
              onValueChange={v => setNewLesson({...newLesson, classId: v})}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder={isRTL ? "اختر الفوج..." : "Select Class..."} />
              </SelectTrigger>
              <SelectContent>
                {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-emerald-800">{isRTL ? "اسم القاعدة" : "Base Name"}</label>
            <Input 
              value={newLesson.department || ""} 
              onChange={e => setNewLesson({...newLesson, department: e.target.value})}
              placeholder={isRTL ? "اختياري..." : "Optional..."}
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-emerald-800">{isRTL ? "اليوم" : "Day"}</label>
            <Select 
              value={newLesson.day.toString()} 
              onValueChange={v => setNewLesson({...newLesson, day: parseInt(v)})}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder={isRTL ? "اختر اليوم..." : "Select Day..."} />
              </SelectTrigger>
              <SelectContent>
                {DAYS.map(d => <SelectItem key={d.id} value={d.id.toString()}>{isRTL ? d.name : d.en}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-emerald-800">{isRTL ? "الحصة" : "Period"}</label>
            <Select 
              value={newLesson.period} 
              onValueChange={v => setNewLesson({...newLesson, period: v})}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder={isRTL ? "اختر الحصة..." : "Select Period..."} />
              </SelectTrigger>
              <SelectContent>
                {PERIODS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-emerald-800">{isRTL ? "القاعة" : "Room"}</label>
            <Input 
              value={newLesson.room || ""} 
              onChange={e => setNewLesson({...newLesson, room: e.target.value})}
              placeholder={isRTL ? "مثلاً: القاعة 1" : "e.g. Room 1"}
              className="rounded-xl"
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
            {cancelText}
          </Button>
          <Button onClick={onSave} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white">
            {isRTL ? "إضافة الحصة" : "Add Lesson"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddLessonDialog;