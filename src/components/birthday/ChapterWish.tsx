import { useRef, useState } from "react";
import { Motes, Narration, RevealCard, Stage } from "./story";
import { sfx } from "@/lib/birthday-audio";

type Props = { onComplete: () => void; onDiscover: (text: string) => void };

type Item = { id: "star" | "moon" | "candle"; label: string; x: number; y: number };

const START: Item[] = [
  { id: "star", label: "star", x: 18, y: 22 },
  { id: "moon", label: "moon", x: 50, y: 14 },
  { id: "candle", label: "candle", x: 82, y: 24 },
];

const BLESSINGS: Record<string, string[]> = {
  star: [
    "May the loud parts of this year be the happy ones.",
    "May you be somebody's good news more than once.",
  ],
  moon: [
    "May this year be quiet where you need quiet.",
    "May your nights be softer than the ones behind you.",
  ],
  candle: [
    "May you be warm, and never the only one keeping the room warm.",
    "May the people you love stay close enough to notice you.",
  ],
};

const ITEM_ART: Record<Item["id"], JSX.Element> = {
  star: (
    <svg viewBox="0 0 60 60" className="h-full w-full">
      <path
        d="M30 4l7 17 18 2-13 13 3 18-15-9-15 9 3-18L5 23l18-2z"
        fill="oklch(0.93 0.11 88)"
      />
    </svg>
  ),
  moon: (
    <svg viewBox="0 0 60 60" className="h-full w-full">
      <path d="M38 6a26 26 0 1 0 0 48A30 30 0 0 1 38 6z" fill="oklch(0.9 0.05 260)" />
    </svg>
  ),
  candle: (
    <svg viewBox="0 0 60 60" className="h-full w-full">
      <rect x="24" y="22" width="12" height="32" rx="4" fill="oklch(0.94 0.03 60)" />
      <path d="M30 8c5 7 6 10 6 12a6 6 0 1 1-12 0c0-2 1-5 6-12z" fill="oklch(0.88 0.12 70)" />
    </svg>
  ),
};

export function ChapterWish({ onComplete, onDiscover }: Props) {
  const [narrated, setNarrated] = useState(false);
  const [items, setItems] = useState(START);
  const [order, setOrder] = useState<Item["id"][]>([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const dragId = useRef<Item["id"] | null>(null);

  const move = (e: React.PointerEvent) => {
    const id = dragId.current;
    const box = wrapRef.current?.getBoundingClientRect();
    if (!id || !box) return;
    const x = ((e.clientX - box.left) / box.width) * 100;
    const y = ((e.clientY - box.top) / box.height) * 100;
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, x, y } : it)));
  };

  const end = (e: React.PointerEvent) => {
    const id = dragId.current;
    dragId.current = null;
    const slot = slotRef.current?.getBoundingClientRect();
    if (!id || !slot) return;
    const inside =
      e.clientX > slot.left - 24 &&
      e.clientX < slot.right + 24 &&
      e.clientY > slot.top - 24 &&
      e.clientY < slot.bottom + 24;
    if (!inside) return;
    sfx("chime");
    setItems((prev) => prev.filter((it) => it.id !== id));
    setOrder((prev) => {
      const next = [...prev, id];
      if (next.length === 3) {
        setRunning(true);
        sfx("complete");
        window.setTimeout(() => setDone(true), 2600);
      } else {
        onDiscover(
          id === "star" ? "sparkle added." : id === "moon" ? "calm added." : "warmth added.",
        );
      }
      return next;
    });
  };

  const first = order[0] ?? "star";
  const body = [
    ...(BLESSINGS[first] ?? []),
    order[2] === "candle"
      ? "And may it end every single day with something warm."
      : order[2] === "moon"
        ? "And may it end every single day with a little peace."
        : "And may it end every single day with something worth telling me about.",
  ];

  return (
    <Stage background="var(--sky-night)">
      <Motes count={20} tone="silver" />
      <div ref={wrapRef} className="relative flex-1" onPointerMove={move} onPointerUp={end} onPointerCancel={end}>
        {/* machine */}
        <div className="absolute bottom-[14%] left-1/2 w-64 -translate-x-1/2">
          <p className="mb-3 text-center font-body text-[0.6rem] tracking-[0.34em] text-[oklch(0.9_0.05_88)] uppercase">
            birthday wish machine
          </p>
          <div
            className="relative rounded-[28px] px-5 pt-6 pb-8"
            style={{
              background: "linear-gradient(170deg, oklch(0.46 0.06 285), oklch(0.34 0.05 280))",
              boxShadow: "0 26px 60px -30px oklch(0.15 0.05 280), inset 0 1px 0 oklch(1 0 0 / .12)",
            }}
          >
            <div
              ref={slotRef}
              className="mx-auto flex h-24 w-40 items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-500"
              style={{
                borderColor: running ? "oklch(0.93 0.11 88)" : "oklch(0.75 0.03 285 / .6)",
                background: running
                  ? "radial-gradient(circle, oklch(0.9 0.12 88 / .35), transparent 70%)"
                  : "oklch(0.28 0.04 280 / .5)",
                boxShadow: running ? "var(--glow-gold)" : "none",
              }}
            >
              <span className="font-hand text-lg text-[oklch(0.9_0.03_285)]">
                {running ? "…working" : `insert ${3 - order.length} more`}
              </span>
            </div>
            <div className="mt-5 flex justify-center gap-2">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-2.5 w-2.5 rounded-full transition-opacity duration-500"
                  style={{
                    background: "oklch(0.93 0.11 88)",
                    opacity: order.length > i ? 1 : 0.2,
                    animation: running ? `twinkle 0.6s ${i * 0.15}s infinite` : undefined,
                  }}
                />
              ))}
            </div>
            <div className="absolute -bottom-3 left-1/2 h-6 w-24 -translate-x-1/2 rounded-b-2xl bg-[oklch(0.3_0.04_280)]" />
          </div>
        </div>

        {items.map((it) => (
          <button
            key={it.id}
            type="button"
            aria-label={`drag the ${it.label} into the machine`}
            onPointerDown={(e) => {
              dragId.current = it.id;
              (e.target as Element).setPointerCapture?.(e.pointerId);
              sfx("tap");
            }}
            className="touchable animate-float-soft absolute h-16 w-16 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${it.x}%`, top: `${it.y}%`, touchAction: "none" }}
          >
            {ITEM_ART[it.id]}
          </button>
        ))}

        <div className="absolute inset-x-0 top-[42%]">
          {!narrated ? (
            <Narration
              lines={[
                "Insert one birthday wish.",
                "There's no keyboard here.",
                "Drag the star, the moon and the candle in. Order matters.",
              ]}
              className="[&_span]:text-[oklch(0.94_0.02_285)]"
              onDone={() => setNarrated(true)}
            />
          ) : null}
        </div>
      </div>

      {done ? (
        <RevealCard
          eyebrow="wish generated"
          title="Your wish, in your own order"
          body={body}
          reward={{ glyph: "☾", label: "birthday wish" }}
          onContinue={onComplete}
        />
      ) : null}
    </Stage>
  );
}
