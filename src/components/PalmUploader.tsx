import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, ImageUp, Loader2, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Props = {
  onImage: (dataUrl: string) => void;
  imageUrl: string | null;
  onClear: () => void;
  busy?: boolean;
};

const MAX_EDGE = 1024;

async function fileToResizedDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.9);
}

export function PalmUploader({ onImage, imageUrl, onClear, busy }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [dragging, setDragging] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  }, []);

  useEffect(() => stopCamera, [stopCamera]);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Please choose an image file.");
        return;
      }
      try {
        onImage(await fileToResizedDataUrl(file));
      } catch {
        toast.error("That image could not be read.");
      }
    },
    [onImage],
  );

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      setCameraOn(true);
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play();
        }
      });
    } catch {
      toast.error("Camera access was denied.");
    }
  }, []);

  const capture = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const scale = Math.min(1, MAX_EDGE / Math.max(video.videoWidth, video.videoHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
    onImage(canvas.toDataURL("image/jpeg", 0.9));
    stopCamera();
  }, [onImage, stopCamera]);

  if (cameraOn) {
    return (
      <div className="surface-panel overflow-hidden p-3">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video ref={videoRef} playsInline muted className="w-full rounded-xl bg-muted" />
        <div className="mt-3 flex gap-2">
          <Button onClick={capture} className="flex-1">
            <Camera className="mr-2 size-4" /> Capture palm
          </Button>
          <Button variant="secondary" onClick={stopCamera}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  if (imageUrl) {
    return (
      <div className="surface-panel relative overflow-hidden p-3">
        <img src={imageUrl} alt="Selected palm photograph" className="w-full rounded-xl" />
        <div className="mt-3 flex gap-2">
          <Button variant="secondary" onClick={onClear} disabled={busy} className="flex-1">
            <RefreshCw className="mr-2 size-4" /> Choose another
          </Button>
        </div>
        {busy && (
          <div className="absolute inset-0 grid place-items-center bg-background/70 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm text-primary">
              <Loader2 className="size-4 animate-spin" /> Segmenting palm…
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) void handleFile(file);
      }}
      className={cn(
        "surface-panel flex flex-col items-center justify-center gap-4 px-6 py-12 text-center transition-all",
        dragging && "border-primary ring-2 ring-ring",
      )}
    >
      <div className="animate-orbit grid size-16 place-items-center rounded-full border border-primary/40 text-2xl text-primary">
        ✋
      </div>
      <div>
        <p className="font-display text-lg">Offer your dominant palm</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Drag &amp; drop a photo, browse, or capture live. Open hand, even light, fingers apart.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Button onClick={() => inputRef.current?.click()}>
          <ImageUp className="mr-2 size-4" /> Browse image
        </Button>
        <Button variant="secondary" onClick={() => void startCamera()}>
          <Camera className="mr-2 size-4" /> Use camera
        </Button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />
      {dragging && <X className="sr-only" />}
    </div>
  );
}
