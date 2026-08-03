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
  Inbox,
  ClipboardCheck,
  Send,
  Radar,
} from "lucide-react";

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

function scoreTier(score: number) {
  if (score >= 12) return { label: "Strong", solid: true };
  if (score >= 8) return { label: "Good", solid: false };
  return { label: "Fair", solid: false };
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
    "bg-elevated border border-border rounded-lg pl-3 pr-8 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary appearance-none font-medium";

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-7">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 shrink-0">
            <Radar size={20} className="text-white" />
            <span className="absolute inset-0 rounded-xl bg-primary animate-ping opacity-20" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight leading-none">JobScout</h1>
            <p className="text-xs text-muted mt-1">Tracked listings across your target roles</p>
          </div>
        </div>
        <button
          onClick={runFetch}
          disabled={fetching}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover active:scale-[0.97] transition-all text-white text-sm font-medium px-4 py-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
        >
          <RefreshCw size={15} className={fetching ? "animate-spin" : ""} />
          {fetching ? "Fetching" : "Fetch new"}
        </button>
      </div>

      {fetchResult && (
        <div className="text-xs text-primary bg-primary/10 border border-primary/20 rounded-xl px-3.5 py-2.5 -mt-4 font-medium">
          {fetchResult}
        </div>
      )}

      {/* Stat tiles */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "New", value: totalNew, Icon: Inbox, filterValue: "new" },
          { label: "Saved", value: totalSaved, Icon: Bookmark, filterValue: "saved" },
          { label: "Applied", value: totalApplied, Icon: ClipboardCheck, filterValue: "applied" },
        ].map((tile) => {
          const active = status === tile.filterValue;
          return (
            <button
              key={tile.label}
              onClick={() => setStatus(active ? "" : tile.filterValue)}
              className={`text-left bg-gradient-to-b from-primary/15 to-primary/5 border rounded-2xl px-4 py-4 transition ${
                active ? "border-primary ring-2 ring-primary/30" : "border-primary/25 hover:border-primary/50"
              }`}
            >
              <tile.Icon size={16} className="text-primary mb-2" />
              <div className="font-mono text-2xl font-semibold text-text">{tile.value}</div>
              <div className="text-[11px] text-muted uppercase tracking-wider font-medium mt-0.5">{tile.label}</div>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={14} className="text-muted mr-1" />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectClass}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectClass}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Min score"
          value={minScore}
          onChange={(e) => setMinScore(e.target.value)}
          className="bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm w-24 font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
        />
        <a
          href={`/api/export?${exportParams}`}
          className="flex items-center gap-1.5 bg-primary/15 border border-primary/25 hover:bg-primary/25 transition rounded-lg px-3.5 py-2.5 text-sm text-primary ml-auto font-medium"
        >
          <Download size={14} />
          Export
        </a>
      </div>

      {/* Listings */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface border border-border rounded-2xl p-5 h-24 animate-pulse" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Inbox size={20} className="text-primary" />
          </div>
          <p className="text-sm text-muted">No listings match these filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((l) => {
            const tier = scoreTier(l.score);
            return (
              <div
                key={l.id}
                className="bg-surface border border-border hover:border-primary/40 hover:-translate-y-0.5 transition-all rounded-2xl p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-[15px] font-semibold leading-snug">{l.title}</div>
                    <div className="flex items-center gap-1.5 text-xs text-muted mt-2">
                      <Building2 size={12} />
                      <span className="truncate">{l.company || "Unknown"}</span>
                      <span className="text-border">·</span>
                      <span>{l.source}</span>
                    </div>
                    <span className="inline-block mt-2.5 text-[11px] font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full capitalize">
                      {l.category.replace("-", " ")}
                    </span>
                  </div>
                  <div
                    className={`shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-full ${
                      tier.solid ? "bg-primary text-white" : "bg-primary/10 text-primary"
                    }`}
                  >
                    <span className="font-mono text-sm font-bold leading-none">{l.score}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
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
                      className="flex items-center gap-1 text-xs px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition font-medium"
                    >
                      <Bookmark size={12} />
                      Save
                    </button>
                    <button
                      onClick={() => updateStatus(l.id, "applied")}
                      className="flex items-center gap-1 text-xs px-3 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover transition font-medium"
                    >
                      <Send size={12} />
                      Applied
                    </button>
                    <button
                      onClick={() => updateStatus(l.id, "rejected")}
                      className="flex items-center gap-1 text-xs px-3 py-2 rounded-lg border border-border text-muted hover:bg-error/10 hover:text-error hover:border-error/30 transition"
                    >
                      <XCircle size={12} />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
