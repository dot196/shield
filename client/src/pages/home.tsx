import { useState } from "react";
import { Shield, Upload, Image, File, Share2 } from "lucide-react";
import { SiGithub } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RegistryDialog } from "@/components/registry-dialog";
import { ShareDialog } from "@/components/share-dialog";
import { type RegistryOptions } from "@shared/schema";
import { JunkPumpDialog } from "@/components/junk-pump-dialog";

export default function Home() {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<File | null>(null);
  const [registryDialogOpen, setRegistryDialogOpen] = useState(false);
  const [registryOptions, setRegistryOptions] = useState<RegistryOptions | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [obfuscatedFileUrl, setObfuscatedFileUrl] = useState<string>("");
  const [obfuscatedFileName, setObfuscatedFileName] = useState<string>("");
  const [pumpSize, setPumpSize] = useState<number | null>(null);
  const [junkPumpDialogOpen, setJunkPumpDialogOpen] = useState(false);

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

      if (selectedIcon) {
        formData.append("ico", selectedIcon);
      }

      if (registryOptions) {
        formData.append("registry", JSON.stringify(registryOptions));
      }

      if (pumpSize && pumpSize > 0) {
        formData.append("pumpSize", pumpSize.toString());
      }

      const response = await fetch("/api/obfuscate/binary", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const blob = await response.blob();
      const fileName = `obfuscated_${selectedFile.name}`;
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      setObfuscatedFileUrl(url);
      setObfuscatedFileName(fileName);

      toast({
        title: "Success",
        description: "File has been obfuscated! Download should begin automatically."
      });
      setShareDialogOpen(true);
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
              Advanced Binary Protection Technology
            </p>
            <p className="mt-4 text-muted-foreground max-w-md text-sm">
              Protected by copyright © 2025 Cooper Dignan. Red Shield™ is a registered trademark.
            </p>
            <p className="text-xs text-muted-foreground">
              27 Booyong Drive, Eyre, Adelaide 5121
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
                  className="bg-primary hover:bg-primary/90 text-white w-full flex items-center justify-center gap-2"
                  disabled={!selectedFile}
                >
                  <File className="w-4 h-4" />
                  {registryOptions ? "Edit Registry" : "Add Registry"}
                </Button>
                <Button
                  onClick={() => setJunkPumpDialogOpen(true)}
                  className="bg-primary hover:bg-primary/90 text-white w-full flex items-center justify-center gap-2"
                  disabled={!selectedFile}
                >
                  <File className="w-4 h-4" />
                  {pumpSize ? `Edit Junk Pump (${pumpSize}MB)` : "Add Junk Pump"}
                </Button>
                {obfuscatedFileUrl && (
                  <Button
                    onClick={() => setShareDialogOpen(true)}
                    className="bg-primary hover:bg-primary/90 text-white w-full flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>
                )}
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
      <JunkPumpDialog
        open={junkPumpDialogOpen}
        onOpenChange={setJunkPumpDialogOpen}
        onSave={(size) => {
          setPumpSize(size);
          setJunkPumpDialogOpen(false);
          toast({
            title: "Junk Pump Size Saved",
            description: `File will be pumped to ${size}MB during obfuscation.`
          });
        }}
      />
      <ShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        fileUrl={obfuscatedFileUrl}
        fileName={obfuscatedFileName}
      />
      <footer className="py-6 text-center text-xs text-muted-foreground">
        <p>Copyright © 2025 Cooper Dignan. All rights reserved.</p>
        <p>Unauthorized reproduction or distribution of this application or any portion of it may result in severe civil and criminal penalties.</p>
      </footer>
    </div>
  );
}