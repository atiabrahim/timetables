"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ConflictsAlertProps {
  conflictsCount: number;
  isRTL: boolean;
  onResolveClick: () => void;
}

const ConflictsAlert = ({ conflictsCount, isRTL, onResolveClick }: ConflictsAlertProps) => {
  return (
    <Card 
      className="border-none shadow-lg bg-amber-50 border border-amber-200 rounded-[2rem] overflow-hidden cursor-pointer hover:bg-amber-100 transition-colors" 
      onClick={onResolveClick}
    >
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-200">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h4 className="font-black text-amber-900">
              {isRTL ? "تم اكتشاف تعارضات!" : "Conflicts Detected!"}
            </h4>
            <p className="text-xs font-bold text-amber-700">
              {isRTL 
                ? `هناك ${conflictsCount} تداخلات في المهام أو القاعات.` 
                : `There are ${conflictsCount} resource overlaps.`}
            </p>
          </div>
        </div>
        <Button variant="ghost" className="text-amber-900 font-bold">
          {isRTL ? "حل التعارضات" : "Resolve Now"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ConflictsAlert;