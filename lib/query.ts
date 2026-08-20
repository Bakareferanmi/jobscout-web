export type ListingFilters = {
  conditions: string[];
  params: (string | number)[];
};

// Builds WHERE conditions from standard filter query params. Caller owns
// the params array so it can push more (e.g. LIMIT) after calling this.
export function buildListingFilters(searchParams: URLSearchParams): ListingFilters {
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  const category = searchParams.get("category");
  const status = searchParams.get("status");
  const kind = searchParams.get("kind");
  const minScore = searchParams.get("minScore");
  const opportunityType = searchParams.get("opportunityType");
  const commercialValue = searchParams.get("commercialValue");

  if (category) {
    params.push(category);
    conditions.push(`category = $${params.length}`);
  }
  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }
  if (kind) {
    params.push(kind);
    conditions.push(`kind = $${params.length}`);
  }
  if (minScore) {
    params.push(parseInt(minScore, 10));
    conditions.push(`score >= $${params.length}`);
  }
  if (opportunityType) {
    params.push(opportunityType.toUpperCase());
    conditions.push(`opportunity_type = $${params.length}`);
  }
  if (commercialValue) {
    params.push(commercialValue.toUpperCase());
    conditions.push(`commercial_value = $${params.length}`);
  }

  return { conditions, params };
}

// sort: "score" (default keyword score), "match" (personalized match_score),
// or "value" (commercial_value tier, then match_score) — mirrors the CLI's
// `opportunities` and `leads` commands.
export function buildOrderClause(sort: string | null): string {
  if (sort === "match") {
    return "ORDER BY match_score DESC NULLS LAST, fetched_at DESC";
  }
  if (sort === "value") {
    return `ORDER BY
      CASE commercial_value
        WHEN 'HIGH' THEN 3
        WHEN 'MEDIUM' THEN 2
        WHEN 'LOW' THEN 1
        ELSE 0
      END DESC,
      match_score DESC NULLS LAST,
      fetched_at DESC`;
  }
  return "ORDER BY score DESC, fetched_at DESC";
}
