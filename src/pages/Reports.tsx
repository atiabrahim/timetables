"use client";

import React, { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import { Button } from "@/components/ui/button";
import { Printer, Eye, X, RotateCw } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import TeacherLoadChart from "../components/reports/TeacherLoadChart";
import RoomUsageChart from "../components/reports/RoomUsageChart";
import OfficialPrintWrapper from "../components/shared/OfficialPrintWrapper";
import ExportButton from "@/components/ExportButton";
import PageHeader from "../components/shared/PageHeader";
import { DAYS, PERIODS } from "../constants/schedule";

const Reports = () => {
  const {     employees, 
    assignments,     classes, 
    rooms,     isRTL, 
    t 
  } = useApp();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [doubleMode, setDoubleMode] = useState(false);

  // ... existing logic unchanged ...

  return (
    <div className="space-y-8 pb-20">
      <PageHeader
        title={t.reports_page.title}
        subtitle={t.reports_page.subtitle}
        icon={BarChart3}
        isRTL={isRTL}
      >
        {/* Add Export button next to preview/print buttons */}
        <ExportButton
          label={isRTL ? "تصدير" : "Export"}
          onClick={() => window.print()}
          isRTL={isRTL}
        />
        <Button variant="outline" onClick={() => setIsPreviewOpen(true)} className="rounded-xl border-emerald-200 text-emerald-700 gap-2 font-bold text-slate-700 bg-white">
          <Eye size={18} />
          {isRTL ? "معاينة الطباعة" : "Print Preview"}
        </Button>
        <Button onClick={() => window.print()} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white h-11 px-6">
          <Printer size={18} className={isRTL ? "ml-2" : "mr-2"} />
          {t.reports_page.print_report}
        </Button>
      </PageHeader>

      {/* ... rest of component unchanged ... */}
    </div>
  );
};

export default Reports;