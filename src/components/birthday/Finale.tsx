import { useRef, useState } from "react";
import { Motes, Narration, Stage } from "./story";
import { sfx } from "@/lib/birthday-audio";

type Props = { onDiscover: (text: string) => void };

type Phase = "arrive" | "candles" | "dark" | "letter";

export function Finale({ onDiscover }: Props) {
  const [phase, setPhase] = useState<Phase>("arrive");
  const [flames, setFlames] = useState([true, true, true]);
  const [bend, setBend] = useState([0, 0, 0]);
  const [lettered, setLettered] = useState(false);
  const candleRefs = useRef<Array<HTMLDivElement | null>>([null, null, null]);

  const breeze = (e: React.PointerEvent) => {
    if (phase !== "candles") return;
    const nextBend = [0, 0, 0];
    let changed = false;
    const nextFlames = [...flames];
    candleRefs.current.forEach((el, i) => {
      if (!el || !flames[i]) return;
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + 10);
      const dist = Math.hypot(dx, dy);
      if (dist < 90) nextBend[i] = Math.max(-22, Math.min(22, -dx / 3));
      if (dist < 44) {
        nextFlames[i] = false;
        changed = true;
      }
    });
    setBend(nextBend);
    if (changed) {
      sfx("hush");
      setFlames(nextFlames);
      if (nextFlames.every((f) => !f)) {
        window.setTimeout(() => {
          setPhase("dark");
          sfx("chime");
        }, 700);
        window.setTimeout(() => setPhase("letter"), 4200);
      }
    }
  };

  const dark = phase === "dark";

  return (
    <Stage
      background={
        dark
          ? "radial-gradient(120% 70% at 50% 20%, oklch(0.22 0.04 280), oklch(0.14 0.03 280))"
          : "var(--sky-night)"
      }
    >
      <Motes count={dark ? 26 : 16} tone="silver" />

      {/* constellation of her wish */}
      <div className="pointer-events-none absolute inset-x-0 top-10 h-40">
        {[
          [30, 24],
          [42, 12],
          [55, 30],
          [66, 18],
          [50, 48],
          [38, 44],
        ].map(([l, t], i) => (
          <span
            key={i}
            className="animate-twinkle absolute h-1.5 w-1.5 rounded-full bg-[oklch(0.97_0.04_90)]"
            style={{ left: `${l}%`, top: `${t}%`, animationDelay: `${i * 0.4}s` }}
          />
        ))}
      </div>

      {/* hanging balloon notes */}
      {[12, 84].map((l, i) => (
        <div key={l} className="animate-float-soft absolute top-24 w-12" style={{ left: `${l}%`, animationDelay: `${i}s` }}>
          <svg viewBox="0 0 60 120">
            <ellipse cx="30" cy="34" rx="24" ry="30" fill={i ? "oklch(0.8 0.07 300)" : "oklch(0.82 0.08 18)"} />
            <path d="M30 66c6 18-8 26 0 44" stroke="oklch(0.7 0.05 40)" strokeWidth="2" fill="none" />
          </svg>
        </div>
      ))}

      <div
        className="relative flex flex-1 flex-col items-center justify-end pb-16"
        onPointerMove={breeze}
        style={{ touchAction: phase === "candles" ? "none" : "auto" }}
      >
        {/* flowers on the table */}
        <div className="pointer-events-none absolute bottom-24 flex w-full justify-between px-6">
          {[0, 1, 2, 3].map((i) => (
            <svg key={i} viewBox="0 0 40 60" className="w-8 opacity-80">
              <path d="M20 60V30" stroke="oklch(0.55 0.09 145)" strokeWidth="3" />
              {[0, 72, 144, 216, 288].map((a) => (
                <ellipse
                  key={a}
                  cx="20"
                  cy="18"
                  rx="5"
                  ry="9"
                  fill={i % 2 ? "oklch(0.86 0.06 300)" : "oklch(0.87 0.07 14)"}
                  transform={`rotate(${a} 20 28)`}
                />
              ))}
            </svg>
          ))}
        </div>

        {/* cake */}
        <div className="relative w-64">
          <div className="relative mx-auto flex w-full justify-center gap-8">
            {[0, 1, 2].map((i) => (
              <div key={i} ref={(el) => void (candleRefs.current[i] = el)} className="relative h-24 w-4">
                <div className="absolute bottom-0 h-16 w-full rounded-sm bg-[linear-gradient(180deg,oklch(0.96_0.03_60),oklch(0.88_0.04_50))]" />
                {flames[i] ? (
                  <div
                    className="animate-flame absolute bottom-16 left-1/2 h-8 w-4 -translate-x-1/2 rounded-[50%_50%_45%_45%]"
                    style={{
                      background:
                        "radial-gradient(circle at 50% 70%, oklch(0.99 0.06 95), oklch(0.84 0.16 62) 60%, transparent 75%)",
                      boxShadow: "var(--glow-gold)",
                      transform: `translateX(-50%) rotate(${bend[i] ?? 0}deg)`,
                    }}
                  />
                ) : (
                  <span
                    className="absolute bottom-16 left-1/2 h-6 w-1 -translate-x-1/2 rounded-full bg-[oklch(0.8_0.01_280/.4)]"
                    style={{ animation: "drift-up 3.4s ease-out" }}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-1 h-16 rounded-t-[14px] bg-[linear-gradient(180deg,oklch(0.94_0.04_30),oklch(0.86_0.05_25))] shadow-[var(--shadow-soft)]" />
          <div className="h-20 rounded-b-[18px] bg-[linear-gradient(180deg,oklch(0.9_0.05_20),oklch(0.8_0.06_18))]" />
          <button
            type="button"
            aria-label="behind the cake"
            onClick={() => onDiscover("there's a note taped behind the cake. it just says: “told you it'd be worth it.”")}
            className="touchable absolute -right-2 bottom-6 h-10 w-10 rounded-full opacity-0"
          />
        </div>
        <div className="h-6 w-[86%] rounded-b-xl bg-[oklch(0.5_0.05_40)]" />

        {phase === "arrive" ? (
          <div className="absolute inset-x-0 top-[38%]">
            <Narration
              lines={[
                "You made it.",
                "Happy Birthday, Sis.",
                "I know I annoy you. You annoy me too — that's basically the sibling contract.",
                "But underneath all the teasing, I really am lucky to have you.",
                "One last thing. Your last task.",
              ]}
              hold={2800}
              className="[&_span]:text-[oklch(0.96_0.02_285)]"
              onDone={() => setPhase("candles")}
            />
          </div>
        ) : null}

        {phase === "candles" ? (
          <p className="absolute inset-x-0 top-[44%] px-10 text-center font-body text-[0.68rem] tracking-[0.26em] text-[oklch(0.9_0.04_88)] uppercase">
            swipe across the candles
          </p>
        ) : null}

        {dark ? (
          <p className="animate-rise-in absolute inset-x-0 top-[42%] text-center font-display text-3xl text-[oklch(0.95_0.03_88)]">
            wish sent.
          </p>
        ) : null}
      </div>

      {phase === "letter" ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-night/50 px-5 backdrop-blur-[3px]">
          <div className="paper-card animate-rise-in scene-grain w-full max-w-sm px-7 py-9 text-center">
            <h2 className="story-line text-4xl text-foreground">Happy Birthday, Sis.</h2>
            <div className="mt-6 space-y-3 text-left">
              {[
                "I'm proud of you. Genuinely, not the annoying-sibling kind.",
                "I hope this year gives you a lot more reasons to smile, and a few fewer reasons to overthink at 2am.",
                "And if it doesn't — I'm still here. Obviously.",
                "Happy Birthday ❤️",
              ].map((l, i) => (
                <p
                  key={i}
                  className="font-hand text-[1.35rem] leading-snug text-foreground/80"
                  style={{ animation: `rise-in .6s ${0.2 + i * 0.3}s both` }}
                >
                  {l}
                </p>
              ))}
            </div>
            {!lettered ? (
              <button
                type="button"
                onClick={() => {
                  sfx("complete");
                  setLettered(true);
                }}
                className="touchable mt-8 w-full rounded-full bg-primary py-4 font-body text-xs tracking-[0.22em] text-primary-foreground uppercase active:scale-95"
              >
                thank you ♡
              </button>
            ) : (
              <p className="mt-8 font-body text-[0.62rem] tracking-[0.3em] text-muted-foreground uppercase">
                made for you, only you
              </p>
            )}
          </div>
        </div>
      ) : null}

      {/* gentle confetti once the lights return */}
      {lettered
        ? Array.from({ length: 26 }).map((_, i) => (
            <span
              key={i}
              className="pointer-events-none absolute top-0 h-2 w-1.5 rounded-sm"
              style={{
                left: `${Math.random() * 100}%`,
                background: ["oklch(0.87 0.07 14)", "oklch(0.86 0.06 300)", "oklch(0.93 0.1 88)"][i % 3],
                animation: `drift-up ${8 + Math.random() * 6}s linear ${Math.random() * 4}s infinite reverse`,
              }}
            />
          ))
        : null}
    </Stage>
  );
}
