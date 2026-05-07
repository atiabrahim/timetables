"use client";

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, BookOpen, Users2, MapPin, Database } from "lucide-react";
import { showSuccess } from "../utils/toast";

const Settings = () => {
  const { 
    t, departments, setDepartments, rooms, setRooms, 
    classes, setClasses, subjects, setSubjects, isRTL 
  } = useApp();
  
  const [newDept, setNewDept] = useState("");
  const [newRoom, setNewRoom] = useState("");
  const [newClass, setNewClass] = useState("");
  const [newSubject, setNewSubject] = useState("");

  const addItem = (val: string, setVal: any, list: any[], setList: any[], msg: string) => {
    if (val && !list.find(i => (i.name || i) === val)) {
      const newItem = typeof list[0] === 'object' ? { id: Math.random().toString(36).substr(2, 9), name: val } : val;
      setList([...list, newItem]);
      setVal("");
      showSuccess(msg);
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-emerald-900">{t.settings}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Classes */}
        <Card className="border-none shadow-lg glass-card">
          <CardHeader className="flex flex-row items-center gap-2">
            <Users2 className="text-emerald-600" size={20} />
            <CardTitle className="text-sm">{isRTL ? "الأفواج التربوية" : "Classes"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input value={newClass} onChange={(e) => setNewClass(e.target.value)} placeholder="..." className="h-9 text-xs" />
              <Button size="sm" onClick={() => addItem(newClass, setNewClass, classes, setClasses, "Class added")}><Plus size={16} /></Button>
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {classes.map(c => (
                <div key={c.id} className="flex items-center justify-between p-2 bg-white/50 rounded-lg text-xs">
                  <span>{c.name}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400" onClick={() => setClasses(classes.filter(i => i.id !== c.id))}><Trash2 size={14} /></Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Subjects */}
        <Card className="border-none shadow-lg glass-card">
          <CardHeader className="flex flex-row items-center gap-2">
            <BookOpen className="text-emerald-600" size={20} />
            <CardTitle className="text-sm">{isRTL ? "المواد الدراسية" : "Subjects"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input value={newSubject} onChange={(e) => setNewSubject(e.target.value)} placeholder="..." className="h-9 text-xs" />
              <Button size="sm" onClick={() => addItem(newSubject, setNewSubject, subjects, setSubjects, "Subject added")}><Plus size={16} /></Button>
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {subjects.map(s => (
                <div key={s.id} className="flex items-center justify-between p-2 bg-white/50 rounded-lg text-xs">
                  <span>{s.name}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400" onClick={() => setSubjects(subjects.filter(i => i.id !== s.id))}><Trash2 size={14} /></Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rooms */}
        <Card className="border-none shadow-lg glass-card">
          <CardHeader className="flex flex-row items-center gap-2">
            <MapPin className="text-emerald-600" size={20} />
            <CardTitle className="text-sm">{isRTL ? "القاعات" : "Rooms"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input value={newRoom} onChange={(e) => setNewRoom(e.target.value)} placeholder="..." className="h-9 text-xs" />
              <Button size="sm" onClick={() => addItem(newRoom, setNewRoom, rooms, setRooms, "Room added")}><Plus size={16} /></Button>
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {rooms.map(r => (
                <div key={r} className="flex items-center justify-between p-2 bg-white/50 rounded-lg text-xs">
                  <span>{r}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400" onClick={() => setRooms(rooms.filter(i => i !== r))}><Trash2 size={14} /></Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Departments */}
        <Card className="border-none shadow-lg glass-card">
          <CardHeader className="flex flex-row items-center gap-2">
            <Database className="text-emerald-600" size={20} />
            <CardTitle className="text-sm">{t.stats.departments}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input value={newDept} onChange={(e) => setNewDept(e.target.value)} placeholder="..." className="h-9 text-xs" />
              <Button size="sm" onClick={() => addItem(newDept, setNewDept, departments, setDepartments, "Dept added")}><Plus size={16} /></Button>
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {departments.map(d => (
                <div key={d} className="flex items-center justify-between p-2 bg-white/50 rounded-lg text-xs">
                  <span>{d}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400" onClick={() => setDepartments(departments.filter(i => i !== d))}><Trash2 size={14} /></Button>
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