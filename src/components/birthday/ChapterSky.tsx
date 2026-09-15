import { useRef, useState } from "react";
import { Motes, Narration, RevealCard, Stage } from "./story";
import { sfx } from "@/lib/birthday-audio";

type Props = { onComplete: () => void; onDiscover: (text: string) => void };

type Balloon = {
  id: string;
  left: number;
  top: number;
  hue: string;
  drift: number;
  special?: boolean;
  reaction: string;
};

const BALLOONS: Balloon[] = [
  { id: "a", left: 16, top: 26, hue: "oklch(0.85 0.08 18)", drift: 0, reaction: "this one leans toward you." },
  { id: "b", left: 62, top: 16, hue: "oklch(0.86 0.06 300)", drift: 1, reaction: "it hides behind a cloud." },
  { id: "c", left: 38, top: 40, hue: "oklch(0.88 0.07 60)", drift: 2, reaction: "it changes its mind and drifts off." },
  { id: "d", left: 78, top: 38, hue: "oklch(0.87 0.05 235)", drift: 3, reaction: "it bumps into its neighbour." },
  { id: "e", left: 46, top: 60, hue: "oklch(0.9 0.09 88)", drift: 4, special: true, reaction: "" },
];

export function ChapterSky({ onComplete, onDiscover }: Props) {
  const [narrated, setNarrated] = useState(false);
  const [pull, setPull] = useState<Record<string, number>>({});
  const [nudged, setNudged] = useState<string[]>([]);
  const [opened, setOpened] = useState(false);
  const [released, setReleased] = useState(false);
  const startY = useRef(0);
  const dragging = useRef<string | null>(null);

  const begin = (e: React.PointerEvent, id: string) => {
    dragging.current = id;
    startY.current = e.clientY;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    sfx("tap");
  };

  const move = (e: React.PointerEvent) => {
    const id = dragging.current;
    if (!id) return;
    const d = Math.max(0, Math.min(260, e.clientY - startY.current));
    setPull((p) => ({ ...p, [id]: d }));
  };

  const end = () => {
    const id = dragging.current;
    dragging.current = null;
    if (!id) return;
    const d = pull[id] ?? 0;
    const b = BALLOONS.find((x) => x.id === id);
    if (b?.special && d > 130) {
      sfx("paper");
      setOpened(true);
      return;
    }
    if (b && !b.special && d > 40) {
      setNudged((prev) => (prev.includes(id) ? prev : [...prev, id]));
      onDiscover(b.reaction);
    }
    setPull((p) => ({ ...p, [id]: 0 }));
  };

  return (
    <Stage background="var(--sky-day)">
      {/* clouds */}
      {[
        { l: 6, t: 18, s: 1 },
        { l: 58, t: 10, s: 0.8 },
        { l: 30, t: 48, s: 1.2 },
      ].map((c, i) => (
        <div
          key={i}
          className="animate-float-soft pointer-events-none absolute rounded-full bg-[oklch(0.99_0.01_240/.75)] blur-[2px]"
          style={{
            left: `${c.l}%`,
            top: `${c.t}%`,
            width: 150 * c.s,
            height: 56 * c.s,
            animationDelay: `${i * 1.6}s`,
          }}
        />
      ))}

      <div className="relative flex-1" onPointerMove={move} onPointerUp={end} onPointerCancel={end}>
        {BALLOONS.map((b) => {
          const d = pull[b.id] ?? 0;
          const gone = released && !b.special;
          return (
            <div
              key={b.id}
              className="animate-float-soft absolute w-20"
              style={{
                left: `${b.left}%`,
                top: `${b.top}%`,
                transform: `translateY(${gone ? -900 : d}px)`,
                transition: dragging.current === b.id ? "none" : "transform 1.4s cubic-bezier(.2,.8,.2,1)",
                animationDelay: `${b.drift * 0.7}s`,
                opacity: nudged.includes(b.id) && !b.special ? 0.85 : 1,
              }}
            >
              <svg viewBox="0 0 80 190" className="w-full overflow-visible">
                <ellipse cx="40" cy="46" rx="32" ry="40" fill={b.hue} />
                <ellipse cx="30" cy="32" rx="9" ry="13" fill="oklch(1 0 0 / 0.35)" />
                <path d="M40 86l-6 8h12z" fill={b.hue} />
                <path
                  d="M40 94c8 22-10 34-2 52s-6 26 2 40"
                  stroke="oklch(0.72 0.06 40)"
                  strokeWidth="2.5"
                  fill="none"
                />
                {b.special ? (
                  <g>
                    <rect x="24" y="150" width="32" height="22" rx="3" fill="oklch(0.985 0.02 85)" />
                    <path d="M24 152l16 12 16-12" fill="none" stroke="oklch(0.84 0.06 40)" strokeWidth="2" />
                  </g>
                ) : null}
              </svg>
              {/* the ribbon: the actual grab target */}
              <button
                type="button"
                aria-label={b.special ? "pull the ribbon with the envelope" : "pull a ribbon"}
                onPointerDown={(e) => begin(e, b.id)}
                className="touchable absolute bottom-0 left-1/2 h-28 w-14 -translate-x-1/2"
                style={{ touchAction: "none" }}
              />
              {b.special && !opened ? (
                <span className="animate-glow-pulse pointer-events-none absolute inset-0 rounded-full" />
              ) : null}
            </div>
          );
        })}

        <Motes count={10} tone="silver" />

        <div className="absolute inset-x-0 bottom-28">
          {!narrated ? (
            <Narration
              lines={[
                "The sky above your birthday remembers things.",
                "Every balloon is carrying one.",
                "Pull a ribbon and see who comes down.",
              ]}
              onDone={() => setNarrated(true)}
            />
          ) : (
            <p className="text-center font-body text-[0.66rem] tracking-[0.28em] text-foreground/45 uppercase">
              one of them is carrying an envelope
            </p>
          )}
        </div>
      </div>

      {opened ? (
        <RevealCard
          eyebrow="Chapter II · a tiny reminder"
          title="Life doesn't have to be perfect to be beautiful."
          body={[
            "Some days will be a mess.",
            "You will still be the person who makes rooms lighter by walking into them.",
            "So take this year slowly, and let it be good in small ways.",
          ]}
          reward={{ glyph: "◍", label: "one little wish" }}
          cta="let them go"
          onContinue={() => {
            setReleased(true);
            sfx("hush");
            window.setTimeout(onComplete, 1500);
          }}
        />
      ) : null}
    </Stage>
  );
}
