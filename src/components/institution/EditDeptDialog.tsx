"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Hash, PenTool, User, ShieldAlert } from "lucide-react";

interface EditDeptDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isRTL: boolean;
  editingDept: any;
  setEditingDept: (dept: any) => void;
  onSave: () => void;
  cancelText: string;
}

const EditDeptDialog = ({
  isOpen,
  onOpenChange,
  isRTL,
  editingDept,
  setEditingDept,
  onSave,
  cancelText
}: EditDeptDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-emerald-950">
            {isRTL ? "تعديل بيانات المصلحة" : "Edit Department Details"}
          </DialogTitle>
        </DialogHeader>
        {editingDept && (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5 col-span-1">
                <label className="text-xs font-bold text-emerald-800 flex items-center gap-1"><Hash size={12}/> {isRTL ? "الرقم" : "No."}</label>
                <Input 
                  value={editingDept.number} 
                  onChange={e => setEditingDept({...editingDept, number: e.target.value})}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5 col-span-2">
                <label className="text-xs font-bold text-emerald-800 flex items-center gap-1"><PenTool size={12}/> {isRTL ? "التسمية" : "Name"}</label>
                <Input 
                  value={editingDept.name} 
                  onChange={e => setEditingDept({...editingDept, name: e.target.value})}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5 col-span-2">
                <label className="text-xs font-bold text-emerald-800 flex items-center gap-1"><User size={12}/> {isRTL ? "الرئيس" : "Head"}</label>
                <Input 
                  value={editingDept.head} 
                  onChange={e => setEditingDept({...editingDept, head: e.target.value})}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5 col-span-1">
                <label className="text-xs font-bold text-emerald-800 flex items-center gap-1"><ShieldAlert size={12}/> {isRTL ? "الرمز" : "Code"}</label>
                <Input 
                  value={editingDept.code} 
                  onChange={e => setEditingDept({...editingDept, code: e.target.value})}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-emerald-800">{isRTL ? "ملاحظة" : "Observation"}</label>
              <Input 
                value={editingDept.observation} 
                onChange={e => setEditingDept({...editingDept, observation: e.target.value})}
                className="rounded-xl"
              />
            </div>
          </div>
        )}
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
            {cancelText}
          </Button>
          <Button onClick={onSave} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white">
            {isRTL ? "حفظ التغييرات" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditDeptDialog;