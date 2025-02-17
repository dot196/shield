import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface JunkPumpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (size: number) => void;
}

export function JunkPumpDialog({ open, onOpenChange, onSave }: JunkPumpDialogProps) {
  const [size, setSize] = useState<number>(0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-black/90 border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-primary">Junk Pump Settings</DialogTitle>
          <DialogDescription>
            Increase file size by adding junk code. This won't affect the file's functionality.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="pumpSize" className="text-right">
              Size (MB)
            </Label>
            <Input
              id="pumpSize"
              type="number"
              min="0"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="col-span-3"
              placeholder="Enter size in megabytes"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onSave(size)} className="bg-primary hover:bg-primary/90 text-white">
            Save Pump Size
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
