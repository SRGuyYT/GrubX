"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Play, X } from "lucide-react";
import { cn } from "@/lib/cn";

const LIVE_CHANNELS = [
  {
    id: "jfKfPfyJRdk",
    title: "Lofi Hip Hop Radio",
    category: "Music",
    image: "https://img.youtube.com/vi/jfKfPfyJRdk/maxresdefault.jpg",
    description: "beats to relax/study to",
  },
  {
    id: "21X5lGlDOfg",
    title: "NASA Live",
    category: "Science",
    image: "https://img.youtube.com/vi/21X5lGlDOfg/maxresdefault.jpg",
    description: "Official stream of NASA TV",
  },
  {
    id: "S42-rA_1zY4",
    title: "Sky News Live",
    category: "News",
    image: "https://img.youtube.com/vi/S42-rA_1zY4/maxresdefault.jpg",
    description: "Breaking news, alerts and live coverage",
  },
  {
    id: "O2XjIqfKOfM",
    title: "Monstercat",
    category: "Music",
    image: "https://img.youtube.com/vi/O2XjIqfKOfM/maxresdefault.jpg",
    description: "Electronic Music 24/7",
  },
];

export default function LiveTVPage() {
  const [activeStream, setActiveStream] = useState<string | null>(null);
  const activeChannel = LIVE_CHANNELS.find((c) => c.id === activeStream);

  useEffect(() => {
    if (activeStream) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [activeStream]);

  return (
    <div className="pb-12">
      <section className="relative overflow-hidden border-b border-white/8">
        <div className="absolute inset-0 bg-gradient-to-r from-[#05070b] via-[#05070bf2] to-[#05070b30]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070b] via-[#05070b99] to-[#05070b80]" />
        
        <div className="page-shell relative z-10 py-10 md:py-16">
          <div className="liquid-glass rounded-[2rem] px-6 py-7 md:px-8 md:py-10">
            <p className="mb-4 text-xs uppercase tracking-[0.32em] text-[var(--muted)]">Live TV</p>
            <h1 className="text-4xl font-semibold leading-none sm:text-5xl md:text-6xl">
              Always On
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-lg">
              Tune into 24/7 streaming networks including news, music, games, and science. 
              Live streams are delivered directly to your device.
            </p>
          </div>
        </div>
      </section>

      <section className="page-shell mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {LIVE_CHANNELS.map((channel) => (
          <article 
            key={channel.id} 
            onClick={() => setActiveStream(channel.id)}
            className="group relative flex cursor-pointer flex-col overflow-hidden rounded-[1.6rem] transition-transform duration-300 hover:scale-[1.02]"
          >
            <div className="liquid-glass-soft flex h-full flex-col">
              <div className="relative aspect-video w-full overflow-hidden">
                <Image
                  src={channel.image}
                  alt={channel.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />
                <div className="absolute right-3 top-3 rounded-full bg-red-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg shadow-red-500/30">
                  <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-white align-middle" />
                  Live
                </div>
                
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent)] text-black shadow-lg shadow-[var(--accent)]/30">
                    <Play className="h-6 w-6 fill-current" />
                  </div>
                </div>

                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="mb-1 text-xs uppercase tracking-wider text-[var(--accent)]">{channel.category}</p>
                  <h3 className="truncate text-lg font-semibold text-white">{channel.title}</h3>
                </div>
              </div>
              <div className="p-4">
                <p className="line-clamp-2 text-sm text-[var(--muted)]">{channel.description}</p>
              </div>
            </div>
          </article>
        ))}
      </section>

      {activeStream && activeChannel && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center bg-black/88 px-4 py-4 backdrop-blur-md">
          <button 
            type="button" 
            className="absolute inset-0" 
            onClick={() => setActiveStream(null)}
            aria-label="Close"
          />
          <div className="liquid-glass relative z-[86] flex h-[min(88vh,880px)] w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] p-4">
            <div className="relative flex h-full flex-col overflow-hidden rounded-[1.4rem] border border-white/10 bg-black">
              <div className="relative z-10 flex items-center justify-between border-b border-white/10 bg-[#0d1117]/90 px-5 py-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">Live Stream</p>
                  <h3 className="text-2xl font-semibold text-white">{activeChannel.title}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveStream(null)}
                  className="rounded-full border border-white/10 bg-black/45 p-3 text-[var(--muted)] transition hover:text-white"
                >
                  <X className="size-5" />
                </button>
              </div>
              <div className="relative flex-1 bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${activeStream}?autoplay=1&live_stream=1`}
                  title={activeChannel.title}
                  className="absolute inset-0 h-full w-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
