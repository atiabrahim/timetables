"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Database } from "lucide-react";

interface DemoDataBannerProps {
  isRTL: boolean;
  loadDemoData: () => void;
}

const DemoDataBanner = ({ isRTL, loadDemoData }: DemoDataBannerProps) => {
  return (
    <Card className="border-none shadow-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-[2.5rem] overflow-hidden relative group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
      <CardContent className="p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        <div className="space-y-2 text-center md:text-start">
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full mb-2">
            <Sparkles size={14} className="text-emerald-200 fill-white" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-100">
              {isRTL ? "نظام جديد" : "New System"}
            </span>
          </div>
          <h3 className="text-2xl md:text-3xl font-black tracking-tight">
            {isRTL ? "هل ترغب في تجربة النظام ببيانات جاهزة؟" : "Want to try the system with demo data?"}
          </h3>
          <p className="text-sm font-bold text-emerald-100/80 max-w-xl leading-relaxed">
            {isRTL 
              ? "يبدو أنك تفتح النظام لأول مرة! يمكنك بنقرة واحدة تحميل بيانات تجريبية لتجربة كافة ميزات النظام والتقارير فوراً." 
              : "It looks like you are opening the system for the first time! Load demo data in one click to try all features."}
          </p>
        </div>
        <Button 
          onClick={loadDemoData} 
          className="h-14 px-8 bg-white text-emerald-950 hover:bg-emerald-50 rounded-2xl font-black text-base shadow-xl transition-all hover:scale-105 shrink-0 gap-2"
        >
          <Database size={18} />
          {isRTL ? "تحميل البيانات التجريبية" : "Load Demo Data"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DemoDataBanner;