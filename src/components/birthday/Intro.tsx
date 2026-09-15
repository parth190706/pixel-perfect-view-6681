import { useState } from "react";
import { Motes, Narration, Stage } from "./story";
import { sfx } from "@/lib/birthday-audio";

export function Intro({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"whisper" | "invite" | "opened">("whisper");

  return (
    <Stage background="var(--sky-morning)" className="justify-between">
      {/* sunlight */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "conic-gradient(from 200deg at 78% -8%, oklch(0.98 0.07 88 / 0.55), transparent 28%)",
        }}
      />
      {/* window + curtains */}
      <div className="relative mx-auto mt-10 w-[78%] max-w-xs">
        <svg viewBox="0 0 200 200" className="w-full">
          <rect x="26" y="10" width="148" height="150" rx="10" fill="oklch(0.96 0.05 86 / 0.75)" />
          <path d="M100 12v146M28 86h144" stroke="oklch(0.86 0.03 60)" strokeWidth="3" />
          <rect
            x="26"
            y="10"
            width="148"
            height="150"
            rx="10"
            fill="none"
            stroke="oklch(0.78 0.04 50)"
            strokeWidth="5"
          />
        </svg>
        <div className="animate-curtain absolute top-1 -left-2 h-[86%] w-16 rounded-b-[60%] bg-[linear-gradient(100deg,oklch(0.94_0.04_20/.95),oklch(0.88_0.06_18/.8))]" />
        <div
          className="animate-curtain absolute top-1 -right-2 h-[86%] w-16 rounded-b-[60%] bg-[linear-gradient(260deg,oklch(0.94_0.04_20/.95),oklch(0.88_0.06_18/.8))]"
          style={{ animationDelay: "-3s" }}
        />
      </div>

      {/* table + envelope */}
      <div className="relative mt-2 flex flex-1 flex-col items-center justify-end pb-12">
        <div className="relative flex w-full flex-col items-center">
          {phase !== "opened" ? (
            <button
              type="button"
              aria-label="open the envelope"
              onClick={() => {
                if (phase !== "invite") return;
                sfx("paper");
                setPhase("opened");
              }}
              className={`touchable relative mb-6 w-44 transition-transform duration-500 ${
                phase === "invite" ? "animate-glow-pulse scale-105" : "opacity-90"
              }`}
            >
              <svg viewBox="0 0 200 130" className="w-full drop-shadow-[var(--shadow-soft)]">
                <rect x="4" y="8" width="192" height="118" rx="8" fill="oklch(0.985 0.02 85)" />
                <path d="M4 16 100 82 196 16" fill="none" stroke="oklch(0.85 0.05 40)" strokeWidth="4" />
                <circle cx="100" cy="86" r="15" fill="oklch(0.72 0.12 18)" />
                <path
                  d="M94 86l5 5 8-9"
                  stroke="oklch(0.99 0.01 85)"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          ) : (
            <div className="animate-rise-in mb-8 w-full max-w-sm px-8 text-center">
              <p className="story-line text-2xl text-foreground/85">“I made you something.”</p>
              <p className="story-line mt-4 text-xl text-foreground/70">
                Not a gift you can unwrap…
              </p>
              <p className="story-line mt-1 text-xl text-foreground/70">…but one you can explore.</p>
              <button
                type="button"
                onClick={() => {
                  sfx("complete");
                  onComplete();
                }}
                className="touchable mt-10 rounded-full bg-primary px-10 py-4 font-body text-sm tracking-[0.2em] text-primary-foreground uppercase transition-transform active:scale-95"
              >
                open it →
              </button>
            </div>
          )}

          <div className="h-24 w-full bg-[linear-gradient(180deg,oklch(0.83_0.06_45),oklch(0.74_0.06_40))] shadow-[0_-14px_30px_-18px_oklch(0.35_0.04_25/.6)]" />
        </div>

        {phase === "whisper" ? (
          <div className="absolute inset-x-0 top-2">
            <Narration
              lines={["psst…", "birthday girl.", "today is a little different."]}
              hold={2000}
              onDone={() => setPhase("invite")}
            />
          </div>
        ) : null}
        {phase === "invite" ? (
          <p className="animate-rise-in absolute inset-x-0 top-4 text-center font-body text-[0.7rem] tracking-[0.3em] text-foreground/50 uppercase">
            tap the envelope
          </p>
        ) : null}
      </div>

      <Motes count={12} />
    </Stage>
  );
}
