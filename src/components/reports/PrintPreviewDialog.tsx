"use client";

import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, Printer, RotateCw, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PrintPreviewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  t: any;
  orientation: "portrait" | "landscape";
  onToggleOrientation: () => void;
  onPrint: () => void;
  children: React.ReactNode;
}

const PrintPreviewDialog = ({
  isOpen,
  onOpenChange,
  t,
  orientation,
  onToggleOrientation,
  onPrint,
  children
}: PrintPreviewDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[98vw] w-full h-[95vh] overflow-hidden bg-zinc-900/95 border-none p-0 rounded-none flex flex-col z-[9999] print:bg-white print:h-auto print:block">
        <div className="bg-black/40 p-4 border-b border-white/10 flex justify-between items-center shrink-0 print:hidden">
          <div className="flex items-center gap-3 text-white">
            <Eye className="text-emerald-500" />
            <h3 className="font-black text-lg">{t.printPreview}</h3>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onToggleOrientation}
                className="text-white font-bold h-9 px-4 rounded-lg flex items-center gap-2"
              >
                <RotateCw size={14} />
                {orientation === "portrait" ? t.landscape : t.portrait}
              </Button>
            </div>
            <Button onClick={onPrint} size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-10 rounded-xl h-11">
              <Printer className="h-5 w-5 me-2" />
              {t.print}
            </Button>
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-white/50 hover:text-white">
              <X size={24} />
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-12 bg-zinc-950/50 flex flex-col items-center print:bg-white print:p-0 print:block">
          <div className="w-full flex flex-col items-center gap-12 print:gap-0 print:block">
            {children}
          </div>
        </div>
        <style>
          {`
            @page {
              size: A4 ${orientation};
              margin: 0;
            }
          `}
        </style>
      </DialogContent>
    </Dialog>
  );
};

export default PrintPreviewDialog;