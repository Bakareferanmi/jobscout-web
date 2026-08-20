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
  MessageSquarePlus,
  Copy,
  Check,
  Loader2,
  UserRound,
  Eye,
  EyeOff,
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
  opportunity_type: string | null;
  match_score: number | null;
  lead_type: string | null;
  commercial_value: string | null;
  recommended_action: string | null;
};

const OPPORTUNITY_STYLES: Record<string, string> = {
  JOB: "bg-elevated text-muted border-border",
  CLIENT: "bg-primary/15 text-primary border-primary/30",
  STARTUP: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  FREELANCE: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  WEB3: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  IGNORE: "bg-elevated text-muted border-border",
};

const COMMERCIAL_VALUE_STYLES: Record<string, string> = {
  HIGH: "bg-emerald-500/15 text-emerald-500",
  MEDIUM: "bg-amber-500/15 text-amber-500",
  LOW: "bg-elevated text-muted",
  NONE: "bg-elevated text-muted",
};

type StatRow = { category: string; status: string; n: number };

const CATEGORIES = ["frontend", "data-analysis", "digital-marketing", "electrical", "it-support", "web3"];
const STATUSES = ["new", "saved", "applied", "rejected"];

export default function Dashboard() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [stats, setStats] = useState<StatRow[]>([]);
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [minScore, setMinScore] = useState("");
  const [opportunityType, setOpportunityType] = useState("");
  const [commercialValue, setCommercialValue] = useState("");
  const [sort, setSort] = useState("score");
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [fetchResult, setFetchResult] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(true);
  const [openPitchId, setOpenPitchId] = useState<string | null>(null);
  const [pitchLoading, setPitchLoading] = useState<string | null>(null);
  const [pitches, setPitches] = useState<Record<string, { subject: string; message: string }>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

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
    if (opportunityType) params.set("opportunityType", opportunityType);
    if (commercialValue) params.set("commercialValue", commercialValue);
    if (sort !== "score") params.set("sort", sort);
    if (showCompleted) params.set("showDone", "1");
    params.set("limit", "50");

    const [listingsRes, statsRes] = await Promise.all([
      fetch(`/api/listings?${params}`).then((r) => r.json()),
      fetch("/api/stats").then((r) => r.json()),
    ]);
    setListings(listingsRes);
    setStats(statsRes);
    setLoading(false);
  }, [category, status, minScore, opportunityType, commercialValue, sort, showCompleted]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(id: string, newStatus: string) {
    // Instantly reflect the change — no waiting on the refetch. If it's
    // now applied/rejected and we're not showing completed ones, drop it
    // from view right away instead of leaving it cluttering the list.
    setListings((prev) =>
      !showCompleted && (newStatus === "applied" || newStatus === "rejected")
        ? prev.filter((l) => l.id !== id)
        : prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
    );
    const res = await fetch(`/api/listings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!res.ok) {
      setFetchResult("Status update failed — reloading to show the real state");
    }
    load();
  }

  async function togglePitch(id: string) {
    if (openPitchId === id) {
      setOpenPitchId(null);
      return;
    }
    setOpenPitchId(id);
    if (!pitches[id]) {
      setPitchLoading(id);
      try {
        const res = await fetch(`/api/pitch/${id}`);
        const data = await res.json();
        if (res.ok) setPitches((prev) => ({ ...prev, [id]: data }));
      } finally {
        setPitchLoading(null);
      }
    }
  }

  async function copyPitch(id: string) {
    const pitch = pitches[id];
    if (!pitch) return;
    await navigator.clipboard.writeText(`Subject: ${pitch.subject}\n\n${pitch.message}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
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
    ...(opportunityType ? { opportunityType } : {}),
    ...(commercialValue ? { commercialValue } : {}),
    ...(sort !== "score" ? { sort } : {}),
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
          <Link href="/profile" className="px-3 py-1.5 rounded-lg text-muted hover:bg-elevated transition flex items-center gap-1.5">
            <UserRound size={12} />
            Profile
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

        {/* Lead-scoring filters */}
        <div className="flex items-center gap-2 flex-wrap -mt-3">
          <div className="relative">
            <select value={opportunityType} onChange={(e) => setOpportunityType(e.target.value)} className={selectClass}>
              <option value="">All types</option>
              <option value="JOB">Job</option>
              <option value="CLIENT">Client</option>
              <option value="STARTUP">Startup</option>
              <option value="FREELANCE">Freelance</option>
              <option value="WEB3">Web3</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          </div>

          <div className="relative">
            <select value={commercialValue} onChange={(e) => setCommercialValue(e.target.value)} className={selectClass}>
              <option value="">Any value</option>
              <option value="HIGH">High value</option>
              <option value="MEDIUM">Medium value</option>
              <option value="LOW">Low value</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          </div>

          <div className="relative">
            <select value={sort} onChange={(e) => setSort(e.target.value)} className={selectClass}>
              <option value="score">Sort: score</option>
              <option value="match">Sort: match %</option>
              <option value="value">Sort: lead value</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          </div>

          <button
            onClick={() => setShowCompleted((v) => !v)}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition border ${
              showCompleted
                ? "bg-primary/15 border-primary/30 text-primary"
                : "bg-elevated border-border text-muted hover:border-primary/40"
            }`}
          >
            {showCompleted ? <Eye size={14} /> : <EyeOff size={14} />}
            <span className="hidden sm:inline">Completed</span>
          </button>
        </div>

        {/* Listings */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-surface border border-border rounded-2xl p-5 h-32 animate-pulse" />
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
                className="bg-surface border border-border hover:border-primary/40 transition-all rounded-2xl p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="text-[15px] font-semibold leading-snug">{l.title}</div>
                    <p className="text-xs text-muted mt-1.5 leading-relaxed flex items-center gap-1.5">
                      <Building2 size={12} className="shrink-0" />
                      {l.company || "Unknown"}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted mt-2.5 font-mono">
                      <span className="flex items-center gap-1 text-primary font-semibold">
                        <Radar size={12} />
                        {l.score}
                      </span>
                      <span>{l.source}</span>
                    </div>
                    <p className="text-xs text-primary mt-2">#{l.category.replace(/-/g, "_")}</p>
                    {l.opportunity_type && (
                      <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                        <span
                          className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-md border ${
                            OPPORTUNITY_STYLES[l.opportunity_type] || OPPORTUNITY_STYLES.JOB
                          }`}
                        >
                          {l.opportunity_type}
                        </span>
                        {l.commercial_value && l.commercial_value !== "NONE" && (
                          <span
                            className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-md ${
                              COMMERCIAL_VALUE_STYLES[l.commercial_value] || COMMERCIAL_VALUE_STYLES.LOW
                            }`}
                          >
                            {l.commercial_value} value
                          </span>
                        )}
                        {l.match_score !== null && (
                          <span className="text-[10px] font-mono text-muted">
                            match {l.match_score}%
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border flex-wrap">
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-primary font-medium hover:underline"
                  >
                    <ExternalLink size={12} />
                    View
                  </a>
                  {l.recommended_action && l.recommended_action !== "IGNORE" && (
                    <button
                      onClick={() => togglePitch(l.id)}
                      className="flex items-center gap-1 text-xs text-primary font-medium hover:underline"
                    >
                      <MessageSquarePlus size={12} />
                      Pitch
                    </button>
                  )}
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
                      className="flex items-center gap-1 text-xs px-3 py-2 rounded-lg border border-border text-muted hover:bg-error/10 hover:text-error transition"
                    >
                      <XCircle size={12} />
                      Reject
                    </button>
                  </div>
                </div>

                {openPitchId === l.id && (
                  <div className="mt-3 pt-3 border-t border-border">
                    {pitchLoading === l.id ? (
                      <div className="flex items-center gap-2 text-xs text-muted py-4 justify-center font-mono">
                        <Loader2 size={14} className="animate-spin" />
                        Writing pitch
                      </div>
                    ) : pitches[l.id] ? (
                      <div className="bg-elevated border border-border rounded-xl p-3.5 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-text">{pitches[l.id].subject}</p>
                          <button
                            onClick={() => copyPitch(l.id)}
                            className="flex items-center gap-1 text-[11px] text-primary font-medium shrink-0 hover:underline"
                          >
                            {copiedId === l.id ? <Check size={12} /> : <Copy size={12} />}
                            {copiedId === l.id ? "Copied" : "Copy"}
                          </button>
                        </div>
                        <p className="text-xs text-muted whitespace-pre-line leading-relaxed">
                          {pitches[l.id].message}
                        </p>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
