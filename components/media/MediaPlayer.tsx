"use client";

import { ExternalEmbedFrame } from "@/components/media/ExternalEmbedFrame";
import { PlaybackTheater } from "@/components/media/PlaybackTheater";
import type { MediaType, SeasonSummary } from "@/types/media";

type TitleMediaPlayerProps = {
  variant?: "title";
  open: boolean;
  onClose: () => void;
  mediaType: MediaType;
  mediaId: string;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  seasons?: SeasonSummary[];
};

type EmbedMediaPlayerProps = {
  variant: "embed";
  src: string;
  title: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
};

export type MediaPlayerProps = TitleMediaPlayerProps | EmbedMediaPlayerProps;

export function MediaPlayer(props: MediaPlayerProps) {
  if (props.variant === "embed") {
    return (
      <ExternalEmbedFrame
        src={props.src}
        title={props.title}
        className={props.className}
        onLoad={props.onLoad}
        onError={props.onError}
      />
    );
  }

  return <PlaybackTheater {...props} />;
}
