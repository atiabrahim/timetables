"use client";

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarGroupProps {
  group: {
    title: string;
    items: Array<{
      icon: React.ElementType;
      label: string;
      path: string;
    }>;
  };
  isSidebarCollapsed: boolean;
  isRTL: boolean;
  locationPathname: string;
}

const SidebarGroup = ({
  group,
  isSidebarCollapsed,
  isRTL,
  locationPathname,
}: SidebarGroupProps) => {
  const [isHovered, setIsHovered] = useState(false);

  // التحقق مما إذا كانت المجموعة تحتوي على الصفحة النشطة حالياً لإبقائها مفتوحة
  const hasActiveItem = group.items.some((item) => item.path === locationPathname);
  const isOpen = isSidebarCollapsed || hasActiveItem || isHovered;

  return (
    <div
      className="space-y-2 transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!isSidebarCollapsed && (
        <div className="flex items-center gap-2 px-4 mb-2 cursor-default select-none">
          <div className="h-px flex-1 bg-emerald-50/50" />
          <h4 className="text-[9px] font-black text-emerald-900/30 uppercase tracking-[0.2em] whitespace-nowrap transition-colors duration-300 group-hover:text-emerald-600">
            {group.title}
          </h4>
          <div className="h-px flex-1 bg-emerald-50/50" />
        </div>
      )}

      <nav
        className={cn(
          "space-y-1 transition-all duration-500 ease-in-out overflow-hidden",
          isOpen
            ? "max-h-[500px] opacity-100 transform translate-y-0"
            : "max-h-0 opacity-0 transform -translate-y-2 pointer-events-none"
        )}
      >
        {group.items.map((item) => {
          const isActive = locationPathname === item.path;

          const linkContent = (
            <Link
              to={item.path}
              className={cn(
                "flex items-center rounded-2xl transition-all duration-300 group relative overflow-hidden",
                isSidebarCollapsed ? "justify-center h-12 w-12 mx-auto" : "justify-between px-4 py-2.5",
                isActive
                  ? "bg-emerald-950 text-white shadow-lg shadow-emerald-900/20"
                  : "hover:bg-emerald-50 text-slate-500 hover:text-emerald-900"
              )}
            >
              {!isSidebarCollapsed && (
                <span
                  className={cn(
                    "font-bold text-[11px] z-10 truncate transition-colors duration-300",
                    isActive ? "text-white" : "text-slate-600 group-hover:text-emerald-950"
                  )}
                >
                  {item.label}
                </span>
              )}

              <item.icon
                size={16}
                className={cn(
                  "z-10 transition-all duration-300 shrink-0",
                  isActive ? "text-emerald-400 scale-110" : "text-slate-400 group-hover:text-emerald-600"
                )}
              />

              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-900 to-emerald-950 opacity-100" />
              )}
            </Link>
          );

          if (isSidebarCollapsed) {
            return (
              <Tooltip key={item.path} delayDuration={100}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent
                  side={isRTL ? "left" : "right"}
                  className="bg-emerald-950 text-white font-bold text-[10px] rounded-lg border-none shadow-md"
                >
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          }

          return <React.Fragment key={item.path}>{linkContent}</React.Fragment>;
        })}
      </nav>
    </div>
  );
};

export default SidebarGroup;