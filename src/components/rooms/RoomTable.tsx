"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, MapPin, Users, Layers, ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import ResizableHeader from "../shared/ResizableHeader";
import { Room } from "../../types";

type SortConfig = {
  key: "name" | "capacity" | "type" | null;
  direction: "asc" | "desc";
};

interface RoomTableProps {
  roomsDetailed: Room[];
  isRTL: boolean;
  isAdmin: boolean;
  onEdit: (room: Room) => void;
  onDelete: (name: string) => void;
  sortConfig: SortConfig;
  onSort: (key: SortConfig["key"]) => void;
}

const RoomTable = ({
  roomsDetailed,
  isRTL,
  isAdmin,
  onEdit,
  onDelete,
  sortConfig,
  onSort
}: RoomTableProps) => {
  const [widths, setWidths] = useState({
    name: 250,
    capacity: 150,
    type: 150,
    actions: 120
  });

  const updateWidth = (column: keyof typeof widths, newWidth: number) => {
    setWidths(prev => ({ ...prev, [column]: newWidth }));
  };

  const SortIcon = ({ column }: { column: SortConfig["key"] }) => {
    if (sortConfig.key !== column) return <ArrowUpDown size={12} className="text-slate-300" />;
    return sortConfig.direction === "asc" ? <ChevronUp size={12} className="text-emerald-600" /> : <ChevronDown size={12} className="text-emerald-600" />;
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm print:hidden">
      <div className="overflow-x-auto">
        <table className={cn("w-full border-collapse table-fixed", isRTL ? "text-right" : "text-left")}>
          <thead>
            <tr className="bg-slate-50">
              <ResizableHeader 
                width={widths.name} 
                onResize={(w) => updateWidth("name", w)} 
                isRTL={isRTL}
                className={cn("p-4 text-slate-700 font-black text-[10px] uppercase border-b border-slate-200 cursor-pointer", isRTL ? "text-right" : "text-left")} 
                onClick={() => onSort("name")}
              >
                <div className="flex items-center gap-2">
                  {isRTL ? "اسم القاعة" : "Room Name"} <SortIcon column="name" />
                </div>
              </ResizableHeader>
              
              <ResizableHeader 
                width={widths.capacity} 
                onResize={(w) => updateWidth("capacity", w)} 
                isRTL={isRTL}
                className="p-4 text-slate-700 font-black text-[10px] uppercase border-b border-slate-200 text-center cursor-pointer" 
                onClick={() => onSort("capacity")}
              >
                <div className="flex items-center justify-center gap-2">
                  {isRTL ? "السعة القصوى" : "Capacity"} <SortIcon column="capacity" />
                </div>
              </ResizableHeader>
              
              <ResizableHeader 
                width={widths.type} 
                onResize={(w) => updateWidth("type", w)} 
                isRTL={isRTL}
                className="p-4 text-slate-700 font-black text-[10px] uppercase border-b border-slate-200 text-center cursor-pointer" 
                onClick={() => onSort("type")}
              >
                <div className="flex items-center justify-center gap-2">
                  {isRTL ? "النوع" : "Type"} <SortIcon column="type" />
                </div>
              </ResizableHeader>
              
              {isAdmin && (
                <ResizableHeader 
                  width={widths.actions} 
                  onResize={(w) => updateWidth("actions", w)} 
                  isRTL={isRTL}
                  className="p-4 text-slate-700 font-black text-[10px] uppercase border-b border-slate-200 text-center"
                >
                  {isRTL ? "إجراءات" : "Actions"}
                </ResizableHeader>
              )}
            </tr>
          </thead>
          <tbody>
            {roomsDetailed.map((room, idx) => (
              <tr key={idx} className="hover:bg-emerald-50/30 transition-colors group border-b border-slate-50">
                <td className="p-4 overflow-hidden">
                  <div className={cn("flex items-center gap-3", isRTL ? "flex-row" : "flex-row-reverse justify-end")}>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <MapPin size={16} />
                    </div>
                    <span className="font-bold text-emerald-950 text-sm truncate">{room.name}</span>
                  </div>
                </td>
                <td className="p-4 text-center overflow-hidden">
                  <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-black truncate max-w-full">
                    <Users size={12} />
                    {room.capacity || "---"}
                  </div>
                </td>
                <td className="p-4 text-center overflow-hidden">
                  <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold truncate max-w-full">
                    <Layers size={12} />
                    {room.type || "Theory"}
                  </div>
                </td>
                {isAdmin && (
                  <td className="p-4 text-center overflow-hidden">
                    <div className="flex justify-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 rounded-xl"
                        onClick={() => onEdit(room)}
                      >
                        <Edit2 size={14} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-red-400 hover:bg-red-50 rounded-xl"
                        onClick={() => onDelete(room.name)}
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
      </div>
    </div>
  );
};

export default RoomTable;