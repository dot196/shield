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

    if (!selectedFile.name.toLowerCase().endsWith('.exe')) {
      toast({
        title: "Error",
        description: "Only EXE files can be obfuscated",
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

  const handleAddIconToExe = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select an ICO file",
        variant: "destructive"
      });
      return;
    }

    if (!selectedFile.name.toLowerCase().endsWith('.ico')) {
      toast({
        title: "Error",
        description: "Please select an ICO file",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("ico", selectedFile);

      const response = await fetch("/api/add-icon", {
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
      a.download = `icon_modified.exe`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Icon has been added to the EXE file!"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add icon to EXE",
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
            <div className="flex flex-col space-y-4">
              <Input
                type="file"
                accept=".exe,.ico"
                onChange={handleFileChange}
                className="bg-background/50 border-primary/20 focus:border-primary w-full"
                placeholder="Select EXE or ICO file..."
              />
              <div className="flex flex-col space-y-2">
                <Button 
                  onClick={handleObfuscate} 
                  disabled={isProcessing || !selectedFile || !selectedFile?.name.toLowerCase().endsWith('.exe')}
                  className="bg-primary hover:bg-primary/90 text-white w-full flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {isProcessing ? "Processing..." : "Obfuscate EXE"}
                </Button>
                <Button
                  onClick={handleAddIconToExe}
                  disabled={isProcessing || !selectedFile || !selectedFile?.name.toLowerCase().endsWith('.ico')}
                  className="bg-primary hover:bg-primary/90 text-white w-full flex items-center justify-center gap-2"
                >
                  <Image className="w-4 h-4" />
                  Add ICO to EXE
                </Button>
                <Button
                  onClick={handleGithubExport}
                  className="bg-primary hover:bg-primary/90 text-white w-full flex items-center justify-center gap-2"
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
                <li>.ico - Icon Files</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}