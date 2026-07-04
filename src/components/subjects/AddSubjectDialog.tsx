"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddSubjectDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isRTL: boolean;
  newSubject: any;
  setNewSubject: (sub: any) => void;
  onAdd: () => void;
  onTranslate: () => void;
  isTranslating: boolean;
  cancelText: string;
}

const AddSubjectDialog = ({
  isOpen,
  onOpenChange,
  isRTL,
  newSubject,
  setNewSubject,
  onAdd,
  onTranslate,
  isTranslating,
  cancelText
}: AddSubjectDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-emerald-950 flex items-center gap-2">
            <Plus size={20} className="text-emerald-600" />
            {isRTL ? "إضافة مادة جديدة" : "Add New Subject"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-emerald-800">{isRTL ? "اسم المادة" : "Subject Name"}</label>
            <Input 
              value={newSubject.name} 
              onChange={e => setNewSubject({...newSubject, name: e.target.value})}
              placeholder={isRTL ? "مثلاً: الرياضيات" : "e.g. Mathematics"}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-emerald-800">{isRTL ? "التسمية بالإنجليزية" : "English Name"}</label>
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn("h-6 text-emerald-500 hover:text-emerald-600 gap-1 text-xs", isTranslating && "animate-spin")}
                onClick={onTranslate}
                disabled={isTranslating}
              >
                {isTranslating ? <Loader2 size={12} /> : <Sparkles size={12} />}
                {isRTL ? "ترجمة قوقل" : "Google Translate"}
              </Button>
            </div>
            <Input 
              value={newSubject.nameEn} 
              onChange={e => setNewSubject({...newSubject, nameEn: e.target.value})}
              placeholder="English Name"
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

export default AddSubjectDialog;