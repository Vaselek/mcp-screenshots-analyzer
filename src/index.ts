import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { searchScreenshotsByQuery } from "./services/anthropicService.js";
import { Screenshot } from "./services/dbService.js";


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
  async ({ query }) => {
    try {
      const results = await searchScreenshotsByQuery(query);

      if (results.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "No screenshots found matching your query.",
            },
          ],
        };
      }

      const formattedResults = results.map((screenshot: Screenshot) => {
        return [
          `File: ${screenshot.filepath}`
        ].join("\n");
      });

      return {
        content: [
          {
            type: "text",
            text: `Found ${results.length} matching screenshots:\n\n${formattedResults.join("\n")}`,
          },
        ],
      };
    } catch (error: any) {
      console.error("Error searching screenshots:", error);
      return {
        content: [
          {
            type: "text",
            text: `Error searching screenshots: ${error?.message || 'Unknown error occurred'}`,
          },
        ],
      };
    }
  },
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
