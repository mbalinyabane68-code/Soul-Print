import { useState } from "react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle,
} from "@/components/ui/drawer";
import { Check } from "lucide-react";

// Detects touch-primary devices
const isMobile = () =>
  typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

export default function MobileSelect({ value, onValueChange, options, placeholder, className }) {
  const [open, setOpen] = useState(false);

  if (!isMobile()) {
    return (
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={className}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  const selected = options.find((o) => o.value === value);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex h-9 w-full items-center justify-between rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm text-left ${className || ""}`}
      >
        <span className={selected ? "" : "text-muted-foreground"}>
          {selected ? selected.label : (placeholder || "Select...")}
        </span>
        <svg className="h-4 w-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{placeholder || "Select an option"}</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 space-y-1 pb-8">
            {options.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => { onValueChange(o.value); setOpen(false); }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-muted active:bg-muted transition-colors text-sm font-medium"
              >
                {o.label}
                {value === o.value && <Check className="h-4 w-4 text-primary" />}
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}