import { useState } from "react";
import { Shield, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

export default function Home() {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleObfuscate = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file to obfuscate",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/obfuscate/binary", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `obfuscated_${selectedFile.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "File has been obfuscated and downloaded!"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to obfuscate file",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto py-16 px-4">
        <div className="flex flex-col items-center justify-center mb-12 text-center">
          <Shield className="w-16 h-16 mb-4 text-primary animate-pulse" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 text-transparent bg-clip-text">
            Binary Code Obfuscator
          </h1>
          <p className="mt-4 text-muted-foreground max-w-md">
            Protect your executables and scripts with advanced obfuscation technology
          </p>
        </div>

        <Card className="max-w-2xl mx-auto border-primary/20 bg-black/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-primary">Upload Your File</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Input
                type="file"
                accept=".exe,.msi,.bat,.js"
                onChange={handleFileChange}
                className="flex-1 bg-background/50 border-primary/20 focus:border-primary"
              />
              <Button 
                onClick={handleObfuscate} 
                disabled={isProcessing || !selectedFile}
                className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {isProcessing ? "Processing..." : "Obfuscate"}
              </Button>
            </div>

            <div className="text-sm text-muted-foreground border border-primary/10 rounded-lg p-4 bg-black/20">
              <p className="font-medium text-primary mb-2">Supported File Types:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>.exe - Windows Executables</li>
                <li>.msi - Windows Installers</li>
                <li>.bat - Batch Scripts</li>
                <li>.js - JavaScript Files</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}