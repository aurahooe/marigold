import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

function when(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function Home() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: notes } = await supabase
    .from("notes")
    .select("id, title, body, created_at, user_id, profiles(display_name, handle)")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(24);

  const { data: hours } = await supabase
    .from("hours")
    .select("headline, editorial, slot")
    .order("slot", { ascending: false })
    .limit(1);

  const { data: log } = await supabase
    .from("hourly_log")
    .select("title, body, created_at")
    .order("created_at", { ascending: false })
    .limit(1);

  const pulse = hours?.[0];
  const shipped = log?.[0];

  return (
    <div className="wrap">
      <nav className="nav">
        <Link href="/" className="mark">
          <span className="dot" />
          Marigold
        </Link>
        <div className="nav-links">
          <Link className="ghost" href="/hours">
            The hours
          </Link>
          {user ? (
            <Link className="solid" href="/desk">
              Your desk
            </Link>
          ) : (
            <Link className="solid" href="/login">
              Come in
            </Link>
          )}
        </div>
      </nav>

      <header className="hero">
        <div>
          <h1>Leave a note.<br />If it's public, it lives here.</h1>
          <p className="lede">
            A small wall that doesn't shout. Write privately, publish when
            you mean it. Something new lands every hour.
          </p>
        </div>
        <aside className="hour-card">
          <div className="kicker">This hour</div>
          <h2 style={{ fontFamily: "Fraunces, Georgia, serif", margin: "0 0 8px", fontSize: 26 }}>
            {pulse?.headline || shipped?.title || "The wall is waking up"}
          </h2>
          <p style={{ margin: 0, color: "#4a433a", lineHeight: 1.5 }}>
            {pulse?.editorial ||
              shipped?.body ||
              "Public notes from signed-in people appear on this wall. Private notes stay at your desk."}
          </p>
        </aside>
      </header>

      <h2 className="section-title">On the wall</h2>
      <p className="lede" style={{ marginTop: 0 }}>
        Only notes marked public. Nothing else leaks.
      </p>

      <section className="grid">
        {(notes || []).length === 0 && (
          <article className="note">
            <div>
              <h3>Empty paper</h3>
              <p>No public notes yet. Sign in and pin the first one.</p>
            </div>
            <div className="meta">
              <span>house</span>
              <span>waiting</span>
            </div>
          </article>
        )}
        {(notes || []).map((n, i) => (
          <article className="note" key={n.id} style={{ animationDelay: `${i * 40}ms` }}>
            <div>
              <h3>{n.title || "Untitled"}</h3>
              <p>{n.body}</p>
            </div>
            <div className="meta">
              <span>{n.profiles?.display_name || n.profiles?.handle || "someone"}</span>
              <span>{when(n.created_at)}</span>
            </div>
          </article>
        ))}
      </section>

      <footer className="foot">
        <span>Marigold keeps what you save.</span>
        <span>Hourly pulse on /hours</span>
      </footer>
    </div>
  );
}
