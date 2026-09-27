import {
  Award,
  Gauge,
  History,
  Minus,
  Plus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

type SkillDelta = {
  name: string;
  current: number;
  required: number;
};

const skillDeltas: SkillDelta[] = [
  { name: "Data Structures", current: 92, required: 80 },
  { name: "System Design", current: 58, required: 75 },
  { name: "JavaScript", current: 86, required: 80 },
  { name: "API Design", current: 64, required: 75 },
  { name: "SQL", current: 78, required: 70 },
];

const strengths = [
  { name: "Data Structures", delta: "+12 vs role" },
  { name: "JavaScript", delta: "+6 vs role" },
];

const gaps = [
  { name: "System Design", delta: "-17 vs role" },
  { name: "API Design", delta: "-11 vs role" },
];

export function SkillsIntelligenceSection() {
  return (
    <section className="border-t border-border/60 py-20 sm:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:items-start lg:gap-12">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
              <Gauge className="size-3.5" aria-hidden />
              Skills Intelligence
            </span>
            <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
              Know what your engineering team can actually do.
            </h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base">
              The same scoring we use to evaluate candidates can map your
              existing team. Where are the capability gaps? Who&apos;s ready
              for the next challenge? How is a skill profile changing as your
              stack evolves?
            </p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
              It&apos;s not a separate tool bolted on afterward — it&apos;s
              Screen and Interview&apos;s methodology, applied continuously,
              so capability stays visible even between hiring cycles.
            </p>
          </div>

          <div className="overflow-hidden rounded-4xl border border-border/60 bg-card ring-1 ring-foreground/5 dark:ring-foreground/10">
            <div className="flex flex-wrap items-center gap-3 border-b border-border/60 p-5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-sm font-semibold text-primary">
                JL
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">Jordan Lee</p>
                <p className="truncate text-xs text-muted-foreground">
                  Backend Engineer II · Platform Team
                </p>
              </div>
              <Badge variant="outline" className="ml-auto">
                Moderate fit · 74%
              </Badge>
            </div>

            <dl className="grid grid-cols-2 gap-px bg-border/60 sm:grid-cols-4">
              <StatTile label="Role fit" value="74%" icon={Gauge} />
              <StatTile label="Skill gaps" value="2" icon={TrendingDown} />
              <StatTile label="Assessments" value="3" icon={Award} />
              <StatTile label="Last assessed" value="18d ago" icon={History} />
            </dl>

            <div className="grid gap-6 border-t border-border/60 p-5 sm:grid-cols-2 sm:p-6">
              <div>
                <p className="text-xs font-semibold text-muted-foreground">
                  Strengths
                </p>
                <ul className="mt-3 flex flex-col gap-2">
                  {strengths.map((s) => (
                    <li
                      key={s.name}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span className="flex items-center gap-1.5">
                        <TrendingUp
                          className="size-3.5 text-primary"
                          aria-hidden
                        />
                        {s.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {s.delta}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground">
                  Gaps
                </p>
                <ul className="mt-3 flex flex-col gap-2">
                  {gaps.map((g) => (
                    <li
                      key={g.name}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span className="flex items-center gap-1.5">
                        <TrendingDown
                          className="size-3.5 text-destructive"
                          aria-hidden
                        />
                        {g.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {g.delta}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="border-t border-border/60 p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground">
                  Skills proficiency vs. role benchmark
                </p>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-primary" />
                    Current
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-0.5 bg-foreground/50" />
                    Role benchmark
                  </span>
                </div>
              </div>

              <ul className="mt-4 flex flex-col gap-3.5">
                {skillDeltas.map((skill) => {
                  const met = skill.current >= skill.required;
                  return (
                    <li key={skill.name}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground/90">
                          {skill.name}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          {met ? (
                            <Plus className="size-3 text-primary" aria-hidden />
                          ) : (
                            <Minus
                              className="size-3 text-destructive"
                              aria-hidden
                            />
                          )}
                          {skill.current}
                          <span className="text-muted-foreground/70">
                            / {skill.required} required
                          </span>
                        </span>
                      </div>
                      <div className="relative mt-1.5 h-2 w-full rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${skill.current}%` }}
                        />
                        <div
                          className="absolute top-1/2 h-3.5 w-0.5 -translate-y-1/2 bg-foreground/50"
                          style={{ left: `${skill.required}%` }}
                          aria-hidden
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatTile({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Gauge;
}) {
  return (
    <div className="flex items-center gap-2.5 bg-card p-4">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-4" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{value}</p>
        <p className="truncate text-[11px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
