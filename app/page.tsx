"use client";

import { useEffect, useState, useCallback } from "react";
import {
  RefreshCw,
  Download,
  ExternalLink,
  Bookmark,
  XCircle,
  Building2,
  Filter,
  Radar,
  ChevronDown,
  Sun,
  Moon,
  Send,
  Rocket,
} from "lucide-react";
import Link from "next/link";

type Listing = {
  id: string;
  kind: string;
  category: string;
  title: string;
  company: string | null;
  location: string | null;
  url: string;
  source: string;
  score: number;
  status: string;
  fetched_at: string;
};

type StatRow = { category: string; status: string; n: number };

const CATEGORIES = ["frontend", "data-analysis", "digital-marketing", "electrical", "it-support"];
const STATUSES = ["new", "saved", "applied", "rejected"];

function signalBars(score: number) {
  if (score >= 14) return 4;
  if (score >= 10) return 3;
  if (score >= 6) return 2;
  return 1;
}

function SignalMeter({ score }: { score: number }) {
  const filled = signalBars(score);
  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex items-end gap-0.5 h-4">
        {[1, 2, 3, 4].map((bar) => (
          <div
            key={bar}
            className={`w-1 rounded-full transition-colors ${bar <= filled ? "bg-primary" : "bg-border"}`}
            style={{ height: `${bar * 25}%` }}
          />
        ))}
      </div>
      <span className="font-mono text-xs font-bold text-primary leading-none">{score}</span>
    </div>
  );
}

