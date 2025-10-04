import { Share2, Twitter, Facebook, Linkedin, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface ShareButtonsProps {
  title: string;
  description: string;
  url?: string;
}

export default function ShareButtons({ title, description, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || window.location.href;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
    }
  };

  const shareToTwitter = () => {
    const text = encodeURIComponent(`${title}\n\n${description}\n\n#ProofOfImpact #VeChain #B3TR`);
    const shareLink = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`;
    window.open(shareLink, '_blank', 'width=600,height=400');
  };

  const shareToFacebook = () => {
    const shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(shareLink, '_blank', 'width=600,height=400');
  };

  const shareToLinkedIn = () => {
    const shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(shareLink, '_blank', 'width=600,height=400');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: shareUrl,
        });
      } catch (error) {
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      {navigator.share && (
        <button
          onClick={handleNativeShare}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-semibold"
        >
          <Share2 className="h-4 w-4" />
          Share
        </button>
      )}

      <button
        onClick={shareToTwitter}
        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        title="Share on Twitter"
      >
        <Twitter className="h-4 w-4" />
      </button>

      <button
        onClick={shareToFacebook}
        className="p-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
        title="Share on Facebook"
      >
        <Facebook className="h-4 w-4" />
      </button>

      <button
        onClick={shareToLinkedIn}
        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        title="Share on LinkedIn"
      >
        <Linkedin className="h-4 w-4" />
      </button>

      <button
        onClick={handleCopyLink}
        className={`p-2 rounded-lg transition-all ${copied
            ? 'bg-green-500 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        title="Copy link"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}
