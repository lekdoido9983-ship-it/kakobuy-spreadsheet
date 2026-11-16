"use client";

import { useCallback, useEffect, useState } from "react";
import { CATEGORIES } from "@/lib/categories";

interface Coupon {
  id: string;
  code: string;
  title: string;
  description: string;
  active: boolean;
  expiresAt?: string;
  createdAt: string;
}
interface Notice {
  id: string;
  title: string;
  message: string;
  link?: string;
  active: boolean;
  createdAt: string;
}
interface Item {
  id: number;
  slug: string;
  name: string;
  price: number;
  category: string;
  image?: string;
  popular: boolean;
  hidden: boolean;
  edited: boolean;
  qcN: number;
  kakobuyUrl: string;
}
interface Me {
  configured: boolean;
  authenticated: boolean;
  writable?: boolean;
}

const card = { background: "rgba(10,6,16,0.55)", border: "1px solid var(--line-soft)" } as const;
const inputCls = "w-full px-3 py-2.5 rounded-xl text-sm outline-none";
const inputStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid var(--line)", color: "var(--text)" } as const;
const newId = () => Math.random().toString(36).slice(2, 10);

async function api<T = unknown>(url: string, init?: RequestInit): Promise<{ ok: boolean; data: T & { error?: string } }> {
  const res = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers || {}) }, cache: "no-store" });
  let data = {} as T & { error?: string };
  try {
    data = await res.json();
  } catch {}
  return { ok: res.ok, data };
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="inline-flex items-center gap-2 text-xs font-bold cursor-pointer select-none" style={{ color: on ? "var(--amber-soft)" : "var(--text-dim)" }}>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => onChange(!on)}
        className="relative w-10 h-6 rounded-full transition-colors"
        style={{ background: on ? "#f59a3a" : "rgba(255,255,255,0.14)" }}
      >
        <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all" style={{ left: on ? 18 : 2 }} />
      </button>
      {label}
    </label>
  );
}

function Login({ configured, onDone }: { configured: boolean; onDone: () => void }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  if (!configured) {
    return (
      <div className="max-w-md mx-auto rounded-3xl p-8 text-sm leading-relaxed" style={card}>
        <h1 className="section-title text-2xl mb-3">Admin is off</h1>
        <p style={{ color: "var(--text-muted)" }}>
          Set the <code>ADMIN_PASSWORD</code> environment variable (at least 8 characters) on the server and redeploy to turn the admin panel on.
        </p>
      </div>
    );
  }

  return (
    <form
      className="max-w-sm mx-auto rounded-3xl p-8"
      style={card}
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setErr("");
        const r = await api("/api/admin/login", { method: "POST", body: JSON.stringify({ password: pw }) });
        setBusy(false);
        if (r.ok) onDone();
        else setErr(r.data.error || "Could not sign in.");
      }}
    >
      <p className="eyebrow mb-2">Restricted</p>
      <h1 className="section-title text-3xl mb-6">Admin</h1>
      <input type="password" autoFocus autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Password" className={inputCls} style={inputStyle} />
      {err && <p className="text-xs mt-3" style={{ color: "#ff7a8a" }}>{err}</p>}
      <button type="submit" disabled={busy || !pw} className="btn-primary w-full py-3 mt-5 disabled:opacity-50">
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

interface Community {
  title: string;
  discordUrl: string;
  telegramUrl: string;
  buttonLabel: string;
  joinUrl: string;
  text: string;
}
interface Welcome {
  enabled: boolean;
  title: string;
  discount: string;
  message: string;
  code: string;
  note: string;
}
type ContentData = { coupons: Coupon[]; notices: Notice[]; community: Community; welcome: Welcome };

