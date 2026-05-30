import { X, MessageCircle, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ShareModal({ chapter, onClose }) {
  const shareUrl = window.location.href;
  const shareText = `Check out "${chapter.title}" on Soul Print! Feed Your Soul With Words`;

  const platforms = [
    {
      name: "WhatsApp",
      color: "bg-green-500",
      emoji: "💬",
      url: `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`,
    },
    {
      name: "Facebook",
      color: "bg-blue-600",
      emoji: "📘",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "Twitter",
      color: "bg-gray-900",
      emoji: "𝕏",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "TikTok",
      color: "bg-pink-500",
      emoji: "🎵",
      url: null,
    },
  ];

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard!");
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-t-2xl w-full max-w-lg p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-semibold">Share Chapter</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {platforms.map((p) => (
            <a
              key={p.name}
              href={p.url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              onClick={
                !p.url
                  ? (e) => {
                      e.preventDefault();
                      toast("Copy the link and share on " + p.name + "!");
                      copyLink();
                    }
                  : undefined
              }
              className="flex flex-col items-center gap-2"
            >
              <div
                className={`w-14 h-14 rounded-full ${p.color} flex items-center justify-center text-white text-xl`}
              >
                {p.emoji}
              </div>
              <span className="text-xs font-medium">{p.name}</span>
            </a>
          ))}
        </div>
        <Button variant="outline" className="w-full rounded-xl" onClick={copyLink}>
          <Copy className="h-4 w-4 mr-2" /> Copy Link
        </Button>
      </div>
    </div>
  );
}