import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  SiX,
  SiLinkedin,
  SiFacebook,
  SiReddit,
  SiTelegram
} from "react-icons/si";
import { Download } from "lucide-react";
import React from 'react';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileUrl: string;
  fileName: string;
}

export function ShareDialog({ open, onOpenChange, fileUrl, fileName }: ShareDialogProps) {
  // Create a shareable message that includes the website URL
  const shareText = `Check out my obfuscated file ${fileName} using Dlinqnt Shield!`;
  const websiteUrl = window.location.origin;
  const appDescription = "Dlinqnt Shield - Advanced binary code obfuscator protecting your executables with military-grade technology";
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(websiteUrl);
  const encodedDescription = encodeURIComponent(appDescription);

  // Update head meta tags for social media sharing
  React.useEffect(() => {
    if (open) {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = appDescription;
      document.head.appendChild(meta);

      const ogTitle = document.createElement('meta');
      ogTitle.property = 'og:title';
      ogTitle.content = 'Dlinqnt Shield';
      document.head.appendChild(ogTitle);

      const ogDesc = document.createElement('meta');
      ogDesc.property = 'og:description';
      ogDesc.content = appDescription;
      document.head.appendChild(ogDesc);

      return () => {
        document.head.removeChild(meta);
        document.head.removeChild(ogTitle);
        document.head.removeChild(ogDesc);
      };
    }
  }, [open]);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&summary=${encodedDescription}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
    reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedText}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], '_blank', 'width=600,height=400');
    onOpenChange(false);
  };

  const handleDownload = () => {
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName; // Set the download attribute
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click(); // Trigger the download
    document.body.removeChild(link);
    URL.revokeObjectURL(fileUrl); // Clean up the URL object
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-black/90 border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-primary">Share Your File</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col space-y-2 py-4">
          <Button
            onClick={() => handleShare('twitter')}
            className="bg-[#000000] hover:bg-[#000000]/90 text-white flex items-center justify-center gap-2"
          >
            <SiX className="w-4 h-4" />
            Twitter/X
          </Button>
          <Button
            onClick={() => handleShare('linkedin')}
            className="bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white flex items-center justify-center gap-2"
          >
            <SiLinkedin className="w-4 h-4" />
            LinkedIn
          </Button>
          <Button
            onClick={() => handleShare('facebook')}
            className="bg-[#1877F2] hover:bg-[#1877F2]/90 text-white flex items-center justify-center gap-2"
          >
            <SiFacebook className="w-4 h-4" />
            Facebook
          </Button>
          <Button
            onClick={() => handleShare('reddit')}
            className="bg-[#FF4500] hover:bg-[#FF4500]/90 text-white flex items-center justify-center gap-2"
          >
            <SiReddit className="w-4 h-4" />
            Reddit
          </Button>
          <Button
            onClick={() => handleShare('telegram')}
            className="bg-[#0088cc] hover:bg-[#0088cc]/90 text-white flex items-center justify-center gap-2"
          >
            <SiTelegram className="w-4 h-4" />
            Telegram
          </Button>
          <Button
            onClick={handleDownload}
            className="bg-primary hover:bg-primary/90 text-white flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}