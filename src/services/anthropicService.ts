import Anthropic from "@anthropic-ai/sdk";
import { searchScreenshots, Screenshot } from './dbService.js';


export async function searchScreenshotsByQuery(userQuery: string, apiKey: string): Promise<any[]> {
  const anthropic = new Anthropic({
    apiKey: apiKey
  });

  const response = await anthropic.messages.create({
    model: "claude-3-5-haiku-20241022",
    max_tokens: 500,
    temperature: 0,
    system: `You are an expert at converting natural language queries about UI screenshots into structured search criteria.
  Your task is to extract key search terms and return them in JSON format that matches our screenshot analysis structure.
  Focus on visual elements, content context, and technical details that might be present in the screenshots. Do not include in response too common terms like "screenshot" as we are looking for specific screenshots and should narrow down the search.`,
    messages: [
      {
        role: "user",
        content: `Convert this search query into relevant search terms: "${userQuery}". 
  Return only a JSON object with these fields:
  {
    "search_terms": ["list", "of", "relevant", "terms"],
    "visual_elements_focus": ["any specific UI elements to look for"],
    "content_focus": ["any specific content or technical details to look for"]
  }`
      }
    ]
  });

  const content = response.content[0];
  if (!('text' in content)) {
    throw new Error('Unexpected response format from Anthropic API');
  }

  const searchCriteria = JSON.parse(content.text);

  const searchTerms = [
    ...searchCriteria.search_terms,
    ...searchCriteria.visual_elements_focus,
    ...searchCriteria.content_focus
  ].filter(Boolean);

  const results: Screenshot[] = [];
  for (const term of searchTerms) {
    const matches = await searchScreenshots(term);
    // @ts-ignore
    results.push(...matches);
  }

  const uniqueResults = Array.from(
    new Map(
      results
        .filter((item): item is Screenshot => {
          if (!item || typeof item !== 'object') return false;
          return 'filepath' in item && typeof item.filepath === 'string' && item.filepath !== '';
        })
        .map(item => [item.filepath, item])
    ).values()
  );
  return uniqueResults;
}
