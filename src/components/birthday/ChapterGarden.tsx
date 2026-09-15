import { useRef, useState } from "react";
import { Motes, Narration, RevealCard, Stage } from "./story";
import { sfx } from "@/lib/birthday-audio";

type Props = { onComplete: () => void; onDiscover: (text: string) => void };

const FLOWERS = [
  { id: "f1", left: 10, bottom: 16, hue: "oklch(0.87 0.07 12)", note: "you talk in your sleep. I have proof." },
  { id: "f2", left: 32, bottom: 26, hue: "oklch(0.87 0.06 300)", note: "you're braver than you give yourself credit for." },
  { id: "f3", left: 58, bottom: 14, hue: "oklch(0.9 0.08 60)", note: "the time you fought with me over the last paratha. legendary." },
  { id: "f4", left: 78, bottom: 28, hue: "oklch(0.88 0.05 235)", note: "you notice people. that's rarer than you think." },
];

export function ChapterGarden({ onComplete, onDiscover }: Props) {
  const [narrated, setNarrated] = useState(false);
  const [openFlower, setOpenFlower] = useState<string | null>(null);
  const [read, setRead] = useState<string[]>([]);
  const [drops, setDrops] = useState([
    { id: "d1", x: 14, y: 20, used: false },
    { id: "d2", x: 50, y: 12, used: false },
    { id: "d3", x: 84, y: 22, used: false },
  ]);
  const [water, setWater] = useState(0);
  const [bloomed, setBloomed] = useState(false);
  const [letter, setLetter] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const specialRef = useRef<HTMLButtonElement>(null);
  const dragId = useRef<string | null>(null);

  const tapFlower = (id: string, note: string) => {
    sfx("bloom");
    setOpenFlower(id);
    setRead((r) => (r.includes(id) ? r : [...r, id]));
    window.setTimeout(() => setOpenFlower((cur) => (cur === id ? null : cur)), 3600);
    void note;
  };

  const moveDrop = (e: React.PointerEvent) => {
    const id = dragId.current;
    const box = wrapRef.current?.getBoundingClientRect();
    if (!id || !box) return;
    const x = ((e.clientX - box.left) / box.width) * 100;
    const y = ((e.clientY - box.top) / box.height) * 100;
    setDrops((ds) => ds.map((d) => (d.id === id ? { ...d, x, y } : d)));
  };

  const dropEnd = (e: React.PointerEvent) => {
    const id = dragId.current;
    dragId.current = null;
    const target = specialRef.current?.getBoundingClientRect();
    if (!id || !target) return;
    const near =
      e.clientX > target.left - 40 &&
      e.clientX < target.right + 40 &&
      e.clientY > target.top - 30 &&
      e.clientY < target.bottom + 60;
    if (!near) return;
    sfx("sparkle");
    setDrops((ds) => ds.map((d) => (d.id === id ? { ...d, used: true } : d)));
    setWater((w) => {
      const next = w + 1;
      if (next >= 3) {
        sfx("complete");
        setBloomed(true);
        window.setTimeout(() => setLetter(true), 1400);
      }
      return next;
    });
  };

  return (
    <Stage background="linear-gradient(180deg, oklch(0.955 0.03 300) 0%, oklch(0.94 0.04 70) 60%, oklch(0.9 0.05 120) 100%)">
      <div
        ref={wrapRef}
        className="relative flex-1"
        onPointerMove={moveDrop}
        onPointerUp={dropEnd}
        onPointerCancel={dropEnd}
      >
        <Motes count={12} />

        {/* grass */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,oklch(0.82_0.09_140),oklch(0.68_0.09_145))]" />

        {FLOWERS.map((f) => {
          const open = openFlower === f.id;
          return (
            <div key={f.id} className="absolute w-20" style={{ left: `${f.left}%`, bottom: `${f.bottom}%` }}>
              <button
                type="button"
                aria-label="a flower with a note"
                onClick={() => tapFlower(f.id, f.note)}
                className="touchable w-full"
              >
                <svg viewBox="0 0 80 140" className="w-full overflow-visible">
                  <path
                    d="M40 140V60"
                    stroke="oklch(0.6 0.1 145)"
                    strokeWidth="5"
                    style={{
                      transition: "transform 700ms",
                      transformOrigin: "40px 140px",
                      transform: open ? "rotate(-6deg)" : "none",
                    }}
                  />
                  <g
                    style={{
                      transition: "transform 800ms cubic-bezier(.3,.8,.2,1)",
                      transformOrigin: "40px 56px",
                      transform: open ? "rotate(-8deg) scale(1.08)" : "none",
                    }}
                  >
                    {[0, 60, 120, 180, 240, 300].map((a) => (
                      <ellipse
                        key={a}
                        cx="40"
                        cy="34"
                        rx="9"
                        ry="18"
                        fill={f.hue}
                        style={{
                          transition: "transform 800ms",
                          transformOrigin: "40px 56px",
                          transform: `rotate(${a}deg) ${open ? "translateY(-3px)" : "scale(0.8)"}`,
                        }}
                      />
                    ))}
                    <circle cx="40" cy="56" r="8" fill="oklch(0.9 0.1 88)" />
                  </g>
                </svg>
              </button>
              {open ? (
                <p className="paper-card animate-rise-in absolute -top-14 left-1/2 w-44 -translate-x-1/2 px-3 py-2 text-center font-hand text-base leading-tight text-foreground/80">
                  {f.note}
                </p>
              ) : null}
            </div>
          );
        })}

        {/* the closed one */}
        <button
          ref={specialRef}
          type="button"
          aria-label="a flower that will not open yet"
          onClick={() => {
            if (bloomed) return;
            sfx("tap");
            onDiscover("this one is thirsty. bring the droplets.");
          }}
          className="touchable absolute bottom-[34%] left-1/2 w-28 -translate-x-1/2"
        >
          <svg viewBox="0 0 100 170" className="w-full overflow-visible">
            <path d="M50 170V70" stroke="oklch(0.58 0.11 145)" strokeWidth="6" />
            <g
              style={{
                transition: "transform 1200ms cubic-bezier(.2,.9,.2,1)",
                transformOrigin: "50px 66px",
                transform: bloomed ? "scale(1.25) rotate(0deg)" : "scale(0.7)",
              }}
            >
              {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
                <ellipse
                  key={a}
                  cx="50"
                  cy="34"
                  rx="11"
                  ry="24"
                  fill="oklch(0.9 0.07 20)"
                  style={{
                    transition: "transform 1200ms",
                    transformOrigin: "50px 66px",
                    transform: `rotate(${a}deg) ${bloomed ? "" : "scale(0.42)"}`,
                    opacity: bloomed ? 1 : 0.85,
                  }}
                />
              ))}
              <circle
                cx="50"
                cy="66"
                r={bloomed ? 13 : 16}
                fill="oklch(0.92 0.11 88)"
                style={{ transition: "r 900ms" }}
              />
            </g>
          </svg>
          {!bloomed ? (
            <span className="mt-1 block font-body text-[0.6rem] tracking-[0.24em] text-foreground/45 uppercase">
              {water}/3 watered
            </span>
          ) : null}
        </button>

        {/* droplets */}
        {drops.map((d) =>
          d.used ? null : (
            <button
              key={d.id}
              type="button"
              aria-label="drag a droplet"
              onPointerDown={(e) => {
                dragId.current = d.id;
                (e.target as Element).setPointerCapture?.(e.pointerId);
                sfx("tap");
              }}
              className="touchable absolute h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                left: `${d.x}%`,
                top: `${d.y}%`,
                touchAction: "none",
                background:
                  "radial-gradient(circle at 35% 30%, oklch(0.99 0.02 235), oklch(0.84 0.07 235))",
                boxShadow: "0 8px 18px -8px oklch(0.5 0.06 240 / 0.6)",
              }}
            />
          ),
        )}

        <div className="absolute inset-x-0 top-6">
          {!narrated ? (
            <Narration
              lines={[
                "Somebody left little notes in this garden.",
                "Touch the flowers. They'll tell you.",
                "One of them refuses to open. It's waiting for water.",
              ]}
              onDone={() => setNarrated(true)}
            />
          ) : (
            <p className="text-center font-body text-[0.66rem] tracking-[0.28em] text-foreground/45 uppercase">
              notes read · {read.length}/4
            </p>
          )}
        </div>
      </div>

      {letter ? (
        <RevealCard
          eyebrow="Chapter IV · the long one"
          title="From your sibling"
          body={[
            "I don't always say these things out loud.",
            "But having you as my sister is one of those things I know I'll always be grateful for.",
            "You've had years where things were heavy, and you still showed up for people. I noticed. I always notice.",
            "So this year, be a little kinder to yourself. I'll handle the teasing, you handle the being happy.",
          ]}
          reward={{ glyph: "❁", label: "one letter from home" }}
          onContinue={onComplete}
        />
      ) : null}
    </Stage>
  );
}
