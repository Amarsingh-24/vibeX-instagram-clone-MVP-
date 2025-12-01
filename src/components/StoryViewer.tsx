import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type: string;
  created_at: string;
  expires_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
}

interface StoryViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stories: Story[];
  initialIndex: number;
}

export function StoryViewer({ open, onOpenChange, stories, initialIndex }: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, open]);

  const currentStory = stories[currentIndex];

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < stories.length - 1 ? prev + 1 : prev));
  };

  if (!currentStory) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-full h-screen p-0 bg-black/95 flex items-center justify-center">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-white hover:bg-white/10 z-50"
          onClick={() => onOpenChange(false)}
        >
          <X className="w-6 h-6" />
        </Button>

        {currentIndex > 0 && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 z-50"
            onClick={goToPrevious}
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>
        )}

        {currentIndex < stories.length - 1 && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 z-50"
            onClick={goToNext}
          >
            <ChevronRight className="w-8 h-8" />
          </Button>
        )}

        <div className="relative w-full h-full max-w-lg flex flex-col items-center justify-center">
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-40">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 ring-2 ring-white">
                <AvatarImage src={currentStory.profiles.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-sunset text-white">
                  {currentStory.profiles.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white font-semibold">{currentStory.profiles.username}</p>
                <p className="text-white/70 text-xs">
                  {new Date(currentStory.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {currentStory.media_type === "video" ? (
            <video
              src={currentStory.media_url}
              className="max-w-full max-h-full object-contain"
              controls
              autoPlay
            />
          ) : (
            <img
              src={currentStory.media_url}
              alt="Story"
              className="max-w-full max-h-full object-contain"
            />
          )}

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1 z-40">
            {stories.map((_, index) => (
              <div
                key={index}
                className={`h-1 rounded-full transition-all ${
                  index === currentIndex
                    ? "w-8 bg-white"
                    : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
