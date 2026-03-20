export function SectionShell(props: {
  title: string;
  eyebrow: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-[color:var(--line)] bg-white/60 p-6 shadow-[var(--shadow)] backdrop-blur-sm">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:var(--olive)]">
            {props.eyebrow}
          </p>
          <h2 className="font-display text-3xl leading-none text-[color:var(--forest-strong)]">
            {props.title}
          </h2>
        </div>
        <p className="max-w-xs text-right text-sm text-[color:var(--ink-soft)]">
          {props.note}
        </p>
      </div>
      {props.children}
    </section>
  );
}
