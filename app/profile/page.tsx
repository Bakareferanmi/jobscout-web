import { DEFAULT_PROFILE } from "@/lib/profile";
import { Radar, Rocket, UserRound, Mail, Code2, Globe } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const profile = DEFAULT_PROFILE;

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-bg/80 border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-elevated border border-border flex items-center justify-center shrink-0">
            <UserRound size={18} className="text-primary" />
          </div>
          <h1 className="text-lg font-semibold tracking-tight leading-none">Profile</h1>
        </div>
        <div className="max-w-3xl mx-auto px-4 pb-3 flex gap-2 text-xs">
          <Link href="/" className="px-3 py-1.5 rounded-lg text-muted hover:bg-elevated transition flex items-center gap-1.5">
            <Radar size={12} />
            Jobs
          </Link>
          <Link href="/leads" className="px-3 py-1.5 rounded-lg text-muted hover:bg-elevated transition flex items-center gap-1.5">
            <Rocket size={12} />
            Leads
          </Link>
          <span className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-medium flex items-center gap-1.5">
            <UserRound size={12} />
            Profile
          </span>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <div className="bg-surface border border-border rounded-2xl p-5">
          <div className="text-lg font-semibold">{profile.name}</div>
          <p className="text-sm text-muted mt-1">{profile.title} · {profile.level}</p>

          <div className="flex flex-wrap gap-3 mt-4 text-xs">
            <a href={`mailto:${profile.email}`} className="flex items-center gap-1.5 text-primary hover:underline">
              <Mail size={12} />
              {profile.email}
            </a>
            <a href={profile.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-primary hover:underline">
              <Globe size={12} />
              Portfolio
            </a>
            <a href={profile.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-primary hover:underline">
              <Code2 size={12} />
              GitHub
            </a>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted mb-3">Skills</h2>
          <div className="flex flex-wrap gap-1.5">
            {profile.skills.map((s) => (
              <span key={s} className="text-xs px-2.5 py-1 rounded-lg bg-elevated border border-border text-text">
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted mb-3">Services offered</h2>
          <div className="flex flex-wrap gap-1.5">
            {profile.services.map((s) => (
              <span key={s} className="text-xs px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary">
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted mb-3">Target roles</h2>
          <div className="flex flex-wrap gap-1.5">
            {profile.targetRoles.map((s) => (
              <span key={s} className="text-xs px-2.5 py-1 rounded-lg bg-elevated border border-border text-text">
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted mb-3">Target opportunities</h2>
          <div className="flex flex-wrap gap-1.5">
            {profile.targetOpportunities.map((s) => (
              <span key={s} className="text-xs px-2.5 py-1 rounded-lg bg-elevated border border-border text-text">
                {s}
              </span>
            ))}
          </div>
          <p className="text-xs text-muted mt-3">{profile.remote ? "Open to remote work" : "Not seeking remote work"}</p>
        </div>

        <p className="text-xs text-muted text-center pt-2">
          Edit <code className="text-primary">lib/profile.ts</code> to update how listings are matched and scored against you.
        </p>
      </main>
    </div>
  );
}
