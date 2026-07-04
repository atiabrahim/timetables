"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface EditClassDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isRTL: boolean;
  editingBranch: any;
  setEditingBranch: (branch: any) => void;
  onSave: () => void;
  cancelText: string;
}

const EditClassDialog = ({
  isOpen,
  onOpenChange,
  isRTL,
  editingBranch,
  setEditingBranch,
  onSave,
  cancelText
}: EditClassDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[2rem] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-emerald-950">
            {isRTL ? "تعديل بيانات الفرع" : "Edit Branch Details"}
          </DialogTitle>
        </DialogHeader>
        {editingBranch && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-emerald-700 uppercase tracking-widest px-1">{isRTL ? "اسم الفرع" : "Branch Name"}</label>
              <Input 
                value={editingBranch.name} 
                onChange={e => setEditingBranch({...editingBranch, name: e.target.value})}
                className="h-12 rounded-2xl border-emerald-100 bg-emerald-50/30"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-emerald-700 uppercase tracking-widest px-1">{isRTL ? "الرمز" : "Code"}</label>
                <Input 
                  value={editingBranch.code} 
                  onChange={e => setEditingBranch({...editingBranch, code: e.target.value})}
                  className="h-12 rounded-2xl border-emerald-100 bg-emerald-50/30"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-emerald-700 uppercase tracking-widest px-1">{isRTL ? "عدد الطلبة" : "Student Count"}</label>
                <Input 
                  type="number"
                  value={editingBranch.studentCount} 
                  onChange={e => setEditingBranch({...editingBranch, studentCount: parseInt(e.target.value) || 0})}
                  className="h-12 rounded-2xl border-emerald-100 bg-emerald-50/30"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-emerald-700 uppercase tracking-widest px-1">{isRTL ? "مستوى التأهيل" : "Qualification Level"}</label>
              <Input 
                value={editingBranch.qualificationLevel} 
                onChange={e => setEditingBranch({...editingBranch, qualificationLevel: e.target.value})}
                className="h-12 rounded-2xl border-emerald-100 bg-emerald-50/30"
              />
            </div>
          </div>
        )}
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl font-bold">{cancelText}</Button>
          <Button onClick={onSave} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl px-8 font-black text-white shadow-lg shadow-emerald-100">
            {isRTL ? "حفظ التغييرات" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditClassDialog;