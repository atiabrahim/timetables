"use client";

import React, { useState, useRef } from "react";
import { useApp } from "../context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Download, Upload, Database, MapPin } from "lucide-react";
import { showSuccess, showError } from "../utils/toast";
import { exportToXml, parseXml } from "../lib/export-utils";

const Settings = () => {
  const { 
    t, 
    departments, 
    setDepartments, 
    rooms,
    setRooms,
    periodConfigs, 
    setPeriodConfigs, 
    employees, 
    setEmployees, 
    assignments, 
    setAssignments,
    isRTL 
  } = useApp();
  
  const [newDept, setNewDept] = useState("");
  const [newRoom, setNewRoom] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addDept = () => {
    if (newDept && !departments.includes(newDept)) {
      setDepartments([...departments, newDept]);
      setNewDept("");
      showSuccess(isRTL ? "تمت إضافة المصلحة" : "Department added");
    }
  };

  const addRoom = () => {
    if (newRoom && !rooms.includes(newRoom)) {
      setRooms([...rooms, newRoom]);
      setNewRoom("");
      showSuccess(isRTL ? "تمت إضافة القاعة" : "Room added");
    }
  };

  const removeDept = (dept: string) => {
    setDepartments(departments.filter(d => d !== dept));
  };

  const removeRoom = (room: string) => {
    setRooms(rooms.filter(r => r !== room));
  };

  const togglePeriod = (day: number, period: string) => {
    setPeriodConfigs(periodConfigs.map(c => 
      (c.day === day && c.period === period) ? { ...c, isActive: !c.isActive } : c
    ));
  };

  const handleExportXml = () => {
    const data = { employees, departments, rooms, periodConfigs, assignments };
    exportToXml(data, `scheduler_backup_${new Date().toISOString().split('T')[0]}`);
    showSuccess(isRTL ? "تم تصدير البيانات بنجاح" : "Data exported successfully");
  };

  const handleImportXml = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = parseXml(text);
        
        setEmployees(data.employees);
        setDepartments(data.departments);
        if (data.rooms) setRooms(data.rooms);
        setPeriodConfigs(data.periodConfigs);
        setAssignments(data.assignments);
        
        showSuccess(isRTL ? "تم استيراد البيانات بنجاح" : "Data imported successfully");
      } catch (err) {
        showError(isRTL ? "فشل استيراد الملف. تأكد من صيغة XML" : "Failed to import file. Check XML format");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-emerald-900">{t.settings}</h2>
        
        <div className="flex gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImportXml} 
            accept=".xml" 
            className="hidden" 
          />
          <Button 
            variant="outline" 
            className="border-emerald-200 text-emerald-700 rounded-xl"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={18} className={isRTL ? "ml-2" : "mr-2"} />
            {isRTL ? "استيراد XML" : "Import XML"}
          </Button>
          <Button 
            className="bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-100"
            onClick={handleExportXml}
          >
            <Download size={18} className={isRTL ? "ml-2" : "mr-2"} />
            {isRTL ? "تصدير XML" : "Export XML"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Departments Management */}
        <Card className="border-none shadow-lg glass-card">
          <CardHeader className="flex flex-row items-center gap-2">
            <Database className="text-emerald-600" size={20} />
            <CardTitle className="text-emerald-800">{t.stats.departments}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input 
                value={newDept} 
                onChange={(e) => setNewDept(e.target.value)} 
                placeholder={isRTL ? "مصلحة جديدة" : "New Dept"}
                className="border-emerald-100 focus:ring-emerald-500"
              />
              <Button onClick={addDept} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus size={18} />
              </Button>
            </div>
            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
              {departments.map(dept => (
                <div key={dept} className="flex items-center justify-between p-3 bg-white/50 border border-emerald-50 rounded-xl">
                  <span className="font-medium text-emerald-900 text-sm">{dept}</span>
                  <Button variant="ghost" size="icon" onClick={() => removeDept(dept)} className="text-red-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rooms Management */}
        <Card className="border-none shadow-lg glass-card">
          <CardHeader className="flex flex-row items-center gap-2">
            <MapPin className="text-emerald-600" size={20} />
            <CardTitle className="text-emerald-800">{isRTL ? "القاعات" : "Rooms"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input 
                value={newRoom} 
                onChange={(e) => setNewRoom(e.target.value)} 
                placeholder={isRTL ? "قاعة جديدة" : "New Room"}
                className="border-emerald-100 focus:ring-emerald-500"
              />
              <Button onClick={addRoom} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus size={18} />
              </Button>
            </div>
            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
              {rooms.map(room => (
                <div key={room} className="flex items-center justify-between p-3 bg-white/50 border border-emerald-50 rounded-xl">
                  <span className="font-medium text-emerald-900 text-sm">{room}</span>
                  <Button variant="ghost" size="icon" onClick={() => removeRoom(room)} className="text-red-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Period Configuration */}
        <Card className="border-none shadow-lg glass-card">
          <CardHeader className="flex flex-row items-center gap-2">
            <Database className="text-emerald-600" size={20} />
            <CardTitle className="text-emerald-800">{isRTL ? "الفترات" : "Periods"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
              {t.days.map((day: string, idx: number) => (
                <div key={day} className="space-y-2 p-2 bg-white/30 rounded-xl border border-emerald-50/50">
                  <h4 className="font-bold text-emerald-700 text-xs">{day}</h4>
                  <div className="flex gap-4">
                    {["Morning", "Afternoon"].map(p => {
                      const config = periodConfigs.find(c => c.day === idx && c.period === p);
                      return (
                        <div key={p} className="flex items-center space-x-2 rtl:space-x-reverse">
                          <Switch 
                            id={`${idx}-${p}`} 
                            checked={config?.isActive} 
                            onCheckedChange={() => togglePeriod(idx, p)}
                            className="scale-75 data-[state=checked]:bg-emerald-600"
                          />
                          <Label htmlFor={`${idx}-${p}`} className="text-[10px] font-medium text-emerald-800">
                            {t[p.toLowerCase() as keyof typeof t]}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;