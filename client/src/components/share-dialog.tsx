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
  const shareText = `Check out my protected file ${fileName} using Dlinqnt Shield - Advanced Binary Protection Technology`;
  const websiteUrl = "https://dlinqnt-shield.replit.app";
  const appDescription = "Dlinqnt Shield - Advanced binary code obfuscator with military-grade protection technology. © 2025 Cooper Dignan. Red Shield™ is a registered trademark. Protected by copyright law.";
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(websiteUrl);
  const encodedDescription = encodeURIComponent(appDescription);

  // Update head meta tags for social media sharing
  React.useEffect(() => {
    if (open) {
      // Basic meta tags
      const metaTags = [
        { name: 'description', content: appDescription },
        { property: 'og:title', content: 'Dlinqnt Shield - Advanced Binary Obfuscator' },
        { property: 'og:description', content: appDescription },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: websiteUrl },
        { property: 'og:image', content: `${websiteUrl}/shield-icon.svg` },
        { property: 'og:image:type', content: 'image/svg+xml' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Dlinqnt Shield - Advanced Binary Obfuscator' },
        { name: 'twitter:description', content: appDescription },
        { name: 'twitter:image', content: `${websiteUrl}/shield-icon.svg` }
      ];

      const addedTags = metaTags.map(tag => {
        const meta = document.createElement('meta');
        Object.entries(tag).forEach(([key, value]) => {
          meta.setAttribute(key, value);
        });
        document.head.appendChild(meta);
        return meta;
      });

      // Also update the document title
      const originalTitle = document.title;
      document.title = 'Dlinqnt Shield - Advanced Binary Obfuscator';

      return () => {
        addedTags.forEach(tag => document.head.removeChild(tag));
        document.title = originalTitle;
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
    // Open the file URL in a new tab to trigger browser download
    window.open(fileUrl, '_blank');
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