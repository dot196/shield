import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  SiX,
  SiLinkedin,
  SiFacebook,
  SiReddit 
} from "react-icons/si";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileUrl: string;
  fileName: string;
}

export function ShareDialog({ open, onOpenChange, fileUrl, fileName }: ShareDialogProps) {
  const shareText = `Check out my obfuscated file: ${fileName}`;
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(fileUrl);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedText}`
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], '_blank', 'width=600,height=400');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-black/90 border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-primary">Share Your File</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}