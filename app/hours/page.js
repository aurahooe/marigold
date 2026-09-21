import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function HoursPage() {
  const supabase = createClient();
  const { data: hours } = await supabase
    .from("hours")
    .select("headline, editorial, slot")
    .order("slot", { ascending: false })
    .limit(36);
  const { data: log } = await supabase
    .from("hourly_log")
    .select("title, body, created_at")
    .order("created_at", { ascending: false })
    .limit(36);

  const items = [
    ...(hours || []).map((h) => ({
      title: h.headline,
      body: h.editorial,
      at: h.slot,
    })),
    ...(log || []).map((h) => ({
      title: h.title,
      body: h.body,
      at: h.created_at,
    })),
  ].sort((a, b) => new Date(b.at) - new Date(a.at));

  return (
    <div className="wrap">
      <nav className="nav">
        <Link href="/" className="mark">
          <span className="dot" />
          Marigold
        </Link>
        <Link className="ghost" href="/">
          Back to the wall
        </Link>
      </nav>
      <h1>The hours</h1>
      <p className="lede">
        A running ledger of what landed this hour. The site is meant to keep
        shifting — small, specific, not a dump of features.
      </p>
      <div className="list" style={{ paddingBottom: 80 }}>
        {items.map((item, i) => (
          <article className="mine" key={i}>
            <div className="kicker">
              {new Date(item.at).toLocaleString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
              })}
            </div>
            <h3 style={{ margin: "4px 0 8px", fontFamily: "Fraunces, Georgia, serif" }}>
              {item.title}
            </h3>
            <p style={{ margin: 0, color: "#3d372f" }}>{item.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
