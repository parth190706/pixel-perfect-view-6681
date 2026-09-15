import { useRef, useState } from "react";
import { Motes, Narration, RevealCard, Stage } from "./story";
import { sfx } from "@/lib/birthday-audio";

type Props = { onComplete: () => void; onDiscover: (text: string) => void };

const MEMORIES = [
  "a kitchen at 1am",
  "that laugh you deny having",
  "a song we ruined together",
  "the day you didn't give up",
];

/** Chapter 3 — drag the hand; the world changes with the hour; midnight breaks it open. */
export function ChapterClock({ onComplete, onDiscover }: Props) {
  const [narrated, setNarrated] = useState(false);
  const [angle, setAngle] = useState(226); // stopped, somewhere in the afternoon
  const [turns, setTurns] = useState(0);
  const [midnight, setMidnight] = useState(false);
  const [memory, setMemory] = useState<string | null>(null);
  const faceRef = useRef<HTMLDivElement>(null);
  const last = useRef(226);
  const dragging = useRef(false);

  const setFromPointer = (e: React.PointerEvent) => {
    const box = faceRef.current?.getBoundingClientRect();
    if (!box) return;
    const cx = box.left + box.width / 2;
    const cy = box.top + box.height / 2;
    let a = (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI + 90;
    if (a < 0) a += 360;
    const prev = last.current;
    // crossing 12 o'clock clockwise counts as an hour turned
    if (prev > 300 && a < 60) {
      setTurns((t) => t + 1);
      sfx("chime");
      const m = MEMORIES[Math.floor(Math.random() * MEMORIES.length)] ?? MEMORIES[0]!;
      setMemory(m);
      window.setTimeout(() => setMemory(null), 2200);
    }
    last.current = a;
    setAngle(a);
  };

  const progress = Math.min(turns, 3) / 3;

  const finish = (e: React.PointerEvent) => {
    dragging.current = false;
    if (turns >= 3 && !midnight) {
      const a = last.current;
      if (a < 22 || a > 338) {
        sfx("complete");
        setMidnight(true);
        return;
      }
      onDiscover("almost. bring it back to the top.");
    }
    void e;
  };

  const bg = midnight
    ? "var(--sky-night)"
    : `linear-gradient(180deg, oklch(${0.95 - progress * 0.22} ${0.03 + progress * 0.03} ${80 - progress * 40}) 0%, oklch(${0.9 - progress * 0.3} ${0.04 + progress * 0.02} ${40 + progress * 220}) 100%)`;

  return (
    <Stage background={bg}>
      {midnight ? <Motes count={22} tone="silver" /> : <Motes count={12} />}

      {/* lights that turn on as time moves */}
      <div className="pointer-events-none absolute inset-x-0 top-6 flex justify-around px-6">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="h-3 w-3 rounded-full transition-all duration-700"
            style={{
              background: "oklch(0.93 0.11 88)",
              opacity: progress > i / 5 || midnight ? 0.95 : 0.12,
              boxShadow: progress > i / 5 || midnight ? "var(--glow-gold)" : "none",
            }}
          />
        ))}
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center">
        <div
          ref={faceRef}
          onPointerDown={(e) => {
            dragging.current = true;
            (e.target as Element).setPointerCapture?.(e.pointerId);
            setFromPointer(e);
          }}
          onPointerMove={(e) => dragging.current && setFromPointer(e)}
          onPointerUp={finish}
          onPointerCancel={finish}
          className="relative h-72 w-72 rounded-full"
          style={{ touchAction: "none" }}
        >
          <div
            className="absolute inset-0 rounded-full border-[10px]"
            style={{
              borderColor: midnight ? "oklch(0.72 0.09 88)" : "oklch(0.76 0.07 55)",
              background: midnight
                ? "radial-gradient(circle at 50% 40%, oklch(0.36 0.06 285), oklch(0.27 0.05 280))"
                : "radial-gradient(circle at 50% 40%, oklch(0.985 0.02 85), oklch(0.93 0.03 70))",
              boxShadow: "var(--shadow-soft)",
            }}
          />
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className="absolute top-1/2 left-1/2 h-3 w-1 rounded"
              style={{
                background: midnight ? "oklch(0.86 0.08 88)" : "oklch(0.6 0.04 40)",
                transform: `rotate(${i * 30}deg) translateY(-120px)`,
                opacity: i === 0 ? 1 : 0.5,
              }}
            />
          ))}
          {/* short hand, follows along slowly */}
          <span
            className="absolute top-1/2 left-1/2 h-16 w-2 origin-bottom rounded-full"
            style={{
              background: midnight ? "oklch(0.9 0.05 88)" : "oklch(0.45 0.04 30)",
              transform: `translate(-50%,-100%) rotate(${angle / 12 + turns * 30}deg)`,
              transformOrigin: "50% 100%",
            }}
          />
          {/* long hand, the one she drags */}
          <span
            className="absolute top-1/2 left-1/2 h-28 w-1.5 origin-bottom rounded-full transition-transform duration-75"
            style={{
              background: midnight ? "oklch(0.93 0.11 88)" : "oklch(0.62 0.11 18)",
              transform: `translate(-50%,-100%) rotate(${angle}deg)`,
              transformOrigin: "50% 100%",
              filter: turns >= 3 ? "drop-shadow(0 0 10px oklch(0.9 0.12 88))" : undefined,
            }}
          />
          <span className="absolute top-1/2 left-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[oklch(0.72_0.09_60)]" />
        </div>

        {memory ? (
          <p className="animate-rise-in mt-8 font-hand text-xl text-foreground/70">{memory}</p>
        ) : (
          <p className="mt-8 font-body text-[0.66rem] tracking-[0.28em] text-foreground/45 uppercase">
            {turns >= 3 ? "now bring it to midnight" : "turn time forward"}
          </p>
        )}

        <div className="absolute inset-x-0 bottom-10">
          {!narrated ? (
            <Narration
              lines={[
                "Every birthday has one problem.",
                "Time moves way too quickly.",
                "So this clock stopped. Drag the long hand.",
              ]}
              onDone={() => setNarrated(true)}
            />
          ) : null}
        </div>
      </div>

      {midnight ? (
        <RevealCard
          eyebrow="Chapter III · midnight"
          title="Some moments deserve to be paused."
          body={[
            "Especially the ones that make us happy.",
            "You are allowed to sit inside a good day a little longer than necessary.",
            "This one is yours. Nobody is rushing you out of it.",
          ]}
          reward={{ glyph: "◔", label: "a moment to keep" }}
          onContinue={onComplete}
        />
      ) : null}
    </Stage>
  );
}
