"use client";

import React from "react";
import { Languages, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "../../context/AppContext";

const Navbar = () => {
  const { t, language, setLanguage, logout, user } = useApp();

  return (
    <header className="h-20 border-b bg-white/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-50">
      <div className="flex flex-col text-start">
        <h1 className="text-xl font-black text-emerald-900 leading-none">{t.appTitle}</h1>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">{t.appSubtitle}</p>
      </div>

      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
          className="text-slate-600 font-bold gap-2 hover:bg-emerald-50 rounded-xl"
        >
          <Languages size={18} className="text-emerald-600" />
          <span>{language === "ar" ? "EN" : "AR"}</span>
        </Button>

        <div className="h-8 w-px bg-slate-100 mx-2" />

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-sm font-black text-slate-900">{user?.fullName || user?.username}</span>
            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter bg-emerald-50 px-2 rounded-full">
              {user?.role}
            </span>
          </div>
          <Button 
            variant="outline" 
            size="icon"
            onClick={logout}
            className="rounded-xl border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-100"
          >
            <LogOut size={18} />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;