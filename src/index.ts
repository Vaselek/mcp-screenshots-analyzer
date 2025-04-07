import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { searchScreenshotsByQuery } from "./services/anthropicService.js";
import { Screenshot } from "./services/dbService.js";
import dotenv from 'dotenv';
import { handleSearchScreenshot } from "./toolHandlers/handleSearchScreenshot.js";

// Load environment variables
dotenv.config();

const API_KEY = process?.env?.ANTHROPIC_API_KEY;

if (!API_KEY) {
  throw new Error(`ANTHROPIC_API_KEY is not set in environment variables or server context, ${API_KEY}`);
}

// Create server instance
const server = new McpServer({
  name: "screenshot-analyzer",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

// Register screenshot search tool
server.tool(
  "search-screenshots",
  "Search through analyzed screenshots using natural language queries",
  {
    query: z.string().describe("Natural language query to search screenshots (e.g., 'find screenshots with blue buttons')"),
  },
  async ({ query }) => await handleSearchScreenshot(query, API_KEY)
);


async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Screenshot Analyzer MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});

export default server;
