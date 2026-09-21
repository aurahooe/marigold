"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("signin");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const supabase = createClient();

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${location.origin}/auth/callback` },
        });
        if (error) throw error;
        setMsg("Check your inbox if confirmation is on. Otherwise you can sign in now.");
      } else if (mode === "magic") {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${location.origin}/auth/callback` },
        });
        if (error) throw error;
        setMsg("Link sent. Open it on this device.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        location.href = "/desk";
      }
    } catch (err) {
      setMsg(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="wrap">
      <nav className="nav">
        <Link href="/" className="mark">
          <span className="dot" />
          Marigold
        </Link>
      </nav>
      <div className="panel">
        <div className="kicker">Door</div>
        <h1 style={{ fontSize: 42, marginBottom: 8 }}>Come in quietly.</h1>
        <p className="lede">Email and a password, or a one-time link. Your notes stay attached to this account.</p>
        <form onSubmit={onSubmit}>
          <label>Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@somewhere.test" />
          {mode !== "magic" && (
            <>
              <label>Password</label>
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
            </>
          )}
          <div className="row">
            <button className="solid" disabled={busy} type="submit">
              {busy ? "Working…" : mode === "signup" ? "Create desk" : mode === "magic" ? "Send link" : "Enter"}
            </button>
            <button type="button" className="ghost" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
              {mode === "signup" ? "Have an account" : "New here"}
            </button>
          </div>
          <p style={{ marginTop: 14 }}>
            <button type="button" className="ghost" onClick={() => setMode("magic")}>
              Use a magic link instead
            </button>
          </p>
          {msg && <p style={{ color: "#8a4b12" }}>{msg}</p>}
        </form>
      </div>
    </div>
  );
}
