"use client";

import { useEffect, useState, useCallback } from "react";
import {
  RefreshCw,
  ExternalLink,
  ArrowUpCircle,
  MessageCircle,
  Send,
  XCircle,
  Radar,
  Sun,
  Moon,
  Rocket,
} from "lucide-react";
import Link from "next/link";

type Lead = {
  id: string;
  product_name: string;
  tagline: string;
  description: string;
  url: string;
  website: string;
  votes: number;
  comments_count: number;
  maker_name: string;
  maker_username: string;
  topics: string;
  launched_at: string;
  status: string;
};

const TOPICS = ["developer-tools", "artificial-intelligence", "saas", "no-code", "design-tools", "marketing"];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [topic, setTopic] = useState("developer-tools");
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
    const res = await fetch("/api/leads?limit=50");
    setLeads(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function runFetch() {
    setFetching(true);
    setFetchResult(null);
    try {
      const res = await fetch(`/api/ph-fetch?topic=${topic}`, { method: "POST" });
      const data = await res.json();
      setFetchResult(`+${data.totalNew} new launch${data.totalNew === 1 ? "" : "es"}`);
      await load();
    } catch {
      setFetchResult("Fetch failed — check connection");
    } finally {
      setFetching(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-bg/80 border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-elevated border border-border flex items-center justify-center shrink-0">
              <Rocket size={18} className="text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight leading-none">Leads</h1>
              <p className="text-[10px] text-muted mt-1 font-mono uppercase tracking-wider">
                Fresh Product Hunt launches
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
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-4 pb-3 flex gap-2 text-xs">
          <Link href="/" className="px-3 py-1.5 rounded-lg text-muted hover:bg-elevated transition flex items-center gap-1.5">
            <Radar size={12} />
            Jobs
          </Link>
          <span className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-medium flex items-center gap-1.5">
            <Rocket size={12} />
            Leads
          </span>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="bg-elevated border border-border rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            {TOPICS.map((t) => (
              <option key={t} value={t}>{t.replace(/-/g, " ")}</option>
            ))}
          </select>
          <button
            onClick={runFetch}
            disabled={fetching}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover active:scale-[0.97] transition text-white text-sm font-medium px-4 py-2.5 rounded-xl disabled:opacity-50 shadow-lg shadow-primary/25 ml-auto"
          >
            <RefreshCw size={15} className={fetching ? "animate-spin" : ""} />
            {fetching ? "Fetching" : "Fetch launches"}
          </button>
        </div>

        {fetchResult && (
          <div className="text-xs text-primary bg-primary/10 border border-primary/20 rounded-xl px-3.5 py-2.5 font-mono">
            {fetchResult}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-surface border border-border rounded-2xl p-5 h-32 animate-pulse" />
            ))}
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-2xl">
            <Rocket size={24} className="text-primary mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted">No launches yet — tap fetch to pull today&apos;s top products</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leads.map((l) => (
              <div
                key={l.id}
                className="bg-surface border border-border hover:border-primary/40 transition-all rounded-2xl p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="text-[15px] font-semibold leading-snug">{l.product_name}</div>
                    <p className="text-xs text-muted mt-1.5 leading-relaxed">{l.tagline}</p>
                    <div className="flex items-center gap-3 text-xs text-muted mt-2.5 font-mono">
                      <span className="flex items-center gap-1"><ArrowUpCircle size={12} />{l.votes}</span>
                      <span className="flex items-center gap-1"><MessageCircle size={12} />{l.comments_count}</span>
                    </div>
                    {l.maker_name && (
                      <p className="text-xs text-primary mt-2">
                        by {l.maker_name}{l.maker_username ? ` (@${l.maker_username})` : ""}
                      </p>
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
                    PH Post
                  </a>
                  {l.website && (
                    <a
                      href={l.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-muted hover:text-text"
                    >
                      <ExternalLink size={12} />
                      Website
                    </a>
                  )}
                  <div className="flex items-center gap-1.5 ml-auto">
                    <button
                      onClick={() => updateStatus(l.id, "contacted")}
                      className="flex items-center gap-1 text-xs px-3 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover transition font-medium"
                    >
                      <Send size={12} />
                      Contacted
                    </button>
                    <button
                      onClick={() => updateStatus(l.id, "dismissed")}
                      className="flex items-center gap-1 text-xs px-3 py-2 rounded-lg border border-border text-muted hover:bg-error/10 hover:text-error transition"
                    >
                      <XCircle size={12} />
                      Dismiss
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
