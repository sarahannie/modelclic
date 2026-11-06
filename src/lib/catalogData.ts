import type { SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_JOB_TYPES, DEFAULT_SKILLS, JOB_GROUPS, SKILL_GROUPS } from "./catalog";
import type { CatalogItem } from "./types";

export async function loadCatalog(supabase: SupabaseClient) {
  const { data } = await supabase.from("catalog_items").select("*").order("label");
  const rows = (data as CatalogItem[] | null)?.length ? (data as CatalogItem[]) : [...DEFAULT_SKILLS, ...DEFAULT_JOB_TYPES].map((c, i) => ({ ...c, id: String(i) }));
  const group = (kind: "skill" | "job_type", order: readonly string[]) => {
    const items = rows.filter((r) => r.kind === kind);
    const grps = [...new Set([...order, ...items.map((i) => i.grp)])];
    return grps.map((grp) => ({ grp, items: items.filter((i) => i.grp === grp).map((i) => i.label) })).filter((g) => g.items.length);
  };
  return {
    skills: group("skill", SKILL_GROUPS),
    jobs: group("job_type", JOB_GROUPS),
    jobRows: rows.filter((r) => r.kind === "job_type"),
    rows,
  };
}
