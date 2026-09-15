import { useRef, useState } from "react";
import { Motes, Narration, RevealCard, Stage } from "./story";
import { sfx } from "@/lib/birthday-audio";

type Props = { onComplete: () => void; onDiscover: (text: string) => void };

const MEMORY_ITEMS = [
  { id: "spark", glyph: "✦", say: "the first little spark. you caught it." },
  { id: "balloon", glyph: "◍", say: "the balloon that came down for you." },
  { id: "clock", glyph: "◔", say: "midnight. the moment you kept." },
  { id: "flower", glyph: "❁", say: "the flower that needed watering first." },
  { id: "wish", glyph: "☾", say: "your wish. already sent, quietly." },
];

export function ChapterBox({ onComplete, onDiscover }: Props) {
  const [narrated, setNarrated] = useState(false);
  const [spin, setSpin] = useState(-24);
  const [foundNote, setFoundNote] = useState(false);
  const [lookAround, setLookAround] = useState(false);
  const [touchedItems, setTouchedItems] = useState<string[]>([]);
  const [opened, setOpened] = useState(false);
  const dragging = useRef(false);
  const lastX = useRef(0);

  const start = (e: React.PointerEvent) => {
    dragging.current = true;
    lastX.current = e.clientX;
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const move = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastX.current;
    lastX.current = e.clientX;
    setSpin((s) => {
      const next = s + dx * 0.6;
      const norm = ((next % 360) + 360) % 360;
      if (!foundNote && norm > 150 && norm < 210) {
        setFoundNote(true);
        sfx("paper");
      }
      return next;
    });
  };
  const end = () => {
    dragging.current = false;
  };

  const allTouched = touchedItems.length === MEMORY_ITEMS.length;

  return (
    <Stage background="linear-gradient(180deg, oklch(0.35 0.055 285) 0%, oklch(0.26 0.05 280) 100%)">
      <Motes count={18} tone="silver" />

      <div className="relative flex flex-1 flex-col items-center justify-center gap-10">
        <div
          className="relative h-56 w-56"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
          style={{ perspective: "800px", touchAction: "none" }}
        >
          <div
            className="relative h-full w-full transition-transform duration-100"
            style={{ transformStyle: "preserve-3d", transform: `rotateX(-12deg) rotateY(${spin}deg)` }}
          >
            {[0, 90, 180, 270].map((face) => (
              <div
                key={face}
                className="absolute inset-0 rounded-lg"
                style={{
                  transform: `rotateY(${face}deg) translateZ(112px)`,
                  background:
                    face === 180
                      ? "linear-gradient(160deg, oklch(0.96 0.02 85), oklch(0.9 0.03 70))"
                      : "linear-gradient(160deg, oklch(0.88 0.06 14), oklch(0.78 0.07 12))",
                  boxShadow: "inset 0 0 40px oklch(0.3 0.04 20 / .35)",
                }}
              >
                {face === 180 ? (
                  <p className="flex h-full items-center justify-center px-5 text-center font-hand text-lg text-foreground/75">
                    “the box isn't the gift. keep going.”
                  </p>
                ) : (
                  <>
                    <span className="absolute inset-y-0 left-1/2 w-6 -translate-x-1/2 bg-[oklch(0.93_0.09_88/.85)]" />
                    <span className="absolute inset-x-0 top-1/2 h-6 -translate-y-1/2 bg-[oklch(0.93_0.09_88/.85)]" />
                  </>
                )}
              </div>
            ))}
            {/* lid bow */}
            <div
              className="absolute -top-6 left-1/2 h-16 w-16 -translate-x-1/2 rounded-full"
              style={{
                transform: "translateX(-50%) translateZ(60px)",
                background: "radial-gradient(circle, oklch(0.93 0.09 88), oklch(0.82 0.1 70))",
                boxShadow: "var(--glow-gold)",
              }}
            />
          </div>
        </div>

        {!narrated ? (
          <Narration
            lines={[
              "You've collected almost everything.",
              "But something is still missing.",
              "Turn the box around. Slowly.",
            ]}
            className="[&_span]:text-[oklch(0.95_0.02_285)]"
            onDone={() => setNarrated(true)}
          />
        ) : !foundNote ? (
          <p className="font-body text-[0.66rem] tracking-[0.28em] text-[oklch(0.86_0.03_285)] uppercase">
            drag to spin it
          </p>
        ) : !lookAround ? (
          <div className="animate-rise-in px-8 text-center">
            <p className="story-line text-2xl text-[oklch(0.95_0.02_285)]">Before you open this…</p>
            <button
              type="button"
              onClick={() => {
                sfx("sparkle");
                setLookAround(true);
              }}
              className="touchable mt-6 rounded-full border border-[oklch(0.9_0.09_88/.6)] px-8 py-3 font-body text-xs tracking-[0.22em] text-[oklch(0.93_0.06_88)] uppercase active:scale-95"
            >
              look around
            </button>
          </div>
        ) : (
          <div className="w-full px-6 text-center">
            <div className="flex flex-wrap justify-center gap-4">
              {MEMORY_ITEMS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  aria-label={m.id}
                  onClick={() => {
                    sfx("chime");
                    onDiscover(m.say);
                    setTouchedItems((t) => (t.includes(m.id) ? t : [...t, m.id]));
                  }}
                  className="touchable animate-float-soft h-14 w-14 rounded-full text-2xl transition-opacity"
                  style={{
                    background: "oklch(0.95 0.03 285 / .1)",
                    color: "oklch(0.93 0.09 88)",
                    opacity: touchedItems.includes(m.id) ? 0.45 : 1,
                    boxShadow: touchedItems.includes(m.id) ? "none" : "var(--glow-gold)",
                  }}
                >
                  {m.glyph}
                </button>
              ))}
            </div>
            {allTouched ? (
              <button
                type="button"
                onClick={() => {
                  sfx("complete");
                  setOpened(true);
                }}
                className="touchable animate-rise-in mt-8 rounded-full bg-[oklch(0.93_0.09_88)] px-10 py-4 font-body text-xs tracking-[0.24em] text-[oklch(0.28_0.05_280)] uppercase active:scale-95"
              >
                okay. now open it
              </button>
            ) : (
              <p className="mt-6 font-body text-[0.64rem] tracking-[0.26em] text-[oklch(0.85_0.03_285)] uppercase">
                touch each one · {touchedItems.length}/5
              </p>
            )}
          </div>
        )}
      </div>

      {opened ? (
        <RevealCard
          eyebrow="Chapter VI"
          title="It was never the box."
          body={[
            "It was the whole hour you just spent letting somebody make a fuss over you.",
            "There's one more room. It's yours.",
          ]}
          reward={{ glyph: "❧", label: "the last little thing" }}
          cta="go in"
          onContinue={onComplete}
        />
      ) : null}
    </Stage>
  );
}
