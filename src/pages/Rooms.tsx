"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, Plus, Printer, Eye, X
} from "lucide-react";
import { showSuccess } from "../utils/toast";
import { cn } from "@/lib/utils";
import PageHeader from "../components/shared/PageHeader";
import OfficialPrintWrapper from "../components/shared/OfficialPrintWrapper";
import RoomTable from "../components/rooms/RoomTable";
import AddRoomDialog from "../components/rooms/AddRoomDialog";
import EditRoomDialog from "../components/rooms/EditRoomDialog";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
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
        icon={Plus}
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

      {/* Room Table */}
      <RoomTable 
        roomsDetailed={sortedAndFilteredRooms}
        isRTL={isRTL}
        isAdmin={isAdmin}
        onEdit={handleEditClick}
        onDelete={deleteRoom}
        sortConfig={sortConfig}
        onSort={handleSort}
      />

      {/* Print Content Master */}
      <div className="print-content-master hidden print:block">
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

      {/* Add Dialog */}
      <AddRoomDialog 
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        isRTL={isRTL}
        newRoom={newRoom}
        setNewRoom={setNewRoom}
        onAdd={handleAddRoom}
        cancelText={t.cancel}
      />

      {/* Edit Dialog */}
      <EditRoomDialog 
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        isRTL={isRTL}
        editingRoom={editingRoom}
        setEditingRoom={setEditingRoom}
        onSave={handleUpdateRoom}
        cancelText={t.cancel}
      />

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