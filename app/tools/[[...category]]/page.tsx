import { Metadata } from "next";
import { Suspense } from "react";
import ToolsClient from "./ToolsClient";
import { loadAllDevResources } from "@/utils/server-resource-loader";
import {
  createFuseInstance,
  SearchResult,
  performSearch,
  type ToolCategory,
} from "@/utils/search-core";

const PAGES_FOR_SEO = [
  "mcp",
  "agents",
  "commands",
  "settings",
  "hooks",
  "templates",
] as const;

type CategoryPages = (typeof PAGES_FOR_SEO)[number];

export async function generateStaticParams() {
  return [
    { category: [] },
    { category: ['mcp'] },
    { category: ['agents'] },
    { category: ['commands'] },
    { category: ['settings'] },
    { category: ['hooks'] },
    { category: ['templates'] },
  ];
}

export async function generateMetadata(props: {
  params: Promise<{ category?: string[] }>;
}): Promise<Metadata> {
  const params = await props.params;
  const category = params.category?.[0];

  if (!category) {
    return {
      title: "Claude Code Tools & Resources",
      description:
        "Discover tools, agents, MCP servers, and resources for Claude Code",
    };
  }

  const categoryTitles: Record<CategoryPages, string> = {
    mcp: "MCP Servers",
    agents: "Agents",
    commands: "Commands",
    settings: "Settings",
    hooks: "Hooks",
    templates: "Templates",
  };

  const title = categoryTitles[category as CategoryPages] || "Tools";

  return {
    title: `${title} | Claude Code Tools`,
    description: `Browse ${title.toLowerCase()} for Claude Code`,
  };
}

interface ToolsPageProps {
  params: Promise<{ category?: CategoryPages[] }>;
}

export default async function ToolsPage({ params }: ToolsPageProps) {
  const resolvedParams = await params;
  
  // Load data in the Server Component - this runs on every request in dev mode
  const data = loadAllDevResources();
  const fuse = createFuseInstance(data);
  
  // Determine category filter based on route
  let categoryFilter: ToolCategory[] = [];
// Static generation for SEO - only return route parameters, not data
  switch (resolvedParams.category?.[0]) {
    case 'mcp':
      categoryFilter = ['mcp'];
      break;
    case 'agents':
      categoryFilter = ['agent'];
      break;
    case 'commands':
      categoryFilter = ['command'];
      break;
    case 'settings':
      categoryFilter = ['setting'];
      break;
    case 'hooks':
      categoryFilter = ['hook'];
      break;
    case 'templates':
      categoryFilter = ['template'];
      break;
  }
  
  const searchResults = performSearch(data, fuse, {
    text: "",
    categoryFilter,
    limit: 20,
  });

  console.log("got these params", resolvedParams);
  console.log("loaded", data.length, "tools, showing", searchResults.length, "results");

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ToolsClient
        initialCategoryFilter={categoryFilter}
        searchResults={searchResults}
        totalCount={data.length}
      />
    </Suspense>
  );
}