export default function Dashboard() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [stats, setStats] = useState<StatRow[]>([]);
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [minScore, setMinScore] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [fetchResult, setFetchResult] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (status) params.set("status", status);
    if (minScore) params.set("minScore", minScore);
    params.set("limit", "50");

    const [listingsRes, statsRes] = await Promise.all([
      fetch(`/api/listings?${params}`).then((r) => r.json()),
      fetch("/api/stats").then((r) => r.json()),
    ]);
    setListings(listingsRes);
    setStats(statsRes);
    setLoading(false);
  }, [category, status, minScore]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(id: string, newStatus: string) {
    await fetch(`/api/listings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    load();
  }

  async function runFetch() {
    setFetching(true);
    setFetchResult(null);
    try {
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      const res = await fetch(`/api/fetch?${params}`, { method: "POST" });
      const data = await res.json();
      setFetchResult(`+${data.totalNew} new listing${data.totalNew === 1 ? "" : "s"}`);
      await load();
    } catch {
      setFetchResult("Fetch failed — check connection");
    } finally {
      setFetching(false);
    }
  }

  const totalNew = stats.filter((s) => s.status === "new").reduce((sum, s) => sum + s.n, 0);
  const totalSaved = stats.filter((s) => s.status === "saved").reduce((sum, s) => sum + s.n, 0);
  const totalApplied = stats.filter((s) => s.status === "applied").reduce((sum, s) => sum + s.n, 0);

  const exportParams = new URLSearchParams({
    ...(category ? { category } : {}),
    ...(status ? { status } : {}),
    ...(minScore ? { minScore } : {}),
  });

  const selectClass =
    "bg-elevated border border-border rounded-xl pl-3.5 pr-8 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary appearance-none font-medium cursor-pointer hover:border-primary/40 transition";

  const statTiles = [
    { label: "New", value: totalNew, filterValue: "new" },
    { label: "Saved", value: totalSaved, filterValue: "saved" },
    { label: "Applied", value: totalApplied, filterValue: "applied" },
  ];

  return (
    <div className="min-h-screen">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-bg/80 border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-elevated border border-border flex items-center justify-center shrink-0 overflow-hidden">
              <div
                className="radar-sweep absolute inset-0"
                style={{
                  background: "conic-gradient(from 0deg, transparent 0deg, transparent 300deg, var(--color-primary) 360deg)",
                  opacity: 0.5,
                }}
              />
              <Radar size={18} className="text-primary relative z-10" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight leading-none">JobScout</h1>
              <p className="text-[10px] text-muted mt-1 hidden sm:block font-mono uppercase tracking-wider">
                Scanning {CATEGORIES.length} channels
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-border bg-elevated hover:border-primary/40 transition shrink-0"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={16} className="text-muted" /> : <Moon size={16} className="text-muted" />}
            </button>
            <button
              onClick={runFetch}
              disabled={fetching}
              className="flex items-center gap-2 bg-primary hover:bg-primary-hover active:scale-[0.97] transition-all text-white text-sm font-medium px-4 py-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
            >
              <RefreshCw size={15} className={fetching ? "animate-spin" : ""} />
              <span className="hidden sm:inline">{fetching ? "Scanning" : "Scan now"}</span>
            </button>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-4 pb-3 flex gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-medium flex items-center gap-1.5">
            <Radar size={12} />
            Jobs
          </span>
          <Link href="/leads" className="px-3 py-1.5 rounded-lg text-muted hover:bg-elevated transition flex items-center gap-1.5">
            <Rocket size={12} />
            Leads
          </Link>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {fetchResult && (
          <div className="text-xs text-primary bg-primary/10 border border-primary/20 rounded-xl px-3.5 py-2.5 font-mono">
            {fetchResult}
          </div>
        )}

        {/* Console-style stat strip */}
        <div className="flex bg-surface border border-border rounded-2xl overflow-hidden">
          {statTiles.map((tile, i) => {
            const active = status === tile.filterValue;
            return (
              <button
                key={tile.label}
                onClick={() => setStatus(active ? "" : tile.filterValue)}
                className={`flex-1 text-left px-4 py-4 transition-colors relative ${
                  active ? "bg-primary/10" : "hover:bg-elevated"
                } ${i > 0 ? "border-l border-border" : ""}`}
              >
                {active && <span className="absolute top-0 left-0 right-0 h-0.5 bg-primary" />}
                <div className="font-mono text-2xl font-semibold leading-none text-text">
                  {String(tile.value).padStart(2, "0")}
                </div>
                <div className="text-[10px] text-muted uppercase tracking-widest font-medium mt-2">
                  {tile.label}
                </div>
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} className="text-muted mr-0.5 shrink-0" />

          <div className="relative">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectClass}>
              <option value="">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.replace("-", " ")}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          </div>

          <div className="relative">
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectClass}>
              <option value="">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          </div>

          <input
            type="number"
            placeholder="Min score"
            value={minScore}
            onChange={(e) => setMinScore(e.target.value)}
            className="bg-elevated border border-border rounded-xl px-3.5 py-2.5 text-sm w-24 font-mono focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary hover:border-primary/40 transition"
          />

          <a
            href={`/api/export?${exportParams}`}
            className="flex items-center gap-1.5 bg-primary/15 border border-primary/25 hover:bg-primary/25 transition rounded-xl px-3.5 py-2.5 text-sm text-primary ml-auto font-medium"
          >
            <Download size={14} />
            Export
          </a>
        </div>

        {/* Listings */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-surface border border-border rounded-2xl p-5 h-28 animate-pulse" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-2xl">
            <Radar size={24} className="text-primary mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted font-mono">No signal — nothing matches these filters</p>
          </div>
        ) : (
          <div className="space-y-3">
            {listings.map((l) => (
              <div
                key={l.id}
                className="bg-surface border border-border border-l-4 border-l-primary/60 hover:border-l-primary hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/20 transition-all rounded-2xl p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="text-[15px] font-semibold leading-snug tracking-tight">{l.title}</div>
                    <div className="flex items-center gap-1.5 text-xs text-muted mt-2">
                      <Building2 size={12} className="shrink-0" />
                      <span className="truncate">{l.company || "Unknown"}</span>
                      <span className="text-border">·</span>
                      <span className="shrink-0">{l.source}</span>
                    </div>
                    <span className="inline-block mt-2.5 text-[11px] font-mono text-primary/80">
                      #{l.category.replace(/-/g, "_")}
                    </span>
                  </div>
                  <SignalMeter score={l.score} />
                </div>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-dashed border-border">
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-primary font-medium hover:underline"
                  >
                    <ExternalLink size={12} />
                    View
                  </a>
                  <div className="flex items-center gap-1.5 ml-auto">
                    <button
                      onClick={() => updateStatus(l.id, "saved")}
                      className="flex items-center gap-1 text-xs px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 active:scale-95 transition font-medium"
                    >
                      <Bookmark size={12} />
                      Save
                    </button>
                    <button
                      onClick={() => updateStatus(l.id, "applied")}
                      className="flex items-center gap-1 text-xs px-3 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover active:scale-95 transition font-medium"
                    >
                      <Send size={12} />
                      Applied
                    </button>
                    <button
                      onClick={() => updateStatus(l.id, "rejected")}
                      className="flex items-center gap-1 text-xs px-3 py-2 rounded-lg border border-border text-muted hover:bg-error/10 hover:text-error hover:border-error/30 active:scale-95 transition"
                    >
                      <XCircle size={12} />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
