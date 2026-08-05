/** DB-Row-Typen (Supabase) — abgestimmt auf supabase/migrations/0001_init.sql. */

export interface IssueRow {
  id: string;
  issue_date: string;
  title: string;
  status: "draft" | "qa" | "published";
  published_at: string | null;
}

export type SegmentKey =
  | "intro"
  | "news"
  | "tool"
  | "prompt"
  | "image_training"
  | "deep_dive"
  | "podcast"
  | "video"
  | "read";

export interface IssueContentRow {
  id: string;
  issue_id: string;
  segment_key: SegmentKey;
  content: unknown;
  paid_only: boolean;
  sort_order: number;
}

export interface SubscriptionRow {
  id: string;
  profile_id: string;
  lemonsqueezy_subscription_id: string | null;
  status: string;
  plan_variant: string | null;
  current_period_end: string | null;
}

export interface ProfileRow {
  id: string;
  full_name: string | null;
  plan: "free" | "paid";
  email_preferences: Record<string, unknown>;
  created_at: string;
}