function useContent() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [community, setCommunity] = useState<Community | null>(null);
  const [welcome, setWelcome] = useState<Welcome | null>(null);
  const [dirty, setDirty] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api<ContentData>("/api/admin/content").then((r) => {
      if (r.ok) {
        setCoupons(r.data.coupons);
        setNotices(r.data.notices);
        setCommunity(r.data.community);
        setWelcome(r.data.welcome);
      }
    });
  }, []);

  const save = async () => {
    setMsg("Saving…");
    const r = await api<ContentData>("/api/admin/content", { method: "PUT", body: JSON.stringify({ coupons, notices, community, welcome }) });
    if (r.ok) {
      setCoupons(r.data.coupons);
      setNotices(r.data.notices);
      setCommunity(r.data.community);
      setWelcome(r.data.welcome);
      setDirty(false);
      setMsg("Saved ✓ — visitors see it within about 30 seconds.");
    } else setMsg(r.data.error || "Could not save.");
  };

  return {
    coupons,
    notices,
    community,
    welcome,
    setCoupons: (v: Coupon[]) => (setCoupons(v), setDirty(true)),
    setNotices: (v: Notice[]) => (setNotices(v), setDirty(true)),
    setCommunity: (v: Community) => (setCommunity(v), setDirty(true)),
    setWelcome: (v: Welcome) => (setWelcome(v), setDirty(true)),
    dirty,
    save,
    msg,
  };
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[0.7rem] font-bold tracking-widest uppercase" style={{ color: "var(--text-dim)" }}>
        {label}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function CommunityTab({ c }: { c: ReturnType<typeof useContent> }) {
  const cm = c.community;
  const w = c.welcome;
  if (!cm || !w) return <p className="text-sm py-10 text-center" style={{ color: "var(--text-dim)" }}>Loading…</p>;
  return (
    <div className="space-y-6">
      <section className="rounded-2xl p-5 space-y-4" style={card}>
        <div>
          <h2 className="font-extrabold">Community window</h2>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            Opens from the <strong>Community</strong> tab in the top bar. Change the links any time.
          </p>
        </div>
        <Field label="Window title">
          <input className={inputCls} style={inputStyle} value={cm.title} onChange={(e) => c.setCommunity({ ...cm, title: e.target.value })} />
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Discord link">
            <input className={inputCls} style={inputStyle} placeholder="https://discord.gg/…" value={cm.discordUrl} onChange={(e) => c.setCommunity({ ...cm, discordUrl: e.target.value })} />
          </Field>
          <Field label="Telegram link">
            <input className={inputCls} style={inputStyle} placeholder="https://t.me/…" value={cm.telegramUrl} onChange={(e) => c.setCommunity({ ...cm, telegramUrl: e.target.value })} />
          </Field>
          <Field label="Main button text">
            <input className={inputCls} style={inputStyle} value={cm.buttonLabel} onChange={(e) => c.setCommunity({ ...cm, buttonLabel: e.target.value })} />
          </Field>
          <Field label="Main button link (empty = Discord link)">
            <input className={inputCls} style={inputStyle} placeholder="https://…" value={cm.joinUrl} onChange={(e) => c.setCommunity({ ...cm, joinUrl: e.target.value })} />
          </Field>
        </div>
        <Field label="Text under the buttons">
          <textarea className={inputCls} style={inputStyle} rows={3} value={cm.text} onChange={(e) => c.setCommunity({ ...cm, text: e.target.value })} />
        </Field>
      </section>

      <section className="rounded-2xl p-5 space-y-4" style={card}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-extrabold">Welcome gift popup</h2>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              Shown to each visitor once per day, on their first visit of that day. They close it with the ✕ or by clicking outside it.
            </p>
          </div>
          <Toggle on={w.enabled} onChange={(v) => c.setWelcome({ ...w, enabled: v })} label={w.enabled ? "On" : "Off"} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Small title">
            <input className={inputCls} style={inputStyle} value={w.title} onChange={(e) => c.setWelcome({ ...w, title: e.target.value })} />
          </Field>
          <Field label="Big discount text (e.g. 10% OFF)">
            <input className={inputCls} style={inputStyle} value={w.discount} onChange={(e) => c.setWelcome({ ...w, discount: e.target.value })} />
          </Field>
          <Field label="Coupon code">
            <input className={inputCls} style={inputStyle} value={w.code} onChange={(e) => c.setWelcome({ ...w, code: e.target.value.toUpperCase() })} />
          </Field>
          <Field label="Note (e.g. first purchase only)">
            <input className={inputCls} style={inputStyle} value={w.note} onChange={(e) => c.setWelcome({ ...w, note: e.target.value })} />
          </Field>
        </div>
        <Field label="Message">
          <textarea className={inputCls} style={inputStyle} rows={2} value={w.message} onChange={(e) => c.setWelcome({ ...w, message: e.target.value })} />
        </Field>
        <button
          type="button"
          className="btn-secondary px-5 py-2.5 text-sm"
          onClick={() => {
            try {
              localStorage.removeItem("kb_welcome_day");
            } catch {}
            window.open("/", "_blank");
          }}
        >
          Preview on the site (resets today&apos;s popup for this browser)
        </button>
      </section>
      <SaveBar dirty={c.dirty} save={c.save} msg={c.msg} />
    </div>
  );
}

