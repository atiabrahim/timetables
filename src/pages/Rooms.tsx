"use client";

import React, { useState } from "react";
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
  MapPin
} from "lucide-react";
import { showSuccess } from "../utils/toast";

const Rooms = () => {
  const { rooms, setRooms, isRTL, user } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [newRoomName, setNewRoomName] = useState("");

  const isAdmin = user?.role === "Admin";

  const filteredRooms = rooms.filter(r => 
    r.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddRoom = () => {
    if (!newRoomName.trim()) return;
    if (rooms.includes(newRoomName)) return;
    setRooms([...rooms, newRoomName]);
    setNewRoomName("");
    showSuccess(isRTL ? "تم إضافة القاعة بنجاح" : "Room added successfully");
  };

  const deleteRoom = (roomName: string) => {
    setRooms(rooms.filter(r => r !== roomName));
    showSuccess(isRTL ? "تم حذف القاعة" : "Room deleted");
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto order-2 md:order-1">
          <Button variant="outline" className="rounded-xl border-gray-200 gap-2 font-bold text-gray-700">
            <Download size={18} />
            {isRTL ? "تصدير PDF" : "Export PDF"}
          </Button>
          <div className="relative flex-1 md:w-80">
            <Input 
              placeholder={isRTL ? "بحث عن قاعة..." : "Search room..."} 
              className="rounded-xl border-gray-200 bg-white h-11 text-right"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="text-right order-1 md:order-2 w-full md:w-auto">
          <h2 className="text-3xl font-black text-gray-900">
            {isRTL ? "القاعات" : "Rooms"} 
            <span className="text-gray-400 text-xl mr-2">({rooms.length})</span>
          </h2>
        </div>
      </div>

      {/* Add Section (Admin Only) */}
      {isAdmin && (
        <div className="flex gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <Input 
            value={newRoomName} 
            onChange={e => setNewRoomName(e.target.value)}
            placeholder={isRTL ? "اسم القاعة الجديدة..." : "New room name..."}
            className="rounded-xl border-gray-200 h-11"
          />
          <Button onClick={handleAddRoom} className="bg-[#064e3b] hover:bg-[#053a2c] rounded-xl px-6 h-11 font-bold">
            <Plus size={18} className={isRTL ? "ml-2" : "mr-2"} />
            {isRTL ? "إضافة" : "Add"}
          </Button>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full border-collapse text-right">
          <thead>
            <tr className="bg-[#f9f9f1]">
              <th className="p-4 text-gray-700 font-bold text-sm border-b border-gray-100">
                <div className="flex items-center justify-end gap-2">
                  <ArrowUpDown size={14} className="text-gray-400" />
                  {isRTL ? "اسم القاعة" : "Room Name"}
                </div>
              </th>
              <th className="p-4 text-gray-700 font-bold text-sm border-b border-gray-100 text-center">
                {isRTL ? "إجراءات" : "Actions"}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredRooms.map((room, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                <td className="p-4 font-bold text-gray-900 flex items-center justify-end gap-3">
                  {room}
                  <MapPin size={16} className="text-gray-400" />
                </td>
                <td className="p-4 text-center flex justify-center gap-2">
                  <Button variant="ghost" size="sm" className="text-gray-700 font-bold gap-2 hover:bg-gray-100 rounded-lg">
                    <Edit2 size={16} />
                  </Button>
                  {isAdmin && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500 hover:bg-red-50 rounded-lg"
                      onClick={() => deleteRoom(room)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredRooms.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 font-bold">{isRTL ? "لا توجد قاعات مطابقة" : "No matching rooms found"}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rooms;