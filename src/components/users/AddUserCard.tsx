"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface AddUserCardProps {
  isRTL: boolean;
  newUser: {
    username: string;
    fullName: string;
    email: string;
    role: "Admin" | "Teacher" | "Student";
    observation: string;
  };
  setNewUser: (user: any) => void;
  onAdd: () => void;
}

const AddUserCard = ({ isRTL, newUser, setNewUser, onAdd }: AddUserCardProps) => {
  return (
    <Card className="border-none shadow-xl shadow-emerald-100/20 rounded-3xl overflow-hidden h-fit">
      <CardHeader className="bg-emerald-50/50 border-b border-emerald-100">
        <CardTitle className="text-lg font-bold text-emerald-900 flex items-center gap-2">
          <Plus size={20} />
          {isRTL ? "إضافة مستخدم جديد" : "Add New User"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-emerald-700 uppercase">{isRTL ? "اسم المستخدم" : "Username"}</label>
            <Input 
              value={newUser.username} 
              onChange={(e) => setNewUser({...newUser, username: e.target.value})}
              className="rounded-xl border-emerald-100 h-10"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-emerald-700 uppercase">{isRTL ? "الصلاحية" : "Role"}</label>
            <Select value={newUser.role} onValueChange={(v: any) => setNewUser({...newUser, role: v})}>
              <SelectTrigger className="rounded-xl border-emerald-100 h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">{isRTL ? "مدير" : "Admin"}</SelectItem>
                <SelectItem value="Teacher">{isRTL ? "أستاذ" : "Teacher"}</SelectItem>
                <SelectItem value="Student">{isRTL ? "طالب" : "Student"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-emerald-700 uppercase">{isRTL ? "الاسم الكامل" : "Full Name"}</label>
          <Input 
            value={newUser.fullName} 
            onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
            className="rounded-xl border-emerald-100 h-10"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-emerald-700 uppercase">{isRTL ? "البريد الإلكتروني" : "Email"}</label>
          <Input 
            type="email"
            value={newUser.email} 
            onChange={(e) => setNewUser({...newUser, email: e.target.value})}
            className="rounded-xl border-emerald-100 h-10"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-emerald-700 uppercase">{isRTL ? "ملاحظة" : "Observation"}</label>
          <Input 
            value={newUser.observation} 
            onChange={(e) => setNewUser({...newUser, observation: e.target.value})}
            className="rounded-xl border-emerald-100 h-10"
          />
        </div>
        <Button onClick={onAdd} className="w-full bg-emerald-600 hover:bg-emerald-700 rounded-xl mt-4 h-11">
          {isRTL ? "تأكيد الإضافة" : "Confirm Add"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AddUserCard;