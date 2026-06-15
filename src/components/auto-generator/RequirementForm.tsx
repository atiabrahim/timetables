"use client";

import React from "react";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface RequirementFormProps {
  isRTL: boolean;
  employees: any[];
  subjects: any[];
  classes: any[];
  rooms: string[];
  newReq: {
    employeeId: string;
    subjectId: string;
    classId: string;
    room: string;
    count: number;
  };
  setNewReq: (req: any) => void;
  onAdd: () => void;
}

const RequirementForm = ({
  isRTL,
  employees,
  subjects,
  classes,
  rooms,
  newReq,
  setNewReq,
  onAdd
}: RequirementFormProps) => {
  return (
    <Card className="border-none shadow-xl shadow-emerald-100/20 rounded-3xl overflow-hidden bg-white">
      <CardHeader className="bg-emerald-50/30 border-b border-emerald-100">
        <CardTitle className="text-lg font-bold text-emerald-900 flex items-center gap-2">
          <Plus size={20} className="text-emerald-600" />
          {isRTL ? "إضافة متطلب تدريس (حصة أسبوعية)" : "Add Teaching Requirement"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-emerald-700 uppercase">{isRTL ? "الأستاذ" : "Teacher"}</label>
            <Select value={newReq.employeeId} onValueChange={v => setNewReq({...newReq, employeeId: v})}>
              <SelectTrigger className="rounded-xl border-emerald-100 h-10">
                <SelectValue placeholder={isRTL ? "اختر الأستاذ..." : "Select..."} />
              </SelectTrigger>
              <SelectContent>
                {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.lastName} {e.firstName}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-emerald-700 uppercase">{isRTL ? "المادة" : "Subject"}</label>
            <Select value={newReq.subjectId} onValueChange={v => setNewReq({...newReq, subjectId: v})}>
              <SelectTrigger className="rounded-xl border-emerald-100 h-10">
                <SelectValue placeholder={isRTL ? "اختر المادة..." : "Select..."} />
              </SelectTrigger>
              <SelectContent>
                {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-emerald-700 uppercase">{isRTL ? "الفوج" : "Class"}</label>
            <Select value={newReq.classId} onValueChange={v => setNewReq({...newReq, classId: v})}>
              <SelectTrigger className="rounded-xl border-emerald-100 h-10">
                <SelectValue placeholder={isRTL ? "اختر الفوج..." : "Select..."} />
              </SelectTrigger>
              <SelectContent>
                {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-emerald-700 uppercase">{isRTL ? "القاعة" : "Room"}</label>
            <Select value={newReq.room} onValueChange={v => setNewReq({...newReq, room: v})}>
              <SelectTrigger className="rounded-xl border-emerald-100 h-10">
                <SelectValue placeholder={isRTL ? "اختياري..." : "Optional..."} />
              </SelectTrigger>
              <SelectContent>
                {rooms.map((r, idx) => <SelectItem key={idx} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-emerald-700 uppercase">{isRTL ? "الحصص أسبوعياً" : "Weekly Hours"}</label>
            <div className="flex gap-2">
              <Input 
                type="number" 
                min={1} 
                max={10} 
                value={newReq.count} 
                onChange={e => setNewReq({...newReq, count: parseInt(e.target.value) || 1})}
                className="rounded-xl border-emerald-100 h-10 w-20 text-center font-bold"
              />
              <Button onClick={onAdd} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl h-10 flex-1 font-bold">
                {isRTL ? "إضافة" : "Add"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RequirementForm;