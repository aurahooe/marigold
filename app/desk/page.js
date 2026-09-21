"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function DeskPage() {
  const supabase = createClient();
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [msg, setMsg] = useState("");

  async function load(u) {
    const { data } = await supabase
      .from("notes")
      .select("id, title, body, is_public, created_at")
      .eq("user_id", u.id)
      .order("created_at", { ascending: false });
    setNotes(data || []);
  }

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        location.href = "/login";
        return;
      }
      setUser(data.user);
      await supabase.from("profiles").upsert({
        id: data.user.id,
        display_name: data.user.email?.split("@")[0] || "anonymous",
        handle: data.user.email?.split("@")[0] || `u-${data.user.id.slice(0, 6)}`,
      });
      load(data.user);
    });
  }, []);

  async function save(e) {
    e.preventDefault();
    if (!user) return;
    setMsg("");
    const { error } = await supabase.from("notes").insert({
      user_id: user.id,
      title: title.trim() || "Untitled",
      body: body.trim(),
      is_public: isPublic,
    });
    if (error) {
      setMsg(error.message);
      return;
    }
    setTitle("");
    setBody("");
    setIsPublic(false);
    setMsg(isPublic ? "Saved and on the wall." : "Saved privately.");
    load(user);
  }

  async function toggle(note) {
    const { error } = await supabase
      .from("notes")
      .update({ is_public: !note.is_public })
      .eq("id", note.id);
    if (error) {
      setMsg(error.message);
      return;
    }
    load(user);
  }

  async function remove(note) {
    await supabase.from("notes").delete().eq("id", note.id);
    load(user);
  }

  async function signOut() {
    await supabase.auth.signOut();
    location.href = "/";
  }

  if (!user) return null;

  return (
    <div className="wrap">
      <nav className="nav">
        <Link href="/" className="mark">
          <span className="dot" />
          Marigold
        </Link>
        <div className="nav-links">
          <Link className="ghost" href="/">Wall</Link>
          <button className="solid" onClick={signOut}>Leave</button>
        </div>
      </nav>
      <h1 style={{ fontSize: 56 }}>Your desk</h1>
      <p className="lede">Signed in as {user.email}. Public notes appear on the wall immediately.</p>
      <form className="panel" onSubmit={save} style={{ margin: "28px 0" }}>
        <div className="kicker">New note</div>
        <label>Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} />
        <label>Body</label>
        <textarea required value={body} onChange={(e) => setBody(e.target.value)} maxLength={2000} />
        <div className="row">
          <label className="toggle">
            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
            Mark public
          </label>
          <button className="solid" type="submit">Keep this</button>
        </div>
        {msg && <p>{msg}</p>}
      </form>
      <div className="list">
        {notes.map((n) => (
          <div className="mine" key={n.id}>
            <strong>{n.title}</strong>
            <p style={{ margin: "6px 0 10px", whiteSpace: "pre-wrap" }}>{n.body}</p>
            <div className="row">
              <span className="meta" style={{ margin: 0 }}>{n.is_public ? "on the wall" : "private"}</span>
              <div>
                <button className="ghost" onClick={() => toggle(n)}>{n.is_public ? "Make private" : "Publish"}</button>{" "}
                <button className="ghost" onClick={() => remove(n)}>Discard</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
