import { createServerSupabase } from "@/lib/supabase/server";
import type { IssueContentRow, IssueRow } from "@/lib/db-types";

/** Alle veröffentlichten Ausgaben, neueste zuerst. */
export async function getPublishedIssues(): Promise<IssueRow[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("issues")
    .select("id, issue_date, title, status, published_at")
    .eq("status", "published")
    .order("issue_date", { ascending: false });
  if (error) throw error;
  return (data ?? []) as IssueRow[];
}

export async function getIssueByDate(issueDate: string): Promise<IssueRow | null> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("issues")
    .select("id, issue_date, title, status, published_at")
    .eq("issue_date", issueDate)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw error;
  return data as IssueRow | null;
}

export async function getLatestPublishedIssueDate(): Promise<string | null> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("issues")
    .select("issue_date")
    .eq("status", "published")
    .order("issue_date", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data?.issue_date as string | undefined) ?? null;
}

/**
 * Segmente einer Ausgabe. RLS (Session-User) liefert automatisch:
 * free = intro/news/tool; paid = zusätzlich alle paid_only-Segmente.
 */
export async function getIssueContent(issueId: string): Promise<IssueContentRow[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("issue_content")
    .select("id, issue_id, segment_key, content, paid_only, sort_order")
    .eq("issue_id", issueId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as IssueContentRow[];
}
