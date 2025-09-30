import { cn } from "@/lib/utils";
import Image from "next/image";
import React from "react";

export const BackstageActionMenuItem = ({
    icon,
    label,
    selected,
    onClick,
}: {
    icon: string;
    label: string;
    selected: boolean;
    onClick: () => void;
}) => {
  return (
    <div
      className={cn("flex flex-col items-center gap-2 w-full h-20 bg-border/20 rounded-[4px] justify-center cursor-pointer", selected && "border border-primary")}
      onClick={onClick}
    >
      <Image width={24} height={24} src={icon} alt={label} />
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
};
