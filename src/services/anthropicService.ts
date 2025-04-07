import Anthropic from "@anthropic-ai/sdk";
import { searchScreenshots, Screenshot } from './dbService.js';


export async function searchScreenshotsByQuery(userQuery: string, apiKey: string): Promise<any[]> {
  const anthropic = new Anthropic({
    apiKey: apiKey
  });

  const propmtUsedToSaveScreenshots = `You are an expert in analyzing UI screenshots and technical documentation. Analyze each image and respond in the following structured JSON format:
{
    "visual_elements": {
        "ui_components": [if screenshot seems like a webpage or part of webpage than get list of all UI elements with their description (for example, blue buttons, red background, dark footer)],
        "color_scheme": "dominant colors and color patterns"
    },
    "content_context": {
        "topic": "main subject or purpose of the screenshot",
        "text": "text that can be extracted from screenshot",
        "technical_details": "any technical information (API references, code snippets, version numbers)",
        "documentation_type": "type of content (e.g., API docs, code editor, dashboard, webpage, photo, document, receipt)",
        "references": "any specific product/service mentions (e.g., Stripe, AWS, specific libraries)"
    },
    "temporal_context": {
        "version_indicators": "any visible version numbers or dates",
        "ui_generation": "indicators if this is a modern or legacy interface"
    },
    "searchable_tags": ["comprehensive list of key terms for search matching excluding too common terms (for example 'screenshot')"]
}`

  const response = await anthropic.messages.create({
    model: "claude-3-5-haiku-20241022",
    max_tokens: 500,
    temperature: 0,
    system: `You are an expert at converting natural language queries about UI screenshots into structured search criteria.
  Your task is to extract key search terms and return them in JSON format that matches our screenshot analysis structure.
  The screenshot analysis structure had been created based on following prompt:
  ${propmtUsedToSaveScreenshots}
  Focus on visual elements, content context, and technical details that might be present in the screenshots. Do not include in response too common terms like "screenshot" as we are looking for specific screenshots and should narrow down the search.`,
    messages: [
      {
        role: "user",
        content: `Convert this search query into relevant search terms: "${userQuery}". 
  Return only a JSON object with these fields:
  {
    "most_specific_terms": ["list", "of", "most", "specific", "terms", "for", "search", "matching", "usually", "based", "on", "content", "of", "screenshot"],
    "secondary_terms": ["any", "specific", "elements", "to", "look", "for", "except", "most", "specific", "terms"],
    "tertiary_terms": ["any", "details", "to", "look", "for", "except", "most", "specific", "terms", "and", "secondary", "terms"]
  }`
      }
    ]
  });

  const content = response.content[0];
  if (!('text' in content)) {
    throw new Error('Unexpected response format from Anthropic API');
  }

  const searchCriteria = JSON.parse(content.text);

  const firstSearchResults = await getSearchTerms(searchCriteria.most_specific_terms);

  if (firstSearchResults.length !== 0) {
    return firstSearchResults;
  }

  const secondSearchResults = await getSearchTerms(searchCriteria.secondary_terms);

  if (secondSearchResults.length !== 0) {
    return secondSearchResults;
  }

  const thirdSearchResults = await getSearchTerms(searchCriteria.tertiary_terms);

  if (thirdSearchResults.length !== 0) {
    return thirdSearchResults;
  }

  return [];

}

const getSearchTerms = async (searchTerms: any) => {
  const results: Screenshot[] = [];
  for (const term of searchTerms) {
    const matches = await searchScreenshots(term);
    // @ts-ignore
    results.push(...matches);
  }

  return Array.from(
    new Map(
      results
        .filter((item): item is Screenshot => {
          if (!item || typeof item !== 'object') return false;
          return 'filepath' in item && typeof item.filepath === 'string' && item.filepath !== '';
        })
        .map(item => [item.filepath, item])
    ).values()
  );
}
