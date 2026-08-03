"use client";

import { useEffect, useState, useCallback } from "react";

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
      setFetchResult(`+${data.totalNew} new listing(s)`);
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

  return (
    <main className="max-w-3xl mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">JobScout</h1>
        <button
          onClick={runFetch}
          disabled={fetching}
          className="bg-primary text-white text-sm px-4 py-2 rounded-sm disabled:opacity-50"
        >
          {fetching ? "Fetching..." : "Fetch new"}
        </button>
      </div>

      {fetchResult && <p className="text-xs text-muted -mt-4">{fetchResult}</p>}

      {/* Stat tiles */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "New", value: totalNew, color: "text-info" },
          { label: "Saved", value: totalSaved, color: "text-warning" },
          { label: "Applied", value: totalApplied, color: "text-success" },
        ].map((tile) => (
          <div
            key={tile.label}
            className="bg-surface border border-border rounded-md p-3 border-t-2"
            style={{ borderTopColor: "currentColor" }}
          >
            <div className="text-xs text-muted uppercase tracking-wide">{tile.label}</div>
            <div className={`font-mono text-2xl mt-1 ${tile.color}`}>{tile.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-elevated border border-border rounded-sm px-3 py-2 text-sm"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-elevated border border-border rounded-sm px-3 py-2 text-sm"
        >
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
          className="bg-elevated border border-border rounded-sm px-3 py-2 text-sm w-28"
        />
      </div>

      {/* Listings */}
      {loading ? (
        <p className="text-muted text-sm">Loading...</p>
      ) : listings.length === 0 ? (
        <p className="text-muted text-sm">No listings match these filters.</p>
      ) : (
        <div className="space-y-2">
          {listings.map((l) => (
            <div key={l.id} className="bg-surface border border-border rounded-md p-3">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <div className="text-sm font-medium">{l.title}</div>
                  <div className="text-xs text-muted mt-0.5">
                    {l.company || "—"} · {l.category} · via {l.source}
                  </div>
                </div>
                <span className="font-mono text-xs text-primary shrink-0">{l.score}</span>
              </div>
              <div className="flex gap-2 mt-3">
                <a
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-info underline"
                >
                  View
                </a>
                <button onClick={() => updateStatus(l.id, "saved")} className="text-xs text-warning ml-auto">
                  Save
                </button>
                <button onClick={() => updateStatus(l.id, "applied")} className="text-xs text-success">
                  Applied
                </button>
                <button onClick={() => updateStatus(l.id, "rejected")} className="text-xs text-error">
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
