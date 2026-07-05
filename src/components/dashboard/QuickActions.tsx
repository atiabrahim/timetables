"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuickActionItem {
  label: string;
  icon: React.ElementType;
  path: string;
  color: string;
}

interface QuickActionsProps {
  actions: QuickActionItem[];
  onActionClick: (path: string) => void;
}

const QuickActions = ({ actions, onActionClick }: QuickActionsProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {actions.map((action, idx) => (
        <Button 
          key={idx} 
          variant="ghost" 
          onClick={() => onActionClick(action.path)} 
          className="h-auto flex flex-col items-center gap-3 p-6 rounded-[2.5rem] border border-slate-100 bg-white hover:bg-emerald-50 transition-all shadow-sm"
        >
          <div className={cn("p-4 rounded-2xl", action.color)}>
            <action.icon size={24} />
          </div>
          <span className="font-black text-xs text-slate-700">{action.label}</span>
        </Button>
      ))}
    </div>
  );
};

export default QuickActions;