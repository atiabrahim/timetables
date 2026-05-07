"use client";

import React, { useState, useRef } from "react";
import { useApp } from "../context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Download, Upload, Database } from "lucide-react";
import { showSuccess, showError } from "../utils/toast";
import { exportToXml, parseXml } from "../lib/export-utils";

const Settings = () => {
  const { 
    t, 
    departments, 
    setDepartments, 
    periodConfigs, 
    setPeriodConfigs, 
    employees, 
    setEmployees, 
    assignments, 
    setAssignments,
    isRTL 
  } = useApp();
  
  const [newDept, setNewDept] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addDept = () => {
    if (newDept && !departments.includes(newDept)) {
      setDepartments([...departments, newDept]);
      setNewDept("");
      showSuccess(isRTL ? "تمت إضافة المصلحة" : "Department added");
    }
  };

  const removeDept = (dept: string) => {
    setDepartments(departments.filter(d => d !== dept));
  };

  const togglePeriod = (day: number, period: string) => {
    setPeriodConfigs(periodConfigs.map(c => 
      (c.day === day && c.period === period) ? { ...c, isActive: !c.isActive } : c
    ));
  };

  const handleExportXml = () => {
    const data = { employees, departments, periodConfigs, assignments };
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                placeholder={isRTL ? "اسم المصلحة الجديدة" : "New Department Name"}
                className="border-emerald-100 focus:ring-emerald-500"
              />
              <Button onClick={addDept} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus size={18} />
              </Button>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {departments.map(dept => (
                <div key={dept} className="flex items-center justify-between p-3 bg-white/50 border border-emerald-50 rounded-xl hover:border-emerald-200 transition-colors">
                  <span className="font-medium text-emerald-900">{dept}</span>
                  <Button variant="ghost" size="icon" onClick={() => removeDept(dept)} className="text-red-400 hover:text-red-600 hover:bg-red-50">
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
            <CardTitle className="text-emerald-800">{isRTL ? "تهيئة الفترات النشطة" : "Active Periods Configuration"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
              {t.days.map((day: string, idx: number) => (
                <div key={day} className="space-y-3 p-3 bg-white/30 rounded-2xl border border-emerald-50/50">
                  <h4 className="font-bold text-emerald-700 text-sm border-b border-emerald-100 pb-1">{day}</h4>
                  <div className="flex gap-6">
                    {["Morning", "Afternoon"].map(p => {
                      const config = periodConfigs.find(c => c.day === idx && c.period === p);
                      return (
                        <div key={p} className="flex items-center space-x-2 rtl:space-x-reverse">
                          <Switch 
                            id={`${idx}-${p}`} 
                            checked={config?.isActive} 
                            onCheckedChange={() => togglePeriod(idx, p)}
                            className="data-[state=checked]:bg-emerald-600"
                          />
                          <Label htmlFor={`${idx}-${p}`} className="text-xs font-medium text-emerald-800 cursor-pointer">
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