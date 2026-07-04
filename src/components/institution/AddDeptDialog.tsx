"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Hash, PenTool, User, ShieldAlert } from "lucide-react";

interface AddDeptDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isRTL: boolean;
  newDept: any;
  setNewDept: (dept: any) => void;
  onAdd: () => void;
  cancelText: string;
}

const AddDeptDialog = ({
  isOpen,
  onOpenChange,
  isRTL,
  newDept,
  setNewDept,
  onAdd,
  cancelText
}: AddDeptDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-emerald-950 flex items-center gap-2">
            <Plus size={20} className="text-emerald-600" />
            {isRTL ? "إضافة مصلحة جديدة" : "Add New Department"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5 col-span-1">
              <label className="text-xs font-bold text-emerald-800 flex items-center gap-1"><Hash size={12}/> {isRTL ? "الرقم" : "No."}</label>
              <Input 
                value={newDept.number} 
                onChange={e => setNewDept({...newDept, number: e.target.value})}
                placeholder="1"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5 col-span-2">
              <label className="text-xs font-bold text-emerald-800 flex items-center gap-1"><PenTool size={12}/> {isRTL ? "التسمية" : "Name"}</label>
              <Input 
                value={newDept.name} 
                onChange={e => setNewDept({...newDept, name: e.target.value})}
                placeholder={isRTL ? "مصلحة التكوين" : "Training Dept"}
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5 col-span-2">
              <label className="text-xs font-bold text-emerald-800 flex items-center gap-1"><User size={12}/> {isRTL ? "الرئيس" : "Head"}</label>
              <Input 
                value={newDept.head} 
                onChange={e => setNewDept({...newDept, head: e.target.value})}
                placeholder={isRTL ? "اسم رئيس المصلحة" : "Head Name"}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5 col-span-1">
              <label className="text-xs font-bold text-emerald-800 flex items-center gap-1"><ShieldAlert size={12}/> {isRTL ? "الرمز" : "Code"}</label>
              <Input 
                value={newDept.code} 
                onChange={e => setNewDept({...newDept, code: e.target.value})}
                placeholder="DEP"
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-emerald-800">{isRTL ? "ملاحظة" : "Observation"}</label>
            <Input 
              value={newDept.observation} 
              onChange={e => setNewDept({...newDept, observation: e.target.value})}
              placeholder="..."
              className="rounded-xl"
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">{cancelText}</Button>
          <Button onClick={onAdd} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white">{isRTL ? "إضافة" : "Add"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddDeptDialog;