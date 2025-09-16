import { Metadata } from "next";
import { Suspense } from "react";
import ToolsClient from "./ToolsClient";
import { loadAllDevResources } from "@/utils/server-resource-loader";
import {
  createFuseInstance,
  SearchResult,
  performSearch,
  getAvailableCategories,
  type ToolKind,
} from "@/utils/search-core";

const PAGES_FOR_SEO = [
  "mcp",
  "agents",
  "commands",
  "settings",
  "hooks",
  "templates",
] as const;

type KindPages = (typeof PAGES_FOR_SEO)[number];

export async function generateStaticParams() {
  return [
    { kind: [] },
    { kind: ['mcp'] },
    { kind: ['agents'] },
    { kind: ['commands'] },
    { kind: ['settings'] },
    { kind: ['hooks'] },
    { kind: ['templates'] },
  ];
}

export async function generateMetadata(props: {
  params: Promise<{ kind?: string[] }>;
}): Promise<Metadata> {
  const params = await props.params;
  const kind = params.kind?.[0];

  if (!kind) {
    return {
      title: "Claude Code Tools & Resources",
      description:
        "Discover tools, agents, MCP servers, and resources for Claude Code",
    };
  }

  const kindTitles: Record<KindPages, string> = {
    mcp: "MCP Servers",
    agents: "Agents",
    commands: "Commands",
    settings: "Settings",
    hooks: "Hooks",
    templates: "Templates",
  };

  const title = kindTitles[kind as KindPages] || "Tools";

  return {
    title: `${title} | Claude Code Tools`,
    description: `Browse ${title.toLowerCase()} for Claude Code`,
  };
}

interface ToolsPageProps {
  params: Promise<{ kind?: KindPages[] }>;
}

export default async function ToolsPage({ params }: ToolsPageProps) {
  const resolvedParams = await params;
  
  // Load data in the Server Component - this runs on every request in dev mode
  const data = loadAllDevResources();
  const fuse = createFuseInstance(data);
  
  // Determine kind filter based on route
  let kindFilter: ToolKind[] = [];
// Static generation for SEO - only return route parameters, not data
  switch (resolvedParams.kind?.[0]) {
    case 'mcp':
      kindFilter = ['mcp'];
      break;
    case 'agents':
      kindFilter = ['agent'];
      break;
    case 'commands':
      kindFilter = ['command'];
      break;
    case 'settings':
      kindFilter = ['setting'];
      break;
    case 'hooks':
      kindFilter = ['hook'];
      break;
    case 'templates':
      kindFilter = ['template'];
      break;
  }
  
  const searchResults = performSearch(data, fuse, {
    text: "",
    kindFilter,
    categoryFilter: [],
    limit: 20,
  });

  // Get available categories for the current kind filter
  const availableCategories = getAvailableCategories(data, kindFilter);

  console.log("got these params", resolvedParams);
  console.log("loaded", data.length, "tools, showing", searchResults.length, "results");
  console.log("available categories for", kindFilter, ":", availableCategories);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ToolsClient
        initialKindFilter={kindFilter}
        availableCategories={availableCategories}
        searchResults={searchResults}
        totalCount={data.length}
      />
    </Suspense>
  );
}
