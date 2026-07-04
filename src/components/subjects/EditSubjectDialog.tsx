"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditSubjectDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isRTL: boolean;
  editingSubject: any;
  setEditingSubject: (sub: any) => void;
  onSave: () => void;
  onTranslate: () => void;
  isTranslating: boolean;
  cancelText: string;
}

const EditSubjectDialog = ({
  isOpen,
  onOpenChange,
  isRTL,
  editingSubject,
  setEditingSubject,
  onSave,
  onTranslate,
  isTranslating,
  cancelText
}: EditSubjectDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-emerald-950">{isRTL ? "تعديل المادة" : "Edit Subject"}</DialogTitle>
        </DialogHeader>
        {editingSubject && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-emerald-800">{isRTL ? "اسم المادة" : "Subject Name"}</label>
              <Input 
                value={editingSubject.name} 
                onChange={e => setEditingSubject({...editingSubject, name: e.target.value})}
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
                value={editingSubject.nameEn || ""} 
                onChange={e => setEditingSubject({...editingSubject, nameEn: e.target.value})}
                className="rounded-xl"
              />
            </div>
          </div>
        )}
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">{cancelText}</Button>
          <Button onClick={onSave} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white">{isRTL ? "حفظ" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditSubjectDialog;