"use client";

export function ExternalEmbedFrame({
  src,
  title,
  className,
  onLoad,
  onError,
}: {
  src: string;
  title: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}) {
  return (
    <iframe
      src={src}
      title={title}
      className={className ?? "h-full w-full"}
      allow="fullscreen; picture-in-picture; encrypted-media"
      allowFullScreen
      referrerPolicy="no-referrer"
      onLoad={onLoad}
      onError={onError}
    />
  );
}
