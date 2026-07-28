"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { 
  Printer, 
  CheckCircle2, 
  Users, 
  GraduationCap, 
  Search, 
  Layout, 
  Filter,
  ArrowRight,
  Eye,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import PageHeader from "../components/shared/PageHeader";
import OfficialPrintWrapper from "../components/shared/OfficialPrintWrapper";
import ScheduleTable from "../components/schedule/ScheduleTable";
import { DAYS, PERIODS } from "../constants/schedule";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const PrintingCenter = () => {
  const { 
    isRTL, t, employees, classes, subjects, assignments, periodTimings 
  } = useApp();

  const [mode, setViewMode] = useState<"class" | "teacher">("class");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [orientation, setOrientation] = useState<"landscape" | "portrait">("landscape");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const filteredItems = useMemo(() => {
    if (mode === "class") {
      return classes.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return employees.filter(e => `${e.firstName} ${e.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [mode, classes, employees, searchTerm]);

  const toggleAll = () => {
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map(item => item.id));
    }
  };

  const toggleItem = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const getEntityAssignments = (id: string) => {
    return assignments.filter(a => mode === "class" ? a.classId === id : a.employeeId === id);
  };

  const getSummaryData = (entityAssignments: any[]) => {
    const data: any[] = [];
    entityAssignments.forEach(asgn => {
      const sub = subjects.find(s => s.id === asgn.subjectId)?.name || "---";
      const existing = data.find(d => d.subject === sub);
      if (existing) existing.count++; else data.push({ subject: sub, count: 1 });
    });
    return data;
  };

  const timeSlots = useMemo(() => PERIODS.map(id => ({ 
    id, label: isRTL ? `ح${id}` : id, isBreak: false, time: periodTimings[id] || "", 
    en: id // Legacy field needed by ScheduleTable sometimes
  })), [isRTL, periodTimings]);

  const PrintBatch = () => (
    <div className="flex flex-col gap-0 w-full items-center">
      {selectedIds.map((id, idx) => {
        const item = mode === "class" ? classes.find(c => c.id === id) : employees.find(e => e.id === id);
        if (!item) return null;

        const entityName = mode === "teacher" ? `${item.lastName} ${item.firstName}` : item.name;
        const entityAssignments = getEntityAssignments(id);
        const summary = getSummaryData(entityAssignments);

        const metadata = (
          <>
            <div className="flex items-center gap-2">
              <span className="opacity-60">{isRTL ? "الجهة:" : "Entity:"}</span>
              <span className="font-black">{mode === "class" ? (isRTL ? "قسم / فوج" : "Class") : (isRTL ? "أستاذ(ة)" : "Teacher")}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="opacity-60">{isRTL ? "رمز المرجع:" : "Ref:"}</span>
              <span className="font-black">{mode === "class" ? (item.code || "---") : item.id}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="opacity-60">{isRTL ? "تاريخ الطباعة:" : "Print Date:"}</span>
              <span className="font-black">{new Date().toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}</span>
            </div>
          </>
        );

        return (
          <OfficialPrintWrapper
            key={id}
            title={isRTL ? "الجدول الزمني الأسبوعي" : "Weekly Schedule"}
            subtitle={isRTL ? `المعني: ${entityName}` : `Target: ${entityName}`}
            metadata={metadata}
            orientation={orientation}
            disablePageBreak={false} // Ensure page break after each
          >
            <ScheduleTable 
              isRTL={isRTL} 
              days={DAYS} 
              timeSlots={timeSlots} 
              getAssignment={(d, p) => entityAssignments.find(a => a.day === d && a.period === p)} 
              onAddClick={() => {}} 
              onDeleteClick={() => {}} 
              subjects={subjects} 
              employees={employees} 
              classes={classes} 
              viewMode={mode} 
              isPrint={true} 
              summaryData={summary} 
              totalHours={entityAssignments.length} 
              isTransposed={false}
            />
          </OfficialPrintWrapper>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      <PageHeader
        title={isRTL ? "مركز الطباعة المكثفة" : "Printing Center"}
        subtitle={isRTL ? "طباعة جداول فردية لكافة الفروع أو الأساتذة دفعة واحدة" : "Batch print individual schedules for all classes or teachers"}
        icon={Printer}
        isRTL={isRTL}
      >
        <Button 
          variant="outline" 
          onClick={() => setIsPreviewOpen(true)} 
          disabled={selectedIds.length === 0}
          className="rounded-xl border-emerald-200 text-emerald-700 bg-white h-11 gap-2"
        >
          <Eye size={18} />
          {t.preview} ({selectedIds.length})
        </Button>
        <Button 
          onClick={() => window.print()} 
          disabled={selectedIds.length === 0}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2 font-black px-8 h-11 shadow-lg shadow-emerald-100"
        >
          <Printer size={18} />
          {isRTL ? "طباعة الدفعة المختارة" : "Print Selected Batch"}
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Sidebar: Controls */}
        <div className="space-y-6">
          <Card className="border-none shadow-xl shadow-emerald-100/20 rounded-[2rem] overflow-hidden bg-white">
            <CardHeader className="bg-emerald-50/50 border-b border-emerald-100">
              <CardTitle className="text-sm font-black text-emerald-900 flex items-center gap-2">
                <Filter size={16} className="text-emerald-600" />
                {isRTL ? "خيارات الطباعة" : "Printing Options"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest px-1">{isRTL ? "نوع الجدول" : "Schedule Type"}</label>
                <div className="flex p-1 bg-emerald-50/50 rounded-xl border border-emerald-100">
                  <Button 
                    variant={mode === "class" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => { setViewMode("class"); setSelectedIds([]); }}
                    className={cn("flex-1 rounded-lg h-9 font-bold", mode === "class" ? "bg-emerald-600 shadow-md" : "text-emerald-800")}
                  >
                    <GraduationCap size={14} className="mr-2" /> {isRTL ? "فروع" : "Classes"}
                  </Button>
                  <Button 
                    variant={mode === "teacher" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => { setViewMode("teacher"); setSelectedIds([]); }}
                    className={cn("flex-1 rounded-lg h-9 font-bold", mode === "teacher" ? "bg-emerald-600 shadow-md" : "text-emerald-800")}
                  >
                    <Users size={14} className="mr-2" /> {isRTL ? "أساتذة" : "Teachers"}
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest px-1">{isRTL ? "اتجاه الورقة" : "Page Orientation"}</label>
                <Select value={orientation} onValueChange={(v: any) => setOrientation(v)}>
                  <SelectTrigger className="rounded-xl border-emerald-100 h-10 font-bold text-xs">
                    <Layout size={14} className="mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portrait">{t.portrait}</SelectItem>
                    <SelectItem value="landscape">{t.landscape}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 border-t border-emerald-50">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase">{isRTL ? "الاختيار السريع" : "Quick Select"}</span>
                  <Button variant="link" size="sm" onClick={toggleAll} className="h-auto p-0 text-[10px] font-black text-emerald-600 uppercase">
                    {selectedIds.length === filteredItems.length ? (isRTL ? "إلغاء الجميع" : "Deselect All") : (isRTL ? "تحديد الجميع" : "Select All")}
                  </Button>
                </div>
                <div className="relative">
                  <Search className={cn("absolute top-1/2 -translate-y-1/2 text-gray-400", isRTL ? "right-3" : "left-3")} size={14} />
                  <Input 
                    placeholder={isRTL ? "بحث..." : "Search..."} 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={cn("h-10 rounded-xl border-emerald-100 bg-gray-50/50 text-xs", isRTL ? "pr-10" : "pl-10")} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main: Items Grid */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map(item => {
              const isSelected = selectedIds.includes(item.id);
              const asgnCount = getEntityAssignments(item.id).length;

              return (
                <div 
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={cn(
                    "relative p-4 rounded-3xl border-2 transition-all cursor-pointer group",
                    isSelected 
                      ? "bg-emerald-50 border-emerald-500 shadow-md shadow-emerald-100" 
                      : "bg-white border-slate-100 hover:border-emerald-200"
                  )}
                >
                  <div className="flex flex-col gap-2">
                    <div className={cn(
                      "w-10 h-10 rounded-2xl flex items-center justify-center transition-colors",
                      isSelected ? "bg-emerald-600 text-white" : "bg-slate-50 text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600"
                    )}>
                      {mode === "class" ? <GraduationCap size={20} /> : <Users size={20} />}
                    </div>
                    <div className="min-w-0">
                      <p className={cn("font-black text-xs truncate", isSelected ? "text-emerald-950" : "text-slate-800")}>
                        {mode === "class" ? item.name : `${item.lastName} ${item.firstName}`}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 truncate">
                        {asgnCount} {isRTL ? "حصة مبرمجة" : "Lessons"}
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="absolute top-4 right-4 text-emerald-600">
                      <CheckCircle2 size={16} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="py-32 text-center text-slate-300 font-bold uppercase tracking-widest text-xs italic">
              {isRTL ? "لا يوجد نتائج مطابقة للبحث" : "No matching items found"}
            </div>
          )}
        </div>
      </div>

      {/* Actual Hidden Printing Container */}
      <div className="print-content-master hidden print:block">
        <PrintBatch />
      </div>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-[98vw] w-full h-[95vh] p-0 bg-zinc-900/95 border-none rounded-none flex flex-col z-[9999] print:bg-white print:h-auto print:block">
          <div className="h-14 bg-black/40 border-b border-white/10 flex items-center justify-between px-6 shrink-0 print:hidden">
            <div className="flex items-center gap-2 text-white">
              <Eye className="text-emerald-500" size={16} />
              <h3 className="font-black text-sm">{isRTL ? "معاينة دفعة الطباعة" : "Batch Print Preview"}</h3>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => window.print()} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black px-8 h-9 text-xs">
                <Printer size={14} className="mr-2" />
                {t.print} ({selectedIds.length})
              </Button>
              <Button variant="ghost" onClick={() => setIsPreviewOpen(false)} className="text-white/50 hover:text-white"><X size={20} /></Button>
            </div>
          </div>
          <div className="flex-1 overflow-auto bg-zinc-950/50 print:bg-white p-8 print:p-0">
             <div className="max-w-fit mx-auto shadow-2xl">
               <PrintBatch />
             </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PrintingCenter;