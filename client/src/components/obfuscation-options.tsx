import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ObfuscationOptions } from "@shared/schema";

interface ObfuscationOptionsProps {
  options: ObfuscationOptions;
  onChange: (options: ObfuscationOptions) => void;
}

export function ObfuscationOptionsPanel({ options, onChange }: ObfuscationOptionsProps) {
  const updateOption = (key: keyof ObfuscationOptions) => {
    onChange({
      ...options,
      [key]: !options[key]
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Obfuscation Options</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="compact" 
            checked={options.compact}
            onCheckedChange={() => updateOption("compact")}
          />
          <Label htmlFor="compact">Compact Code</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="controlFlowFlattening" 
            checked={options.controlFlowFlattening}
            onCheckedChange={() => updateOption("controlFlowFlattening")}
          />
          <Label htmlFor="controlFlowFlattening">Control Flow Flattening</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="deadCodeInjection" 
            checked={options.deadCodeInjection}
            onCheckedChange={() => updateOption("deadCodeInjection")}
          />
          <Label htmlFor="deadCodeInjection">Dead Code Injection</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="stringEncryption" 
            checked={options.stringEncryption}
            onCheckedChange={() => updateOption("stringEncryption")}
          />
          <Label htmlFor="stringEncryption">String Encryption</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="rotateStringArray" 
            checked={options.rotateStringArray}
            onCheckedChange={() => updateOption("rotateStringArray")}
          />
          <Label htmlFor="rotateStringArray">Rotate String Array</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="selfDefending" 
            checked={options.selfDefending}
            onCheckedChange={() => updateOption("selfDefending")}
          />
          <Label htmlFor="selfDefending">Self Defending</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="renameGlobals" 
            checked={options.renameGlobals}
            onCheckedChange={() => updateOption("renameGlobals")}
          />
          <Label htmlFor="renameGlobals">Rename Globals</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="renameProperties" 
            checked={options.renameProperties}
            onCheckedChange={() => updateOption("renameProperties")}
          />
          <Label htmlFor="renameProperties">Rename Properties</Label>
        </div>
      </CardContent>
    </Card>
  );
}
