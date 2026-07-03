"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Plus, 
  Edit2, 
  ArrowUpDown,
  Trash2,
  MapPin,
  ChevronUp,
  ChevronDown,
  Printer,
  Eye,
  X,
  Users,
  Layers
} from "lucide-react";
import { showSuccess } from "../utils/toast";
import { cn } from "@/lib/utils";
import PageHeader from "../components/shared/PageHeader";
import OfficialPrintWrapper from "../components/shared/OfficialPrintWrapper";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Room } from "../types";

type SortConfig = {
  key: "name" | "capacity" | "type" | null;
  direction: "asc" | "desc";
};

const Rooms = () => {
  const { roomsDetailed, setRoomsDetailed, isRTL, user, t } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: "asc" });
  
  const [newRoom, setNewRoom] = useState<Room>({ name: "", capacity: 30, type: "Theory" });
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const isAdmin = user?.role === "Admin";

  const handleSort = (key: SortConfig["key"]) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedAndFilteredRooms = useMemo(() => {
    let items = [...roomsDetailed].filter(r => 
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.type || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortConfig.key !== null) {
      items.sort((a, b) => {
        const aVal = a[sortConfig.key!] || "";
        const bVal = b[sortConfig.key!] || "";
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [roomsDetailed, searchTerm, sortConfig]);

  const SortIcon = ({ column }: { column: SortConfig["key"] }) => {
    if (sortConfig.key !== column) return <ArrowUpDown size={12} className="text-gray-300" />;
    return sortConfig.direction === "asc" ? <ChevronUp size={12} className="text-emerald-600" /> : <ChevronDown size={12} className="text-emerald-600" />;
  };

  const handleAddRoom = () => {
    if (!newRoom.name.trim()) return;
    if (roomsDetailed.some(r => r.name === newRoom.name)) return;
    setRoomsDetailed([...roomsDetailed, newRoom]);
    setNewRoom({ name: "", capacity: 30, type: "Theory" });
    setIsAddDialogOpen(false);
    showSuccess(isRTL ? "تم إضافة القاعة بنجاح" : "Room added successfully");
  };

  const handleEditClick = (room: Room) => {
    setEditingRoom({ ...room });
    setIsEditDialogOpen(true);
  };

  const handleUpdateRoom = () => {
    if (!editingRoom || !editingRoom.name.trim()) return;
    setRoomsDetailed(roomsDetailed.map(r => r.name === editingRoom.name ? editingRoom : r));
    setIsEditDialogOpen(false);
    showSuccess(isRTL ? "تم تحديث القاعة" : "Room updated successfully");
  };

  const deleteRoom = (roomName: string) => {
    setRoomsDetailed(roomsDetailed.filter(r => r.name !== roomName));
    showSuccess(isRTL ? "تم حذف القاعة" : "Room deleted");
  };

  const PrintableTable = () => (
    <table className="w-full border-collapse border-2 border-slate-950 text-sm">
      <thead>
        <tr className="bg-slate-100 border-b-2 border-slate-950">
          <th className="p-2 border-e-2 border-slate-950 text-center font-black w-12">#</th>
          <th className={cn("p-2 border-e-2 border-slate-950 font-black", isRTL ? "text-right" : "text-left")}>{isRTL ? "اسم القاعة / الورشة" : "Room / Workshop Name"}</th>
          <th className="p-2 border-e-2 border-slate-950 text-center font-black w-24">{isRTL ? "السعة" : "Capacity"}</th>
          <th className="p-2 font-black text-center w-32">{isRTL ? "النوع" : "Type"}</th>
        </tr>
      </thead>
      <tbody>
        {sortedAndFilteredRooms.map((room, idx) => (
          <tr key={idx} className="border-b border-slate-950">
            <td className="p-2 border-e border-slate-950 text-center font-bold">{idx + 1}</td>
            <td className="p-2 border-e border-slate-950 font-bold text-slate-900">{room.name}</td>
            <td className="p-2 border-e border-slate-950 text-center">{room.capacity || "---"}</td>
            <td className="p-2 text-center">{room.type || "---"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={isRTL ? "القاعات والورشات" : "Rooms & Workshops"}
        subtitle={isRTL ? "إدارة القاعات الدراسية والورشات التطبيقية مع تحديد السعة" : "Manage classrooms and practical workshops with capacity mapping"}
        icon={MapPin}
        isRTL={isRTL}
      >
        {isAdmin && (
          <Button 
            onClick={() => setIsAddDialogOpen(true)} 
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2 font-bold h-11"
          >
            <Plus size={18} />
            {isRTL ? "إضافة قاعة جديدة" : "Add New Room"}
          </Button>
        )}
        <Button variant="outline" onClick={() => setIsPreviewOpen(true)} className="rounded-xl border-slate-200 gap-2 font-bold text-slate-700 bg-white h-11">
          <Eye size={18} />
          {isRTL ? "معاينة الطباعة" : "Print Preview"}
        </Button>
        <Button onClick={() => window.print()} variant="outline" className="rounded-xl border-slate-200 gap-2 font-bold text-slate-700 bg-white h-11">
          <Printer size={18} />
          {isRTL ? "طباعة القائمة" : "Print List"}
        </Button>
        <div className="relative w-full md:w-64">
          <Search className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400", isRTL ? "right-3" : "left-3")} size={16} />
          <Input 
            placeholder={isRTL ? "بحث عن قاعة..." : "Search room..."} 
            className={cn("rounded-xl border-slate-200 bg-white h-11", isRTL ? "pr-10" : "pl-10")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </PageHeader>

      {/* Table Section */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm print:hidden">
        <table className={cn("w-full border-collapse", isRTL ? "text-right" : "text-left")}>
          <thead>
            <tr className="bg-slate-50">
              <th className={cn("p-4 text-slate-700 font-black text-[10px] uppercase border-b border-slate-200 cursor-pointer", isRTL ? "text-right" : "text-left")} onClick={() => handleSort("name")}>
                <div className="flex items-center gap-2">
                  {isRTL ? "اسم القاعة" : "Room Name"}
                  <SortIcon column="name" />
                </div>
              </th>
              <th className="p-4 text-slate-700 font-black text-[10px] uppercase border-b border-slate-200 text-center w-32 cursor-pointer" onClick={() => handleSort("capacity")}>
                <div className="flex items-center justify-center gap-2">
                  {isRTL ? "السعة القصوى" : "Capacity"}
                  <SortIcon column="capacity" />
                </div>
              </th>
              <th className="p-4 text-slate-700 font-black text-[10px] uppercase border-b border-slate-200 text-center w-40 cursor-pointer" onClick={() => handleSort("type")}>
                <div className="flex items-center justify-center gap-2">
                  {isRTL ? "النوع" : "Type"}
                  <SortIcon column="type" />
                </div>
              </th>
              {isAdmin && (
                <th className="p-4 text-slate-700 font-black text-[10px] uppercase border-b border-slate-200 text-center w-32">
                  {isRTL ? "إجراءات" : "Actions"}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {sortedAndFilteredRooms.map((room, idx) => (
              <tr key={idx} className="hover:bg-emerald-50/30 transition-colors group border-b border-slate-50">
                <td className="p-4">
                  <div className={cn("flex items-center gap-3", isRTL ? "flex-row" : "flex-row-reverse justify-end")}>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <MapPin size={16} />
                    </div>
                    <span className="font-bold text-emerald-950 text-sm">{room.name}</span>
                  </div>
                </td>
                <td className="p-4 text-center">
                  <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-black">
                    <Users size={12} />
                    {room.capacity || "---"}
                  </div>
                </td>
                <td className="p-4 text-center">
                  <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold">
                    <Layers size={12} />
                    {room.type || "Theory"}
                  </div>
                </td>
                {isAdmin && (
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 rounded-xl"
                        onClick={() => handleEditClick(room)}
                      >
                        <Edit2 size={14} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-red-400 hover:bg-red-50 rounded-xl"
                        onClick={() => deleteRoom(room.name)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {sortedAndFilteredRooms.length === 0 && (
          <div className="text-center py-24 bg-slate-50/30">
            <p className="text-slate-400 font-bold">{isRTL ? "لا توجد قاعات مطابقة" : "No matching rooms found"}</p>
          </div>
        )}
      </div>

      {/* Add/Edit Dialogs */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
                  value={newRoom.capacity} 
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
            <Button variant="ghost" onClick={() => setIsAddDialogOpen(false)} className="rounded-xl font-bold">{t.cancel}</Button>
            <Button onClick={handleAddRoom} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 font-black shadow-lg shadow-emerald-100">
              {isRTL ? "إضافة" : "Add Room"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
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
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-emerald-700 uppercase tracking-widest px-1">{isRTL ? "السعة" : "Capacity"}</label>
                  <Input 
                    type="number"
                    value={editingRoom.capacity} 
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
            <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)} className="rounded-xl font-bold">{t.cancel}</Button>
            <Button onClick={handleUpdateRoom} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 font-black shadow-lg shadow-emerald-100">
              {isRTL ? "حفظ التغييرات" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Print Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-[95vw] w-full max-h-[95vh] overflow-hidden rounded-[2.5rem] p-0 border-none bg-emerald-50/30 flex flex-col">
          <div className="bg-white p-6 border-b border-emerald-100 flex items-center justify-between sticky top-0 z-10 shrink-0 print:hidden">
            <div className="flex items-center gap-3">
              <Printer className="text-emerald-600" />
              <h3 className="font-black text-emerald-900">{isRTL ? "معاينة طباعة قائمة القاعات" : "Rooms List Print Preview"}</h3>
            </div>
            <Button variant="ghost" onClick={() => setIsPreviewOpen(false)} className="text-slate-500"><X size={20} /></Button>
          </div>
          <div className="flex-1 overflow-y-auto p-8 flex justify-center bg-zinc-950/10 print:bg-white print:p-0">
            <div className="w-[210mm] min-h-[297mm]">
              <OfficialPrintWrapper
                title={isRTL ? "قائمة القاعات والورشات" : "Rooms & Workshops List"}
                subtitle={
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                    <span>{isRTL ? `إجمالي القاعات: ${roomsDetailed.length}` : `Total Rooms: ${roomsDetailed.length}`}</span>
                  </div>
                }
              >
                <PrintableTable />
              </OfficialPrintWrapper>
            </div>
          </div>
          <DialogFooter className="bg-white p-6 border-t border-emerald-100 shrink-0 print:hidden">
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)} className="rounded-xl px-8 h-12 font-bold">{t.cancel}</Button>
            <Button onClick={() => window.print()} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl px-12 h-12 font-black shadow-lg shadow-emerald-100 text-white">
              <Printer size={20} className="mr-2" /> {t.print}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Rooms;