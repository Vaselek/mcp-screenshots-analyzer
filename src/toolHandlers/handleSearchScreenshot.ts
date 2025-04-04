import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { searchScreenshotsByQuery } from "../services/anthropicService.js";
import { Screenshot } from "../services/dbService.js";
import { revealInFinder } from "../services/finderService.js";

export async function handleSearchScreenshot(query: string, API_KEY: string): Promise<CallToolResult> {
  try {
    const results = await searchScreenshotsByQuery(query, API_KEY);

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

    if (results.length !== 0) {
      revealInFinder(results.map((screenshot: Screenshot) => screenshot.filepath));
    }

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
}