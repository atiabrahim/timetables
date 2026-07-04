"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit2 } from "lucide-react";
import { Room } from "../../types";

interface EditRoomDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isRTL: boolean;
  editingRoom: Room | null;
  setEditingRoom: (room: Room) => void;
  onSave: () => void;
  cancelText: string;
}

const EditRoomDialog = ({
  isOpen,
  onOpenChange,
  isRTL,
  editingRoom,
  setEditingRoom,
  onSave,
  cancelText
}: EditRoomDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[2rem] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-emerald-950 flex items-center gap-2">
            <Edit2 size={24} className="text-emerald-600" />
            {isRTL ? "تعديل بيانات القاعة" : "Edit Room Details"}
          </DialogTitle>
        </DialogHeader>
        {editingRoom && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-emerald-700 uppercase tracking-widest px-1">{isRTL ? "اسم القاعة" : "Room Name"}</label>
              <Input 
                value={editingRoom.name} 
                onChange={e => setEditingRoom({...editingRoom, name: e.target.value})}
                className="h-12 rounded-2xl border-emerald-100 bg-emerald-50/30"
                disabled
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-emerald-700 uppercase tracking-widest px-1">{isRTL ? "السعة" : "Capacity"}</label>
                <Input 
                  type="number"
                  value={editingRoom.capacity || ""} 
                  onChange={e => setEditingRoom({...editingRoom, capacity: parseInt(e.target.value) || 0})}
                  className="h-12 rounded-2xl border-emerald-100 bg-emerald-50/30"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-emerald-700 uppercase tracking-widest px-1">{isRTL ? "النوع" : "Type"}</label>
                <Select value={editingRoom.type} onValueChange={(v: any) => setEditingRoom({...editingRoom, type: v})}>
                  <SelectTrigger className="h-12 rounded-2xl border-emerald-100 bg-emerald-50/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Theory">{isRTL ? "نظري" : "Theory"}</SelectItem>
                    <SelectItem value="Workshop">{isRTL ? "ورشة" : "Workshop"}</SelectItem>
                    <SelectItem value="Lab">{isRTL ? "مخبر" : "Lab"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl font-bold">{cancelText}</Button>
          <Button onClick={onSave} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 font-black shadow-lg shadow-emerald-100">
            {isRTL ? "حفظ التغييرات" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditRoomDialog;