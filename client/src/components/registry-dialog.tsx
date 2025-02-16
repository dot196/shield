import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type RegistryOptions, predefinedProfiles } from "@shared/schema";

interface RegistryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (options: RegistryOptions) => void;
}

export function RegistryDialog({ open, onOpenChange, onSave }: RegistryDialogProps) {
  const [profile, setProfile] = useState<"custom" | "google" | "microsoft">("custom");
  const [options, setOptions] = useState<RegistryOptions>({
    companyName: "",
    productName: "",
    description: "",
    version: "1.0.0.0",
    copyright: "",
    originalFilename: "",
    trademarks: "",
    comments: ""
  });

  const handleProfileChange = (value: "custom" | "google" | "microsoft") => {
    setProfile(value);
    if (value !== "custom") {
      setOptions(predefinedProfiles[value]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-black/90 border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-primary">Registry Information</DialogTitle>
          <DialogDescription>
            Set the registry details for your application. Choose a predefined profile or enter custom details.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="profile" className="text-right">
              Profile
            </Label>
            <Select
              value={profile}
              onValueChange={(value: "custom" | "google" | "microsoft") => handleProfileChange(value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a profile" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">Custom</SelectItem>
                <SelectItem value="google">Google</SelectItem>
                <SelectItem value="microsoft">Microsoft</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="companyName" className="text-right">
              Company
            </Label>
            <Input
              id="companyName"
              value={options.companyName}
              onChange={(e) => setOptions({ ...options, companyName: e.target.value })}
              className="col-span-3"
              disabled={profile !== "custom"}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="productName" className="text-right">
              Product
            </Label>
            <Input
              id="productName"
              value={options.productName}
              onChange={(e) => setOptions({ ...options, productName: e.target.value })}
              className="col-span-3"
              disabled={profile !== "custom"}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input
              id="description"
              value={options.description}
              onChange={(e) => setOptions({ ...options, description: e.target.value })}
              className="col-span-3"
              disabled={profile !== "custom"}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="version" className="text-right">
              Version
            </Label>
            <Input
              id="version"
              value={options.version}
              onChange={(e) => setOptions({ ...options, version: e.target.value })}
              className="col-span-3"
              disabled={profile !== "custom"}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="copyright" className="text-right">
              Copyright
            </Label>
            <Input
              id="copyright"
              value={options.copyright}
              onChange={(e) => setOptions({ ...options, copyright: e.target.value })}
              className="col-span-3"
              disabled={profile !== "custom"}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onSave(options)} className="bg-primary hover:bg-primary/90 text-white">
            Save Registry Info
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
