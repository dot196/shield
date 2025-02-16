import { useState } from "react";
import { Shield, Upload, Image } from "lucide-react";
import { SiGithub } from "react-icons/si";
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

  const handleIcoConversion = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select an EXE file to convert",
        variant: "destructive"
      });
      return;
    }

    if (!selectedFile.name.toLowerCase().endsWith('.exe')) {
      toast({
        title: "Error",
        description: "Only EXE files can be converted to ICO",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/convert/ico", {
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
      a.download = `${selectedFile.name.replace('.exe', '.ico')}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "EXE has been converted to ICO and downloaded!"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to convert to ICO",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGithubExport = () => {
    window.open('https://github.com/new', '_blank');
    toast({
      title: "GitHub Export",
      description: "Create a new repository and upload your obfuscated code manually for now. Full GitHub integration coming soon!",
    });
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto py-16 px-4">
        <div className="flex flex-col items-center justify-center mb-12 text-center">
          <Shield className="w-16 h-16 mb-6 text-primary animate-pulse" />
          <div className="space-y-4">
            <h1 className="text-5xl font-black tracking-tight bg-gradient-to-r from-primary via-red-500 to-primary/60 text-transparent bg-clip-text animate-gradient">
              Dlinqnt Shield
            </h1>
            <p className="text-xl font-medium bg-gradient-to-r from-red-400 to-red-600 text-transparent bg-clip-text">
              Advanced Binary Code Obfuscator
            </p>
            <p className="mt-4 text-muted-foreground max-w-md text-sm">
              Protect your executables and scripts with military-grade obfuscation technology
            </p>
          </div>
        </div>

        <Card className="max-w-2xl mx-auto border-primary/20 bg-black/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-primary">Upload Your File</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Input
                type="file"
                accept=".exe,.msi,.bat,.js,.ico"
                onChange={handleFileChange}
                className="flex-1 bg-background/50 border-primary/20 focus:border-primary"
              />
              <div className="flex gap-2">
                <Button 
                  onClick={handleObfuscate} 
                  disabled={isProcessing || !selectedFile}
                  className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {isProcessing ? "Processing..." : "Obfuscate"}
                </Button>
                <Button
                  onClick={handleIcoConversion}
                  disabled={isProcessing || !selectedFile || !selectedFile?.name.toLowerCase().endsWith('.exe')}
                  variant="outline"
                  className="border-primary/20 hover:border-primary flex items-center gap-2"
                >
                  <Image className="w-4 h-4" />
                  Convert to ICO
                </Button>
                <Button
                  onClick={handleGithubExport}
                  variant="outline"
                  className="border-primary/20 hover:border-primary flex items-center gap-2"
                >
                  <SiGithub className="w-4 h-4" />
                  Export to GitHub
                </Button>
              </div>
            </div>

            <div className="text-sm text-muted-foreground border border-primary/10 rounded-lg p-4 bg-black/20">
              <p className="font-medium text-primary mb-2">Supported File Types:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>.exe - Windows Executables</li>
                <li>.msi - Windows Installers</li>
                <li>.bat - Batch Scripts</li>
                <li>.js - JavaScript Files</li>
                <li>.ico - Icon Files</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}