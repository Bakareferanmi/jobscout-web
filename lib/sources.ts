export async function fetchHimalayas(query: string): Promise<RawListing[]> {
  const res = await safeFetch(`https://himalayas.app/jobs/api/search?q=${encodeURIComponent(query)}`);
  if (!res) return [];
  const data = await res.json();
  return (data.jobs || []).map((j: any) => ({
    title: j.title || "",
    company: j.companyName || "",
    location: Array.isArray(j.locationRestrictions) && j.locationRestrictions.length > 0
      ? j.locationRestrictions.map((l: any) => l.name).join(", ")
      : "Worldwide",
    url: j.applicationLink || "",
    posted: j.pubDate ? new Date(j.pubDate).toISOString() : "",
    source: "himalayas",
    kind: "job" as const,
  }));
}
