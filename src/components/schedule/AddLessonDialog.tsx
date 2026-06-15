"use client";

import React from "react";
import { Plus, Zap, BookOpen, User, GraduationCap, MapPin, HelpCircle } from "lucide-react";
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
import { cn } from "@/lib/utils";

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
  remainingLessons: any[];
  onQuickAssign: (req: any) => void;
}

const AddLessonDialog = ({ 
  isOpen, onOpenChange, isRTL, cancelText, subjects, employees, classes, rooms, viewMode, 
  newAssignment, setNewAssignment, onSave, remainingLessons, onQuickAssign 
}: AddLessonDialogProps) => {

  const getSubjectName = (id: string) => subjects.find(s => s.id === id)?.name || "---";
  const getEmployeeName = (id: string) => {
    const emp = employees.find(e => e.id === id);
    return emp ? `${emp.lastName} ${emp.firstName}` : "---";
  };
  const getClassName = (id: string) => classes.find(c => c.id === id)?.name || "---";

  const handleSelectRemaining = (req: any) => {
    setNewAssignment({
      ...newAssignment,
      subjectId: req.subjectId,
      employeeId: req.employeeId,
      classId: req.classId,
      room: req.room || ""
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-emerald-950 flex items-center gap-2">
            <Plus className="text-emerald-600" />
            {isRTL ? "إضافة حصة جديدة" : "Add New Lesson"}
          </DialogTitle>
        </DialogHeader>

        {/* قسم الإسناد السريع من المتطلبات المتبقية */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
            <Zap size={14} className="text-amber-500 fill-amber-500" />
            {isRTL ? "إسناد سريع من الحصص المتبقية" : "Quick Assign from Remaining"}
          </h4>

          {remainingLessons.length > 0 ? (
            <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto pr-1">
              {remainingLessons.map((req, idx) => {
                const isSelected = newAssignment.subjectId === req.subjectId && 
                                   newAssignment.employeeId === req.employeeId && 
                                   newAssignment.classId === req.classId;
                return (
                  <div 
                    key={idx}
                    onClick={() => handleSelectRemaining(req)}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-2xl border-2 transition-all cursor-pointer group",
                      isSelected 
                        ? "bg-emerald-50 border-emerald-500 shadow-sm" 
                        : "bg-slate-50/50 border-slate-100 hover:border-emerald-200"
                    )}
                  >
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <BookOpen size={12} className="text-emerald-600" />
                        <span className="font-black text-xs text-slate-800 truncate">{getSubjectName(req.subjectId)}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold">
                        <span className="flex items-center gap-0.5">
                          {viewMode === "class" ? (
                            <>
                              <User size={10} />
                              {getEmployeeName(req.employeeId)}
                            </>
                          ) : (
                            <>
                              <GraduationCap size={10} />
                              {getClassName(req.classId)}
                            </>
                          )}
                        </span>
                        {req.room && (
                          <span className="flex items-center gap-0.5">
                            <MapPin size={10} />
                            {req.room}
                          </span>
                        )}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickAssign(req);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-8 text-[10px] font-black gap-1 shadow-sm"
                    >
                      <Zap size={10} className="fill-white" />
                      {isRTL ? "إسناد فوري" : "Quick Assign"}
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <HelpCircle className="mx-auto text-slate-300 mb-1" size={20} />
              <p className="text-[10px] font-bold text-slate-400">
                {isRTL ? "لا توجد متطلبات متبقية غير مسندة" : "No remaining requirements left"}
              </p>
            </div>
          )}
        </div>

        <div className="w-full h-px bg-slate-100 my-2" />

        {/* نموذج الإدخال اليدوي */}
        <div className="space-y-4">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
            {isRTL ? "أو اختر يدوياً بالتفصيل" : "Or Select Manually"}
          </h4>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600">{isRTL ? "المادة" : "Subject"}</label>
            <Select value={newAssignment.subjectId} onValueChange={v => setNewAssignment({...newAssignment, subjectId: v})}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder={isRTL ? "اختر المادة..." : "Select subject..."} /></SelectTrigger>
              <SelectContent>
                {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {viewMode === "class" ? (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600">{isRTL ? "الأستاذ" : "Teacher"}</label>
              <Select value={newAssignment.employeeId} onValueChange={v => setNewAssignment({...newAssignment, employeeId: v})}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder={isRTL ? "اختر الأستاذ..." : "Select teacher..."} /></SelectTrigger>
                <SelectContent>
                  {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.lastName} {e.firstName}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600">{isRTL ? "الفوج" : "Class"}</label>
              <Select value={newAssignment.classId} onValueChange={v => setNewAssignment({...newAssignment, classId: v})}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder={isRTL ? "اختر الفوج..." : "Select class..."} /></SelectTrigger>
                <SelectContent>
                  {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>) }
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600">{isRTL ? "القاعة / الورشة" : "Room / Workshop"}</label>
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

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">{cancelText}</Button>
          <Button onClick={onSave} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white font-bold px-6">{isRTL ? "حفظ" : "Save"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddLessonDialog;