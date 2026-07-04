"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AddClassDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isRTL: boolean;
  newBranch: any;
  setNewBranch: (branch: any) => void;
  onAdd: () => void;
  cancelText: string;
}

const AddClassDialog = ({
  isOpen,
  onOpenChange,
  isRTL,
  newBranch,
  setNewBranch,
  onAdd,
  cancelText
}: AddClassDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[2rem] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-emerald-950 flex items-center gap-2">
            <Plus size={24} className="text-emerald-600" />
            {isRTL ? "إضافة فرع جديد" : "Add New Branch"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-xs font-black text-emerald-700 uppercase tracking-widest px-1">{isRTL ? "اسم الفرع" : "Branch Name"}</label>
            <Input 
              value={newBranch.name} 
              onChange={e => setNewBranch({...newBranch, name: e.target.value})}
              placeholder={isRTL ? "مثلاً: تقني رياضي" : "e.g. Technical Math"}
              className="h-12 rounded-2xl border-emerald-100 bg-emerald-50/30"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-emerald-700 uppercase tracking-widest px-1">{isRTL ? "الرمز" : "Code"}</label>
              <Input 
                value={newBranch.code} 
                onChange={e => setNewBranch({...newBranch, code: e.target.value})}
                placeholder="e.g. TM"
                className="h-12 rounded-2xl border-emerald-100 bg-emerald-50/30"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-emerald-700 uppercase tracking-widest px-1">{isRTL ? "عدد الطلبة" : "Student Count"}</label>
              <Input 
                type="number"
                value={newBranch.studentCount} 
                onChange={e => setNewBranch({...newBranch, studentCount: parseInt(e.target.value) || 0})}
                className="h-12 rounded-2xl border-emerald-100 bg-emerald-50/30"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-emerald-700 uppercase tracking-widest px-1">{isRTL ? "مستوى التأهيل" : "Qualification Level"}</label>
            <Input 
              value={newBranch.qualificationLevel} 
              onChange={e => setNewBranch({...newBranch, qualificationLevel: e.target.value})}
              placeholder={isRTL ? "مثلاً: تقني سامي" : "e.g. Senior Tech"}
              className="h-12 rounded-2xl border-emerald-100 bg-emerald-50/30"
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl font-bold">{cancelText}</Button>
          <Button onClick={onAdd} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl px-8 font-black text-white shadow-lg shadow-emerald-100">
            {isRTL ? "إضافة" : "Add Branch"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddClassDialog;