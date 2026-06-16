"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExportButtonProps {
  label: string;
  onClick: () => void;
  isRTL: boolean;
}

const ExportButton = ({ label, onClick, isRTL }: ExportButtonProps) => (
  <Button    variant="outline"
    onClick={onClick}
    className={cn(
      "rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50",
      isRTL ? "text-right" : "text-left"
    )}
  >
    <Printer className="mr-2" />
    {label}
  </Button>
);

export default ExportButton;