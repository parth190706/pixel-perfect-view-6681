import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Intro } from "@/components/birthday/Intro";
import { ChapterRoom } from "@/components/birthday/ChapterRoom";
import { ChapterSky } from "@/components/birthday/ChapterSky";
import { ChapterClock } from "@/components/birthday/ChapterClock";
import { ChapterGarden } from "@/components/birthday/ChapterGarden";
import { ChapterWish } from "@/components/birthday/ChapterWish";
import { ChapterBox } from "@/components/birthday/ChapterBox";
import { Finale } from "@/components/birthday/Finale";
import { Whisper } from "@/components/birthday/story";
import { isMuted, setMuted, sfx, startAudio, stopAudio } from "@/lib/birthday-audio";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "A Birthday You Can Explore — For My Sister" },
      {
        name: "description",
        content:
          "A quiet, hand-made interactive birthday story in seven little chapters: a spark, a sky, a stopped clock, a garden of notes, a wish machine and one last candle.",
      },
      { property: "og:title", content: "A Birthday You Can Explore" },
      {
        property: "og:description",
        content: "Seven small chapters, made for one person. Tap, pull, water, wish, and blow out the candles.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BirthdayExperience,
});

const CHAPTERS = ["intro", "room", "sky", "clock", "garden", "wish", "box", "finale"] as const;

function BirthdayExperience() {
  const [step, setStep] = useState(0);
  const [muteState, setMuteState] = useState(false);
  const [whisper, setWhisper] = useState<string | null>(null);
  const [fading, setFading] = useState(false);

  // Audio can only start from a real gesture on mobile.
  useEffect(() => {
    const kick = () => {
      startAudio();
      window.removeEventListener("pointerdown", kick);
    };
    window.addEventListener("pointerdown", kick, { once: true });
    return () => {
      window.removeEventListener("pointerdown", kick);
      stopAudio();
    };
  }, []);

  const next = useCallback(() => {
    setFading(true);
    window.setTimeout(() => {
      setStep((s) => Math.min(s + 1, CHAPTERS.length - 1));
      setFading(false);
    }, 620);
  }, []);

  const onDiscover = useCallback((text: string) => setWhisper(text), []);
  const scene = CHAPTERS[step];

  return (
    <main className="relative min-h-[100svh] w-full overflow-hidden bg-background">
      <div className={`transition-opacity duration-500 ${fading ? "opacity-0" : "opacity-100"}`}>
        {scene === "intro" ? <Intro onComplete={next} /> : null}
        {scene === "room" ? <ChapterRoom onComplete={next} onDiscover={onDiscover} /> : null}
        {scene === "sky" ? <ChapterSky onComplete={next} onDiscover={onDiscover} /> : null}
        {scene === "clock" ? <ChapterClock onComplete={next} onDiscover={onDiscover} /> : null}
        {scene === "garden" ? <ChapterGarden onComplete={next} onDiscover={onDiscover} /> : null}
        {scene === "wish" ? <ChapterWish onComplete={next} onDiscover={onDiscover} /> : null}
        {scene === "box" ? <ChapterBox onComplete={next} onDiscover={onDiscover} /> : null}
        {scene === "finale" ? <Finale onDiscover={onDiscover} /> : null}
      </div>

      <button
        type="button"
        aria-label={muteState ? "turn sound on" : "turn sound off"}
        onClick={() => {
          const nextMuted = !isMuted();
          setMuted(nextMuted);
          setMuteState(nextMuted);
          if (!nextMuted) {
            startAudio();
            sfx("tap");
          }
        }}
        className="touchable fixed top-4 right-4 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-card/55 backdrop-blur-md"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M4 10v4h3l4 3V7L7 10H4z" strokeLinejoin="round" />
          {muteState ? (
            <path d="M15 9l5 6M20 9l-5 6" strokeLinecap="round" />
          ) : (
            <path d="M15.5 9.5a4 4 0 0 1 0 5M18 7.5a7 7 0 0 1 0 9" strokeLinecap="round" />
          )}
        </svg>
      </button>

      {whisper ? <Whisper text={whisper} onGone={() => setWhisper(null)} /> : null}
    </main>
  );
}
