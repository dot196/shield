import { useState } from "react";
import { Shield, Upload, Image, File } from "lucide-react";
import { SiGithub } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { RegistryDialog } from "@/components/registry-dialog";
import { type RegistryOptions } from "@shared/schema";

export default function Home() {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<File | null>(null);
  const [registryDialogOpen, setRegistryDialogOpen] = useState(false);
  const [registryOptions, setRegistryOptions] = useState<RegistryOptions | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = ['.exe', '.msi', '.bat', '.apk'];
      const fileExtension = file.name.toLowerCase().split('.').pop();
      if (fileExtension && validTypes.includes(`.${fileExtension}`)) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Error",
          description: "Please select a valid file type (EXE, MSI, BAT, or APK)",
          variant: "destructive"
        });
      }
    }
  };

  const handleIconChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.toLowerCase().endsWith('.ico')) {
      setSelectedIcon(file);
    } else if (file) {
      toast({
        title: "Error",
        description: "Please select an ICO file",
        variant: "destructive"
      });
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

      // If an icon is selected, add it to the form data
      if (selectedIcon) {
        formData.append("ico", selectedIcon);
      }

      // If registry options are set, add them to the form data
      if (registryOptions) {
        formData.append("registry", JSON.stringify(registryOptions));
      }

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
    if (!selectedIcon) {
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
      formData.append("ico", selectedIcon);

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
            <CardTitle className="text-primary">Upload Your Files</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col space-y-6">
                <div className="space-y-2">
                  <Input
                    type="file"
                    accept=".exe,.msi,.bat,.apk"
                    onChange={handleFileChange}
                    className="bg-background/50 border-primary/20 focus:border-primary w-full"
                    placeholder="Select file to obfuscate..."
                  />
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleObfuscate} 
                      disabled={isProcessing || !selectedFile}
                      className="bg-primary hover:bg-primary/90 text-white w-full flex items-center justify-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      {isProcessing ? "Processing..." : "Obfuscate File"}
                    </Button>
                    <Button
                      onClick={() => setRegistryDialogOpen(true)}
                      className="bg-primary hover:bg-primary/90 text-white flex items-center justify-center gap-2"
                      disabled={!selectedFile}
                    >
                      <File className="w-4 h-4" />
                      {registryOptions ? "Edit Registry" : "Add Registry"}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Input
                    type="file"
                    accept=".ico"
                    onChange={handleIconChange}
                    className="bg-background/50 border-primary/20 focus:border-primary w-full"
                    placeholder="Select ICO file..."
                  />
                  <Button
                    onClick={handleAddIconToExe}
                    disabled={isProcessing || !selectedIcon}
                    className="bg-primary hover:bg-primary/90 text-white w-full flex items-center justify-center gap-2"
                  >
                    <Image className="w-4 h-4" />
                    Add ICO to EXE
                  </Button>
                </div>

                <Button
                  onClick={handleGithubExport}
                  className="bg-primary hover:bg-primary/90 text-white w-full flex items-center justify-center gap-2"
                >
                  <SiGithub className="w-4 h-4" />
                  Export to GitHub
                </Button>
              </div>
            <div className="text-sm text-muted-foreground border border-primary/10 rounded-lg p-4 bg-black/20">
              <p className="font-medium text-primary mb-2">Supported File Types:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>.exe - Windows Executables</li>
                <li>.msi - Windows Installers</li>
                <li>.bat - Batch Scripts</li>
                <li>.apk - Android Applications</li>
                <li>.ico - Icon Files</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
      <RegistryDialog
        open={registryDialogOpen}
        onOpenChange={setRegistryDialogOpen}
        onSave={(options) => {
          setRegistryOptions(options);
          setRegistryDialogOpen(false);
          toast({
            title: "Registry Info Saved",
            description: "Registry information will be applied during obfuscation."
          });
        }}
      />
    </div>
  );
}