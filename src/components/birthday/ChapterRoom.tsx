import { useRef, useState } from "react";
import { Motes, Narration, RevealCard, Stage } from "./story";
import { sfx } from "@/lib/birthday-audio";

type Props = { onComplete: () => void; onDiscover: (text: string) => void };

/** Chapter 1 — a room that wakes up under her fingers, then one spark to catch. */
export function ChapterRoom({ onComplete, onDiscover }: Props) {
  const [narrated, setNarrated] = useState(false);
  const [touched, setTouched] = useState<string[]>([]);
  const [sparkPos, setSparkPos] = useState({ x: 50, y: 62 });
  const [sparkTaps, setSparkTaps] = useState(0);
  const [caught, setCaught] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  const alive = touched.length;
  const sparkReady = alive >= 3;

  const touch = (id: string, sound: "tap" | "bloom" | "chime" | "sparkle" = "tap") => {
    sfx(sound);
    setTouched((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const chaseSpark = (e: React.PointerEvent) => {
    if (!sparkReady || caught) return;
    const box = stageRef.current?.getBoundingClientRect();
    if (!box) return;
    const x = ((e.clientX - box.left) / box.width) * 100;
    const y = ((e.clientY - box.top) / box.height) * 100;
    const dx = x - sparkPos.x;
    const dy = y - sparkPos.y;
    if (Math.hypot(dx, dy) < 9) {
      sfx("sparkle");
      const next = sparkTaps + 1;
      setSparkTaps(next);
      if (next >= 3) {
        sfx("complete");
        setCaught(true);
        return;
      }
    }
    // it drifts near her finger, never exactly under it
    setSparkPos({
      x: Math.min(88, Math.max(12, x + (Math.random() * 30 - 15))),
      y: Math.min(82, Math.max(24, y + (Math.random() * 24 - 12))),
    });
  };

  const warmth = Math.min(alive, 5) / 5;

  return (
    <Stage
      background={`linear-gradient(180deg, oklch(${0.93 + warmth * 0.04} ${0.03 + warmth * 0.02} ${80 - warmth * 20}) 0%, oklch(${0.9 + warmth * 0.03} 0.04 ${35 + warmth * 10}) 100%)`}
    >
      <div ref={stageRef} onPointerDown={chaseSpark} className="relative flex-1" style={{ touchAction: "manipulation" }}>
        {/* curtains → sunlight */}
        <button
          type="button"
          aria-label="curtains"
          onClick={() => touch("curtain")}
          className="touchable animate-curtain absolute top-0 left-0 h-56 w-24 rounded-br-[70%] bg-[linear-gradient(100deg,oklch(0.93_0.04_18/.95),oklch(0.86_0.06_16/.85))]"
        />
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-1000"
          style={{
            opacity: touched.includes("curtain") ? 1 : 0,
            background:
              "conic-gradient(from 190deg at 12% -6%, oklch(0.98 0.08 88 / 0.6), transparent 26%)",
          }}
        />

        {/* window → stars */}
        <button
          type="button"
          aria-label="window"
          onClick={() => touch("window", "chime")}
          className="touchable absolute top-10 right-6 h-32 w-28 rounded-xl border-4 border-[oklch(0.8_0.04_50)] bg-[oklch(0.95_0.05_235/.6)]"
        >
          {touched.includes("window")
            ? Array.from({ length: 7 }).map((_, i) => (
                <span
                  key={i}
                  className="animate-twinkle absolute h-1.5 w-1.5 rounded-full bg-[oklch(0.99_0.03_90)]"
                  style={{
                    left: `${12 + Math.random() * 70}%`,
                    top: `${12 + Math.random() * 70}%`,
                    animationDelay: `${i * 0.25}s`,
                  }}
                />
              ))
            : null}
        </button>

        {/* hanging ribbon */}
        <button
          type="button"
          aria-label="ribbon"
          onClick={() => {
            touch("ribbon");
            onDiscover("the ribbon likes being pulled.");
          }}
          className="touchable absolute top-0 left-1/2 h-40 w-8 -translate-x-1/2"
        >
          <span
            className="block h-full w-1.5 origin-top bg-[oklch(0.82_0.1_18)] transition-transform duration-700"
            style={{ transform: touched.includes("ribbon") ? "rotate(9deg)" : "rotate(0deg)" }}
          />
        </button>

        {/* flower that opens */}
        <button
          type="button"
          aria-label="flower"
          onClick={() => touch("flower", "bloom")}
          className="touchable absolute bottom-32 left-8 w-24"
        >
          <svg viewBox="0 0 100 130" className="w-full">
            <path d="M50 130V64" stroke="oklch(0.62 0.09 145)" strokeWidth="5" />
            <path d="M50 96c-14-4-20-14-20-14s14-4 20 8" fill="oklch(0.7 0.1 145)" />
            <g
              style={{
                transition: "transform 900ms cubic-bezier(.3,.7,.2,1)",
                transformOrigin: "50px 60px",
                transform: touched.includes("flower") ? "scale(1)" : "scale(0.45)",
              }}
            >
              {[0, 72, 144, 216, 288].map((a) => (
                <ellipse
                  key={a}
                  cx="50"
                  cy="38"
                  rx="12"
                  ry="22"
                  fill="oklch(0.87 0.07 12)"
                  transform={`rotate(${a} 50 60)`}
                />
              ))}
              <circle cx="50" cy="60" r="10" fill="oklch(0.87 0.11 88)" />
            </g>
          </svg>
        </button>

        {/* music box */}
        <button
          type="button"
          aria-label="music box"
          onClick={() => {
            touch("music", "chime");
            onDiscover("a tiny tune, only three notes long.");
          }}
          className="touchable absolute right-10 bottom-32 w-24"
        >
          <svg viewBox="0 0 100 80" className="w-full">
            <rect x="10" y="26" width="80" height="44" rx="7" fill="oklch(0.74 0.07 45)" />
            <rect x="10" y="18" width="80" height="12" rx="5" fill="oklch(0.82 0.07 48)" />
            <circle cx="50" cy="48" r="9" fill="oklch(0.9 0.1 88)" />
          </svg>
          {touched.includes("music")
            ? [0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="absolute -top-2 left-1/2 text-lg text-foreground/45"
                  style={{ animation: `drift-up 3s ${i * 0.4}s ease-out`, left: `${35 + i * 14}%` }}
                >
                  ♪
                </span>
              ))
            : null}
        </button>

        {/* floor */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(180deg,oklch(0.82_0.05_45),oklch(0.72_0.05_40))]" />

        {/* the spark */}
        {sparkReady && !caught ? (
          <span
            className="pointer-events-none absolute h-5 w-5 rounded-full transition-all duration-500 ease-out"
            style={{
              left: `${sparkPos.x}%`,
              top: `${sparkPos.y}%`,
              background: "radial-gradient(circle, oklch(0.99 0.06 92), oklch(0.86 0.13 85 / 0.2) 65%, transparent)",
              boxShadow: "var(--glow-gold)",
              transform: `scale(${1 + sparkTaps * 0.35})`,
            }}
          />
        ) : null}

        <Motes count={16} />

        <div className="absolute inset-x-0 top-[46%]">
          {!narrated ? (
            <Narration
              lines={[
                "Every birthday starts with one little thing.",
                "The first birthday spark is somewhere in this room.",
                "Touch things. See what wakes up.",
              ]}
              onDone={() => setNarrated(true)}
            />
          ) : null}
        </div>

        {narrated && !caught ? (
          <p className="absolute inset-x-0 bottom-6 text-center font-body text-[0.66rem] tracking-[0.28em] text-foreground/45 uppercase">
            {sparkReady ? "something is following you" : `the room is waking up · ${alive}/3`}
          </p>
        ) : null}
      </div>

      {caught ? (
        <RevealCard
          eyebrow="Birthday Blessing I"
          title="You found the first little spark."
          body={[
            "May this year surprise you gently.",
            "May good things find you without always needing to be searched for.",
          ]}
          reward={{ glyph: "✦", label: "first spark" }}
          onContinue={onComplete}
        />
      ) : null}
    </Stage>
  );
}