function SaveBar({ dirty, save, msg }: { dirty: boolean; save: () => void; msg: string }) {
  return (
    <div className="sticky bottom-4 z-10 mt-6 flex items-center gap-4 rounded-2xl px-4 py-3" style={{ background: "rgba(28,18,42,0.97)", border: "1px solid var(--line)" }}>
      <button onClick={save} disabled={!dirty} className="btn-primary px-6 py-2.5 disabled:opacity-40">
        Save changes
      </button>
      <span className="text-xs" style={{ color: dirty ? "var(--amber)" : "var(--text-dim)" }}>
        {dirty ? "You have unsaved changes." : msg}
      </span>
    </div>
  );
}

function CouponsTab({ c }: { c: ReturnType<typeof useContent> }) {
  const set = (i: number, patch: Partial<Coupon>) => c.setCoupons(c.coupons.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Coupons appear in the <strong>Coupons</strong> window in the top bar of the site.
        </p>
        <button
          className="btn-secondary px-5 py-2.5 text-sm"
          onClick={() => c.setCoupons([{ id: newId(), code: "", title: "", description: "", active: true, createdAt: new Date().toISOString() }, ...c.coupons])}
        >
          + New coupon
        </button>
      </div>
      <div className="space-y-3">
        {c.coupons.length === 0 && <p className="text-sm py-10 text-center" style={{ color: "var(--text-dim)" }}>No coupons yet.</p>}
        {c.coupons.map((x, i) => (
          <div key={x.id} className="rounded-2xl p-4 grid gap-3 md:grid-cols-[160px_1fr_150px]" style={card}>
            <input className={inputCls} style={inputStyle} placeholder="CODE" value={x.code} onChange={(e) => set(i, { code: e.target.value.toUpperCase() })} />
            <input className={inputCls} style={inputStyle} placeholder="Title (e.g. New user coupon)" value={x.title} onChange={(e) => set(i, { title: e.target.value })} />
            <input className={inputCls} style={inputStyle} type="date" title="Expires (optional)" value={x.expiresAt || ""} onChange={(e) => set(i, { expiresAt: e.target.value || undefined })} />
            <textarea className={`${inputCls} md:col-span-3`} style={inputStyle} rows={2} placeholder="Description (e.g. $5 off your first order over $50)" value={x.description} onChange={(e) => set(i, { description: e.target.value })} />
            <div className="md:col-span-3 flex items-center justify-between">
              <Toggle on={x.active} onChange={(v) => set(i, { active: v })} label={x.active ? "Visible" : "Hidden"} />
              <button className="text-xs font-bold" style={{ color: "#ff7a8a" }} onClick={() => c.setCoupons(c.coupons.filter((_, j) => j !== i))}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      <SaveBar dirty={c.dirty} save={c.save} msg={c.msg} />
    </div>
  );
}

function NoticesTab({ c }: { c: ReturnType<typeof useContent> }) {
  const set = (i: number, patch: Partial<Notice>) => c.setNotices(c.notices.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Notifications appear in the same <strong>Coupons</strong> window. Use them for news, drops and announcements.
        </p>
        <button
          className="btn-secondary px-5 py-2.5 text-sm"
          onClick={() => c.setNotices([{ id: newId(), title: "", message: "", active: true, createdAt: new Date().toISOString() }, ...c.notices])}
        >
          + New notification
        </button>
      </div>
      <div className="space-y-3">
        {c.notices.length === 0 && <p className="text-sm py-10 text-center" style={{ color: "var(--text-dim)" }}>No notifications yet.</p>}
        {c.notices.map((x, i) => (
          <div key={x.id} className="rounded-2xl p-4 grid gap-3" style={card}>
            <input className={inputCls} style={inputStyle} placeholder="Title" value={x.title} onChange={(e) => set(i, { title: e.target.value })} />
            <textarea className={inputCls} style={inputStyle} rows={2} placeholder="Message" value={x.message} onChange={(e) => set(i, { message: e.target.value })} />
            <input className={inputCls} style={inputStyle} placeholder="Link (optional): /products or https://…" value={x.link || ""} onChange={(e) => set(i, { link: e.target.value || undefined })} />
            <div className="flex items-center justify-between">
              <Toggle on={x.active} onChange={(v) => set(i, { active: v })} label={x.active ? "Visible" : "Hidden"} />
              <button className="text-xs font-bold" style={{ color: "#ff7a8a" }} onClick={() => c.setNotices(c.notices.filter((_, j) => j !== i))}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      <SaveBar dirty={c.dirty} save={c.save} msg={c.msg} />
    </div>
  );
}

function ProductEditor({ item, onClose, onSaved }: { item: Item; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState({ name: item.name, price: String(item.price ?? ""), category: item.category, popular: item.popular, hidden: item.hidden, kakobuyUrl: item.kakobuyUrl });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const send = async (body: object) => {
    setBusy(true);
    setErr("");
    const r = await api(`/api/admin/products/${item.id}`, { method: "PATCH", body: JSON.stringify(body) });
    setBusy(false);
    if (r.ok) onSaved();
    else setErr(r.data.error || "Could not save.");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: "rgba(8,4,14,0.8)", backdropFilter: "blur(6px)" }} onClick={onClose}>
      <div className="w-full max-w-lg rounded-3xl p-6 max-h-[92dvh] overflow-y-auto" style={{ background: "linear-gradient(165deg, rgba(58,38,84,0.98), rgba(24,15,38,0.99))", border: "1px solid var(--line)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <p className="eyebrow">Edit product #{item.id}</p>
          <button onClick={onClose} aria-label="Close" className="w-9 h-9 rounded-xl hover:bg-white/10" style={{ border: "1px solid var(--line)" }}>
            ✕
          </button>
        </div>
        <div className="grid gap-3">
          <label className="text-xs font-bold" style={{ color: "var(--text-dim)" }}>
            Name
            <input className={`${inputCls} mt-1`} style={inputStyle} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs font-bold" style={{ color: "var(--text-dim)" }}>
              Price (USD)
              <input className={`${inputCls} mt-1`} style={inputStyle} inputMode="decimal" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} />
            </label>
            <label className="text-xs font-bold" style={{ color: "var(--text-dim)" }}>
              Category
              <select className={`${inputCls} mt-1`} style={inputStyle} value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} style={{ color: "#000" }}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="text-xs font-bold" style={{ color: "var(--text-dim)" }}>
            Kakobuy link (must keep your affcode)
            <textarea className={`${inputCls} mt-1`} style={inputStyle} rows={3} value={f.kakobuyUrl} onChange={(e) => setF({ ...f, kakobuyUrl: e.target.value })} />
          </label>
          <div className="flex gap-6">
            <Toggle on={f.popular} onChange={(v) => setF({ ...f, popular: v })} label="Trending" />
            <Toggle on={f.hidden} onChange={(v) => setF({ ...f, hidden: v })} label="Hidden from site" />
          </div>
        </div>
        {err && <p className="text-xs mt-3" style={{ color: "#ff7a8a" }}>{err}</p>}
        <div className="flex items-center gap-3 mt-6">
          <button disabled={busy} className="btn-primary px-6 py-3 flex-1 disabled:opacity-50" onClick={() => send({ name: f.name, price: Number(f.price), category: f.category, popular: f.popular, hidden: f.hidden, kakobuyUrl: f.kakobuyUrl })}>
            Save
          </button>
          {item.edited && (
            <button disabled={busy} className="btn-secondary px-5 py-3 text-sm" onClick={() => confirm("Undo all edits on this product?") && send({ reset: true })}>
              Reset
            </button>
          )}
        </div>
        <p className="text-[0.65rem] mt-3" style={{ color: "var(--text-dim)" }}>
          Changes go live on the site within a few seconds. Photos and QC photos are not editable here.
        </p>
      </div>
    </div>
  );
}

function ProductsTab() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [only, setOnly] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ items: Item[]; total: number; pages: number } | null>(null);
  const [editing, setEditing] = useState<Item | null>(null);

  const load = useCallback(async () => {
    const p = new URLSearchParams({ q, category, only, page: String(page) });
    const r = await api<{ items: Item[]; total: number; pages: number }>(`/api/admin/products?${p}`);
    if (r.ok) setData(r.data);
  }, [q, category, only, page]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div>
      <div className="grid gap-3 md:grid-cols-[1fr_180px_180px] mb-4">
        <input className={inputCls} style={inputStyle} placeholder="Search by name or id…" value={q} onChange={(e) => (setQ(e.target.value), setPage(1))} />
        <select className={inputCls} style={inputStyle} value={category} onChange={(e) => (setCategory(e.target.value), setPage(1))}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c} style={{ color: "#000" }}>
              {c}
            </option>
          ))}
        </select>
        <select className={inputCls} style={inputStyle} value={only} onChange={(e) => (setOnly(e.target.value), setPage(1))}>
          <option value="">Everything</option>
          <option value="edited">Edited</option>
          <option value="hidden">Hidden</option>
          <option value="qc">With QC photos</option>
          <option value="noqc">Without QC photos</option>
        </select>
      </div>
      <p className="text-xs mb-3" style={{ color: "var(--text-dim)" }}>
        {data ? `${data.total.toLocaleString()} products` : "Loading…"}
      </p>
      <div className="space-y-2">
        {data?.items.map((it) => (
          <button key={it.id} onClick={() => setEditing(it)} className="w-full text-left rounded-2xl p-3 flex items-center gap-4 hover:bg-white/5 transition-colors" style={card}>
            <span className="w-14 h-14 rounded-xl overflow-hidden shrink-0 flex items-center justify-center" style={{ background: "rgba(70,46,100,0.5)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {it.image && <img src={it.image} alt="" loading="lazy" className="w-full h-full object-contain" />}
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-bold truncate" style={{ opacity: it.hidden ? 0.5 : 1 }}>
                {it.name}
              </span>
              <span className="block text-xs mt-0.5" style={{ color: "var(--text-dim)" }}>
                #{it.id} · {it.category} · ${it.price}
                {it.qcN > 0 && ` · ${it.qcN} QC`}
                {it.popular && " · trending"}
                {it.hidden && " · HIDDEN"}
                {it.edited && " · edited"}
              </span>
            </span>
            <span className="text-xs font-bold" style={{ color: "var(--amber)" }}>
              Edit
            </span>
          </button>
        ))}
      </div>
      {data && data.pages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6 text-sm">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="btn-secondary px-4 py-2 disabled:opacity-40">
            ← Prev
          </button>
          <span style={{ color: "var(--text-muted)" }}>
            {page} / {data.pages}
          </span>
          <button disabled={page >= data.pages} onClick={() => setPage(page + 1)} className="btn-secondary px-4 py-2 disabled:opacity-40">
            Next →
          </button>
        </div>
      )}
      {editing && (
        <ProductEditor
          item={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl p-5" style={card}>
      <p className="text-xs font-bold tracking-widest uppercase" style={{ color: "var(--text-dim)" }}>{label}</p>
      <p className="price-tag text-3xl mt-1">{value}</p>
    </div>
  );
}

function Overview({ c, me }: { c: ReturnType<typeof useContent>; me: Me }) {
  const [stats, setStats] = useState<{ total: number; qc: number; hidden: number; edited: number } | null>(null);
  useEffect(() => {
    (async () => {
      const [a, b, h, e] = await Promise.all(
        ["", "qc", "hidden", "edited"].map((only) => api<{ total: number }>(`/api/admin/products?only=${only}&page=1`))
      );
      setStats({ total: a.data.total, qc: b.data.total, hidden: h.data.total, edited: e.data.total });
    })();
  }, []);
  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Products" value={stats ? stats.total.toLocaleString() : "…"} />
        <Stat label="With QC photos" value={stats ? stats.qc.toLocaleString() : "…"} />
        <Stat label="Active coupons" value={c.coupons.filter((x) => x.active).length} />
        <Stat label="Active notices" value={c.notices.filter((x) => x.active).length} />
      </div>
      <div className="rounded-2xl p-5 mt-4 text-sm leading-relaxed" style={card}>
        <p style={{ color: "var(--text-muted)" }}>
          Edited products: <strong>{stats?.edited ?? "…"}</strong> · Hidden products: <strong>{stats?.hidden ?? "…"}</strong>
        </p>
        {me.writable === false && (
          <p className="mt-3" style={{ color: "#ff9aa6" }}>
            ⚠ The server storage is read-only here, so saving will fail. Admin edits work on the Fly.io deploy (volume mounted at <code>/data</code>).
          </p>
        )}
      </div>
    </div>
  );
}

const TABS = ["Overview", "Coupons", "Notifications", "Community", "Products"] as const;

export default function AdminApp() {
  const [me, setMe] = useState<Me | null>(null);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  const content = useContent();

  const refresh = useCallback(async () => {
    const r = await api<Me>("/api/admin/me");
    setMe(r.data as Me);
  }, []);
  useEffect(() => {
    api<Me>("/api/admin/me").then((r) => setMe(r.data as Me));
  }, []);

  if (!me) return <p className="text-center py-20" style={{ color: "var(--text-dim)" }}>Loading…</p>;
  if (!me.authenticated) return <Login configured={me.configured} onDone={refresh} />;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <p className="eyebrow mb-2">Control room</p>
          <h1 className="section-title text-3xl md:text-4xl">Admin</h1>
        </div>
        <button
          className="btn-secondary px-5 py-2.5 text-sm"
          onClick={async () => {
            await api("/api/admin/logout", { method: "POST" });
            refresh();
          }}
        >
          Sign out
        </button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`nav-link ${tab === t ? "active" : ""}`} style={{ whiteSpace: "nowrap" }}>
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && <Overview c={content} me={me} />}
      {tab === "Coupons" && <CouponsTab c={content} />}
      {tab === "Notifications" && <NoticesTab c={content} />}
      {tab === "Community" && <CommunityTab c={content} />}
      {tab === "Products" && <ProductsTab />}
    </div>
  );
}
