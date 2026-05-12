"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Download, 
  Plus, 
  Edit2, 
  ArrowUpDown,
  Trash2,
  MapPin,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { showSuccess } from "../utils/toast";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type SortConfig = {
  key: "name" | null;
  direction: "asc" | "desc";
};

const Rooms = () => {
  const { rooms, setRooms, isRTL, user, t } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: "asc" });
  
  const [newRoomName, setNewRoomName] = useState("");
  const [editingRoom, setEditingRoom] = useState<{oldName: string, newName: string} | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const isAdmin = user?.role === "Admin";

  const handleSort = (key: SortConfig["key"]) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedAndFilteredRooms = useMemo(() => {
    let items = [...rooms].filter(r => 
      r.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortConfig.key !== null) {
      items.sort((a, b) => {
        if (a < b) return sortConfig.direction === "asc" ? -1 : 1;
        if (a > b) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [rooms, searchTerm, sortConfig]);

  const SortIcon = ({ column }: { column: SortConfig["key"] }) => {
    if (sortConfig.key !== column) return <ArrowUpDown size={14} className="text-gray-300" />;
    return sortConfig.direction === "asc" ? <ChevronUp size={14} className="text-emerald-600" /> : <ChevronDown size={14} className="text-emerald-600" />;
  };

  const handleAddRoom = () => {
    if (!newRoomName.trim()) return;
    if (rooms.includes(newRoomName)) return;
    setRooms([...rooms, newRoomName]);
    setNewRoomName("");
    showSuccess(isRTL ? "تم إضافة القاعة بنجاح" : "Room added successfully");
  };

  const handleEditClick = (room: string) => {
    setEditingRoom({ oldName: room, newName: room });
    setIsEditDialogOpen(true);
  };

  const handleUpdateRoom = () => {
    if (!editingRoom || !editingRoom.newName.trim()) return;
    setRooms(rooms.map(r => r === editingRoom.oldName ? editingRoom.newName : r));
    setIsEditDialogOpen(false);
    showSuccess(isRTL ? "تم تحديث القاعة" : "Room updated successfully");
  };

  const deleteRoom = (roomName: string) => {
    setRooms(rooms.filter(r => r !== roomName));
    showSuccess(isRTL ? "تم حذف القاعة" : "Room deleted");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto order-2 md:order-1">
          <Button variant="outline" className="rounded-xl border-gray-200 gap-2 font-bold text-gray-700">
            <Download size={18} />
            {isRTL ? "تصدير PDF" : "Export PDF"}
          </Button>
          <div className="relative flex-1 md:w-80">
            <Search className={cn("absolute top-1/2 -translate-y-1/2 text-gray-400", isRTL ? "right-3" : "left-3")} size={16} />
            <Input 
              placeholder={isRTL ? "بحث عن قاعة..." : "Search room..."} 
              className={cn("rounded-xl border-gray-200 bg-white h-11", isRTL ? "pr-10 text-right" : "pl-10 text-left")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className={cn("order-1 md:order-2 w-full md:w-auto", isRTL ? "text-right" : "text-left")}>
          <h2 className="text-3xl font-black text-gray-900">
            {isRTL ? "القاعات" : "Rooms"} 
            <span className="text-gray-400 text-xl mx-2">({sortedAndFilteredRooms.length})</span>
          </h2>
        </div>
      </div>

      {isAdmin && (
        <div className="flex gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <Input 
            value={newRoomName} 
            onChange={e => setNewRoomName(e.target.value)}
            placeholder={isRTL ? "اسم القاعة الجديدة..." : "New room name..."}
            className={cn("rounded-xl border-gray-200 h-11", isRTL ? "text-right" : "text-left")}
          />
          <Button onClick={handleAddRoom} className="bg-[#064e3b] hover:bg-[#053a2c] rounded-xl px-6 h-11 font-bold">
            <Plus size={18} className={isRTL ? "ml-2" : "mr-2"} />
            {isRTL ? "إضافة" : "Add"}
          </Button>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        <table className={cn("w-full border-collapse", isRTL ? "text-right" : "text-left")}>
          <thead>
            <tr className="bg-[#f9f9f1]">
              <th 
                className="p-5 text-gray-700 font-bold text-sm border-b border-gray-100 cursor-pointer hover:bg-emerald-50/50 transition-colors"
                onClick={() => handleSort("name")}
              >
                <div className={cn("flex items-center gap-2", isRTL ? "justify-start" : "flex-row-reverse justify-end")}>
                  <SortIcon column="name" />
                  {isRTL ? "اسم القاعة" : "Room Name"}
                </div>
              </th>
              <th className="p-5 text-gray-700 font-bold text-sm border-b border-gray-100 text-center">
                {isRTL ? "إجراءات" : "Actions"}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedAndFilteredRooms.map((room, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 group">
                <td className="p-5">
                  <div className={cn("flex items-center gap-3", isRTL ? "justify-start" : "flex-row-reverse justify-end")}>
                    <span className="font-bold text-emerald-950">{room}</span>
                    <MapPin size={16} className="text-emerald-500" />
                  </div>
                </td>
                <td className="p-5 text-center">
                  <div className="flex justify-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-emerald-700 font-bold gap-2 hover:bg-emerald-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleEditClick(room)}
                    >
                      <Edit2 size={16} />
                      {isRTL ? "تعديل" : "Edit"}
                    </Button>
                    {isAdmin && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => deleteRoom(room)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-emerald-950">
              {isRTL ? "تعديل القاعة" : "Edit Room"}
            </DialogTitle>
          </DialogHeader>
          {editingRoom && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-emerald-800">{isRTL ? "اسم القاعة" : "Room Name"}</label>
                <Input 
                  value={editingRoom.newName} 
                  onChange={e => setEditingRoom({...editingRoom, newName: e.target.value})}
                  className="rounded-xl"
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="rounded-xl">
              {t.cancel}
            </Button>
            <Button onClick={handleUpdateRoom} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl">
              {isRTL ? "حفظ" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Rooms;