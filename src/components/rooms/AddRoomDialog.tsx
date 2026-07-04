"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { Room } from "../../types";

interface AddRoomDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isRTL: boolean;
  newRoom: Room;
  setNewRoom: (room: Room) => void;
  onAdd: () => void;
  cancelText: string;
}

const AddRoomDialog = ({
  isOpen,
  onOpenChange,
  isRTL,
  newRoom,
  setNewRoom,
  onAdd,
  cancelText
}: AddRoomDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[2rem] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-emerald-950 flex items-center gap-2">
            <Plus size={24} className="text-emerald-600" />
            {isRTL ? "إضافة قاعة جديدة" : "Add New Room"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-xs font-black text-emerald-700 uppercase tracking-widest px-1">{isRTL ? "اسم القاعة" : "Room Name"}</label>
            <Input 
              value={newRoom.name} 
              onChange={e => setNewRoom({...newRoom, name: e.target.value})}
              placeholder={isRTL ? "مثلاً: قاعة المحاضرات 1" : "e.g. Lecture Hall 1"}
              className="h-12 rounded-2xl border-emerald-100 bg-emerald-50/30"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-emerald-700 uppercase tracking-widest px-1">{isRTL ? "السعة (مقعد)" : "Capacity (Seats)"}</label>
              <Input 
                type="number"
                value={newRoom.capacity || ""} 
                onChange={e => setNewRoom({...newRoom, capacity: parseInt(e.target.value) || 0})}
                className="h-12 rounded-2xl border-emerald-100 bg-emerald-50/30"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-emerald-700 uppercase tracking-widest px-1">{isRTL ? "النوع" : "Type"}</label>
              <Select value={newRoom.type} onValueChange={(v: any) => setNewRoom({...newRoom, type: v})}>
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
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl font-bold">{cancelText}</Button>
          <Button onClick={onAdd} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 font-black shadow-lg shadow-emerald-100">
            {isRTL ? "إضافة" : "Add Room"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddRoomDialog;