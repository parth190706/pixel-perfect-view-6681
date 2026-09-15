import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { sfx } from "@/lib/birthday-audio";

/** Sequenced narration lines. Tap anywhere to move on early. */
export function Narration({
  lines,
  onDone,
  hold = 2400,
  className = "",
}: {
  lines: string[];
  onDone?: () => void;
  hold?: number;
  className?: string;
}) {
  const [i, setI] = useState(0);
  const doneRef = useRef(false);

  const advance = useCallback(() => {
    if (i + 1 >= lines.length) {
      if (!doneRef.current) {
        doneRef.current = true;
        onDone?.();
      }
      return;
    }
    sfx("page");
    setI(i + 1);
  }, [i, lines.length, onDone]);

  useEffect(() => {
    const t = window.setTimeout(advance, hold);
    return () => window.clearTimeout(t);
  }, [i, advance, hold]);

  return (
    <button
      type="button"
      aria-label="continue"
      onClick={advance}
      className={`touchable block w-full px-8 text-center ${className}`}
    >
      <span
        key={i}
        className="story-line animate-rise-in block text-[1.65rem] text-foreground/85 drop-shadow-[0_1px_0_oklch(1_0_0_/_0.6)]"
      >
        {lines[i]}
      </span>
    </button>
  );
}

/** The payoff card: a note / poem / blessing plus the little keepsake. */
export function RevealCard({
  eyebrow,
  title,
  body,
  reward,
  cta = "continue",
  onContinue,
}: {
  eyebrow?: string;
  title: string;
  body: string[];
  reward?: { glyph: ReactNode; label: string };
  cta?: string;
  onContinue: () => void;
}) {
  useEffect(() => {
    sfx("paper");
    const t = window.setTimeout(() => sfx("chime"), 320);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-night/45 px-5 backdrop-blur-[3px]">
      <div className="paper-card animate-rise-in scene-grain w-full max-w-sm overflow-hidden px-7 py-8">
        {eyebrow ? (
          <p className="font-body text-[0.62rem] tracking-[0.32em] text-muted-foreground uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="story-line mt-2 text-3xl text-foreground">{title}</h2>
        <div className="mt-5 space-y-3">
          {body.map((line, idx) => (
            <p
              key={idx}
              className="font-hand text-[1.32rem] leading-snug text-foreground/80"
              style={{ animation: `rise-in 0.6s ${0.15 + idx * 0.18}s both` }}
            >
              {line}
            </p>
          ))}
        </div>

        {reward ? (
          <div className="mt-7 flex items-center gap-3 rounded-2xl bg-gold/15 px-4 py-3">
            <span className="animate-glow-pulse text-2xl leading-none">{reward.glyph}</span>
            <span className="font-body text-[0.66rem] tracking-[0.24em] text-foreground/70 uppercase">
              {reward.label}
            </span>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => {
            sfx("page");
            onContinue();
          }}
          className="touchable mt-7 w-full rounded-full bg-primary py-4 font-body text-sm tracking-[0.18em] text-primary-foreground uppercase transition-transform active:scale-[0.97]"
        >
          {cta}
        </button>
      </div>
    </div>
  );
}

/** A tiny "you found something" whisper for the hidden discoveries. */
export function Whisper({ text, onGone }: { text: string; onGone: () => void }) {
  useEffect(() => {
    sfx("sparkle");
    const t = window.setTimeout(onGone, 2600);
    return () => window.clearTimeout(t);
  }, [onGone]);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-8">
      <p className="animate-rise-in rounded-full bg-card/85 px-5 py-2 text-center font-hand text-lg text-foreground/80 shadow-[var(--shadow-soft)] backdrop-blur">
        {text}
      </p>
    </div>
  );
}

/** Ambient floating motes; generated after mount so SSR and client agree. */
export function Motes({ count = 14, tone = "gold" }: { count?: number; tone?: "gold" | "silver" }) {
  const [seeds, setSeeds] = useState<
    Array<{ left: number; delay: number; dur: number; size: number; op: number }>
  >([]);

  useEffect(() => {
    setSeeds(
      Array.from({ length: count }, () => ({
        left: Math.random() * 100,
        delay: Math.random() * 14,
        dur: 16 + Math.random() * 14,
        size: 3 + Math.random() * 5,
        op: 0.35 + Math.random() * 0.45,
      })),
    );
  }, [count]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {seeds.map((s, i) => (
        <span
          key={i}
          className="absolute bottom-0 rounded-full"
          style={{
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            opacity: s.op,
            background:
              tone === "gold"
                ? "radial-gradient(circle, oklch(0.93 0.11 88), transparent 70%)"
                : "radial-gradient(circle, oklch(0.98 0.02 260), transparent 70%)",
            animation: `drift-up ${s.dur}s linear ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/** Scene shell: full-height portrait stage with a background layer. */
export function Stage({
  background,
  children,
  className = "",
}: {
  background: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`scene-grain relative flex min-h-[100svh] w-full flex-col overflow-hidden transition-[background] duration-1000 ${className}`}
      style={{ background }}
    >
      {children}
    </div>
  );
}

/** Pointer drag helper returning client coords, works for touch + mouse. */
export function useDrag(onMove: (x: number, y: number) => void, onEnd?: () => void) {
  const active = useRef(false);
  const start = useCallback(
    (e: React.PointerEvent) => {
      active.current = true;
      (e.target as Element).setPointerCapture?.(e.pointerId);
      onMove(e.clientX, e.clientY);
    },
    [onMove],
  );
  const move = useCallback(
    (e: React.PointerEvent) => {
      if (!active.current) return;
      onMove(e.clientX, e.clientY);
    },
    [onMove],
  );
  const end = useCallback(() => {
    if (!active.current) return;
    active.current = false;
    onEnd?.();
  }, [onEnd]);

  return {
    onPointerDown: start,
    onPointerMove: move,
    onPointerUp: end,
    onPointerCancel: end,
    style: { touchAction: "none" as const },
  };
}
