/** Checkbox group rendered as pill chips (no JS needed). */
export function ChipChecks({ name, groups, selected }: { name: string; groups: { grp: string; items: string[] }[]; selected: string[] }) {
  return (
    <div className="space-y-4">
      {groups.map((g) => (
        <fieldset key={g.grp}>
          <legend className="mb-2 text-[11px] font-bold tracking-[0.12em] text-ink-400 uppercase">{g.grp}</legend>
          <div className="flex flex-wrap gap-2">
            {g.items.map((label) => (
              <label key={label} className="cursor-pointer">
                <input type="checkbox" name={name} value={label} defaultChecked={selected.includes(label)} className="peer sr-only" />
                <span className="chip peer-checked:border-ink peer-checked:bg-ink peer-checked:text-white peer-focus-visible:ring-4 peer-focus-visible:ring-ice">{label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
