import { useState } from "react";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CodeEditor } from "@/components/code-editor";
import { ObfuscationOptionsPanel } from "@/components/obfuscation-options";
import { apiRequest } from "@/lib/queryClient";
import { type ObfuscationOptions, obfuscationOptions } from "@shared/schema";

const defaultOptions: ObfuscationOptions = {
  compact: true,
  controlFlowFlattening: true,
  deadCodeInjection: true,
  stringEncryption: true,
  rotateStringArray: true,
  selfDefending: false,
  renameGlobals: false,
  renameProperties: false
};

export default function Home() {
  const { toast } = useToast();
  const [sourceCode, setSourceCode] = useState("");
  const [obfuscatedCode, setObfuscatedCode] = useState("");
  const [options, setOptions] = useState<ObfuscationOptions>(defaultOptions);
  const [isObfuscating, setIsObfuscating] = useState(false);

  const handleObfuscate = async () => {
    if (!sourceCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter some JavaScript code to obfuscate",
        variant: "destructive"
      });
      return;
    }

    setIsObfuscating(true);
    try {
      const response = await apiRequest("POST", "/api/obfuscate", {
        originalCode: sourceCode,
        options,
      });
      const result = await response.json();
      setObfuscatedCode(result.obfuscatedCode);
      toast({
        title: "Success",
        description: "Code has been obfuscated successfully!"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to obfuscate code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsObfuscating(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([obfuscatedCode], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "obfuscated.js";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-center mb-8">
        <Shield className="w-8 h-8 mr-2 text-primary" />
        <h1 className="text-3xl font-bold">JavaScript Code Obfuscator</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Source Code</CardTitle>
            </CardHeader>
            <CardContent>
              <CodeEditor
                value={sourceCode}
                onChange={setSourceCode}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Obfuscated Code</CardTitle>
            </CardHeader>
            <CardContent>
              <CodeEditor
                value={obfuscatedCode}
                readOnly
              />
              <div className="mt-4 flex gap-4">
                <Button 
                  onClick={handleObfuscate} 
                  disabled={isObfuscating}
                >
                  {isObfuscating ? "Obfuscating..." : "Obfuscate"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  disabled={!obfuscatedCode}
                >
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <ObfuscationOptionsPanel
            options={options}
            onChange={setOptions}
          />
        </div>
      </div>
    </div>
  );
}
