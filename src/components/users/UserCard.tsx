"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, User, Power, PowerOff, Trash2, Mail, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserCardProps {
  u: any;
  isRTL: boolean;
  currentUserId: string;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
}

const UserCard = ({ u, isRTL, currentUserId, onToggleStatus, onDelete }: UserCardProps) => {
  return (
    <Card className={cn(
      "border rounded-3xl transition-all group relative overflow-hidden",
      u.isActive ? "bg-white border-emerald-100 shadow-sm" : "bg-gray-50 border-gray-200 opacity-70"
    )}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm",
              u.role === "Admin" ? "bg-emerald-100 text-emerald-700" : "bg-blue-50 text-blue-600"
            )}>
              {u.role === "Admin" ? <Shield size={24} /> : <User size={24} />}
            </div>
            <div>
              <p className="font-bold text-emerald-950">{u.fullName}</p>
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter">@{u.username} • {u.role}</p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("h-8 w-8 rounded-lg", u.isActive ? "text-emerald-500" : "text-amber-500")}
              onClick={() => onToggleStatus(u.id)}
              title={u.isActive ? (isRTL ? "توقيف" : "Deactivate") : (isRTL ? "تنشيط" : "Activate")}
            >
              {u.isActive ? <Power size={16} /> : <PowerOff size={16} />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50"
              onClick={() => onDelete(u.id)}
              disabled={u.id === currentUserId}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
        
        <div className="space-y-2 border-t border-emerald-50 pt-4">
          <div className="flex items-center gap-2 text-xs text-emerald-600/70">
            <Mail size={12} />
            <span className="truncate">{u.email || "---"}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-600/70">
            <Info size={12} />
            <span className="truncate italic">{u.observation || "---"}</span>
          </div>
        </div>

        {!u.isActive && (
          <div className="absolute inset-0 bg-gray-100/20 backdrop-blur-[1px] rounded-3xl pointer-events-none flex items-center justify-center">
            <span className="bg-gray-800 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
              {isRTL ? "موقوف" : "Inactive"}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserCard;