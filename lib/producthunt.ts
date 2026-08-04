const PH_API_URL = "https://api.producthunt.com/v2/api/graphql";

export type PHLaunch = {
  id: string;
  productName: string;
  tagline: string;
  description: string;
  url: string;
  website: string;
  votes: number;
  commentsCount: number;
  makerName: string;
  makerUsername: string;
  topics: string;
  launchedAt: string;
};

export async function fetchProductHuntLaunches(topic?: string): Promise<PHLaunch[]> {
  const token = process.env.PRODUCTHUNT_TOKEN;
  if (!token) {
    console.warn("PRODUCTHUNT_TOKEN not set — skipping Product Hunt fetch");
    return [];
  }

  const query = `
    query {
      posts(order: VOTES, first: 20${topic ? `, topic: "${topic}"` : ""}) {
        edges {
          node {
            id
            name
            tagline
            description
            url
            website
            votesCount
            commentsCount
            createdAt
            makers {
              name
              username
            }
            topics {
              edges {
                node {
                  name
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const res = await fetch(PH_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query }),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      console.warn(`Product Hunt API returned ${res.status}`);
      return [];
    }

    const data = await res.json();
    const edges = data?.data?.posts?.edges || [];

    return edges.map((edge: any) => {
      const node = edge.node;
      const maker = node.makers?.[0] || {};
      const topicNames = (node.topics?.edges || []).map((t: any) => t.node.name).join(", ");
      return {
        id: node.id,
        productName: node.name || "",
        tagline: node.tagline || "",
        description: node.description || "",
        url: node.url || "",
        website: node.website || "",
        votes: node.votesCount || 0,
        commentsCount: node.commentsCount || 0,
        makerName: maker.name || "",
        makerUsername: maker.username || "",
        topics: topicNames,
        launchedAt: node.createdAt || "",
      };
    });
  } catch (e) {
    console.warn(`Product Hunt fetch failed: ${e}`);
    return [];
  }
}
