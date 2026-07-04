"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Edit2, Trash2, Upload } from "lucide-react";

interface LogoCardProps {
  logo: string | undefined;
  isAdmin: boolean;
  isRTL: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveLogo: () => void;
}

const LogoCard = ({
  logo,
  isAdmin,
  isRTL,
  fileInputRef,
  onLogoUpload,
  onRemoveLogo
}: LogoCardProps) => {
  return (
    <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
      <CardHeader className="bg-[#f9f9f1] border-b border-gray-100">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <ImageIcon size={20} className="text-[#064e3b]" />
          {isRTL ? "شعار المؤسسة" : "Institution Logo"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 flex flex-col items-center space-y-4">
        <div className="w-32 h-32 border-2 border-dashed border-emerald-100 rounded-2xl flex items-center justify-center bg-emerald-50/10 overflow-hidden relative group">
          {logo ? (
            <>
              <img src={logo} alt="Institution Logo" className="w-full h-full object-contain p-2" />
              {isAdmin && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="icon" variant="ghost" className="text-white hover:bg-white/20" onClick={() => fileInputRef.current?.click()}>
                    <Edit2 size={16} />
                  </Button>
                  <Button size="icon" variant="ghost" className="text-red-400 hover:bg-red-500/20" onClick={onRemoveLogo}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center p-4 flex flex-col items-center gap-2 text-slate-400">
              <ImageIcon size={32} className="text-slate-300" />
              <span className="text-[10px] font-bold">{isRTL ? "لا يوجد شعار" : "No Logo"}</span>
            </div>
          )}
        </div>

        {isAdmin && (
          <div className="w-full">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={onLogoUpload} 
              accept="image/*" 
              className="hidden" 
            />
            <Button 
              onClick={() => fileInputRef.current?.click()} 
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2 font-bold"
            >
              <Upload size={16} />
              {logo ? (isRTL ? "تغيير الشعار" : "Change Logo") : (isRTL ? "رفع شعار جديد" : "Upload Logo")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LogoCard;