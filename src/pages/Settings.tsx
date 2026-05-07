import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Save } from "lucide-react";
import { showSuccess } from "../utils/toast";

const Settings = () => {
  const { t, departments, setDepartments, periodConfigs, setPeriodConfigs, isRTL } = useApp();
  const [newDept, setNewDept] = useState("");

  const addDept = () => {
    if (newDept && !departments.includes(newDept)) {
      setDepartments([...departments, newDept]);
      setNewDept("");
      showSuccess("Department added");
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

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-emerald-900">{t.settings}</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Departments Management */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-emerald-800">{t.stats.departments}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input 
                value={newDept} 
                onChange={(e) => setNewDept(e.target.value)} 
                placeholder="New Department Name"
                className="border-emerald-100"
              />
              <Button onClick={addDept} className="bg-emerald-600">
                <Plus size={18} />
              </Button>
            </div>
            <div className="space-y-2">
              {departments.map(dept => (
                <div key={dept} className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
                  <span className="font-medium text-emerald-900">{dept}</span>
                  <Button variant="ghost" size="icon" onClick={() => removeDept(dept)} className="text-red-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Period Configuration */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-emerald-800">Active Periods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {t.days.map((day: string, idx: number) => (
                <div key={day} className="space-y-3">
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
                          />
                          <Label htmlFor={`${idx}-${p}`} className="text-xs font-medium">
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