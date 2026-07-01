"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ResizableHeaderProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  onResize: (width: number) => void;
  width: number;
  isRTL: boolean;
}

const ResizableHeader = ({ 
  children, 
  onResize, 
  width, 
  isRTL, 
  className, 
  ...props 
}: ResizableHeaderProps) => {
  const [isResizing, setIsResizing] = useState(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    startX.current = e.pageX;
    startWidth.current = width;
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      // Calculate the difference in mouse movement
      const diff = e.pageX - startX.current;
      // In RTL, dragging left (negative diff) increases width, so we subtract diff
      const newWidth = isRTL ? startWidth.current - diff : startWidth.current + diff;
      
      if (newWidth > 40) { // Set a minimum width for the column
        onResize(newWidth);
      }
    };

    const onMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "col-resize";
    }

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "";
    };
  }, [isResizing, isRTL, onResize]);

  return (
    <th
      {...props}
      style={{ width: `${width}px`, minWidth: `${width}px`, position: "relative" }}
      className={cn(className, "group select-none")}
    >
      <div className="overflow-hidden truncate px-2">
        {children}
      </div>
      <div
        onMouseDown={onMouseDown}
        className={cn(
          "absolute top-0 bottom-0 w-1.5 cursor-col-resize z-10 transition-colors opacity-0 group-hover:opacity-100",
          "hover:bg-emerald-400/50",
          isResizing ? "bg-emerald-500 opacity-100 w-2" : "bg-slate-300",
          isRTL ? "left-0" : "right-0"
        )}
      />
    </th>
  );
};

export default ResizableHeader;