"use client";

import { useEffect, useState, useCallback } from "react";
import {
  RefreshCw,
  Download,
  ExternalLink,
  Bookmark,
  CheckCircle2,
  XCircle,
  Building2,
  Filter,
  Layers,
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
  if (score >= 12) return { label: "Strong" };
  if (score >= 8) return { label: "Good" };
  return { label: "Fair" };
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
    "bg-elevated border border-border rounded-sm pl-3 pr-8 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary appearance-none";

  return (
    <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">JobScout</h1>
          <p className="text-xs text-muted mt-0.5">Tracked listings across your target roles</p>
        </div>
        <button
          onClick={runFetch}
          disabled={fetching}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover active:scale-[0.98] transition text-white text-sm font-medium px-4 py-2.5 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-primary/20"
        >
          <RefreshCw size={15} className={fetching ? "animate-spin" : ""} />
          {fetching ? "Fetching" : "Fetch new"}
        </button>
      </div>

      {fetchResult && (
        <div className="text-xs text-primary bg-primary/10 border border-primary/20 rounded-sm px-3 py-2 -mt-3">
          {fetchResult}
        </div>
      )}

      {/* Stat tiles */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "New", value: totalNew },
          { label: "Saved", value: totalSaved },
          { label: "Applied", value: totalApplied },
        ].map((tile) => (
          <div
            key={tile.label}
            className="bg-primary/10 border border-primary/25 border-t-2 border-t-primary rounded-md px-4 py-3"
          >
            <div className="text-[11px] text-muted uppercase tracking-wider font-medium">{tile.label}</div>
            <div className="font-mono text-2xl mt-1 font-semibold text-primary">{tile.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-muted text-xs mr-1">
          <Filter size={13} />
        </div>
        <div className="relative">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectClass}>
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="relative">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectClass}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <input
          type="number"
          placeholder="Min score"
          value={minScore}
          onChange={(e) => setMinScore(e.target.value)}
          className="bg-elevated border border-border rounded-sm px-3 py-2 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
        />
        <a
          href={`/api/export?${exportParams}`}
          className="flex items-center gap-1.5 bg-primary/15 border border-primary/25 hover:bg-primary/25 transition rounded-sm px-3 py-2 text-sm text-primary ml-auto"
        >
          <Download size={14} />
          Export
        </a>
      </div>

      {/* Listings */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-primary/[0.04] border border-primary/20 rounded-md p-4 h-20 animate-pulse" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-12 text-muted text-sm border border-dashed border-primary/25 rounded-md">
          <Layers size={24} className="mx-auto mb-2 opacity-40" />
          No listings match these filters
        </div>
      ) : (
        <div className="space-y-2.5">
          {listings.map((l) => {
            const tier = scoreTier(l.score);
            return (
              <div
                key={l.id}
                className="bg-primary/[0.04] border border-primary/20 hover:border-primary/50 hover:bg-primary/[0.07] transition rounded-md p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium leading-snug truncate">{l.title}</div>
                    <div className="flex items-center gap-1.5 text-xs text-muted mt-1.5">
                      <Building2 size={12} />
                      <span className="truncate">{l.company || "Unknown"}</span>
                      <span className="text-border">·</span>
                      <span className="capitalize">{l.category.replace("-", " ")}</span>
                      <span className="text-border">·</span>
                      <span>{l.source}</span>
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-0.5">
                    <span className="font-mono text-sm font-semibold text-primary bg-primary/15 px-2 py-0.5 rounded-full">
                      {l.score}
                    </span>
                    <span className="text-[10px] text-muted uppercase tracking-wide">{tier.label}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3.5 pt-3 border-t border-primary/15">
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <ExternalLink size={12} />
                    View
                  </a>
                  <div className="flex items-center gap-1.5 ml-auto">
                    <button
                      onClick={() => updateStatus(l.id, "saved")}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-sm bg-primary/15 text-primary hover:bg-primary/25 transition font-medium"
                    >
                      <Bookmark size={12} />
                      Save
                    </button>
                    <button
                      onClick={() => updateStatus(l.id, "applied")}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-sm bg-primary text-white hover:bg-primary-hover transition font-medium"
                    >
                      <CheckCircle2 size={12} />
                      Applied
                    </button>
                    <button
                      onClick={() => updateStatus(l.id, "rejected")}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-sm border border-primary/20 text-muted hover:bg-primary/10 hover:text-primary transition"
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
