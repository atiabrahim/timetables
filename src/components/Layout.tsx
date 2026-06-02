"use client";

import React from "react";
import Navbar from "./layout/Navbar";
import Sidebar from "./layout/Sidebar";
import { useApp } from "../context/AppContext";
import { cn } from "@/lib/utils";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { isRTL } = useApp();

  return (
    <div className={cn(
      "min-h-screen flex flex-col bg-[#FDFDFD]", 
      isRTL ? "font-arabic" : ""
    )}>
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 md:p-10 lg:p-12">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;