
import db from '../db/init.js';

export interface Screenshot {
  filepath: string;
  visual_elements: any;
  content_context: any;
  temporal_context: any;
  searchable_tags: string;
}

export const searchScreenshots = (query: string) => {
  const stmt = db.prepare(`
    SELECT * FROM screenshots 
    WHERE searchable_tags LIKE ? 
    OR json_extract(visual_elements, '$.ui_components') LIKE ?
    OR json_extract(content_context, '$.topic') LIKE ?
    OR json_extract(content_context, '$.technical_details') LIKE ?
  `);

  const searchPattern = `%${query}%`;
  return stmt.all(searchPattern, searchPattern, searchPattern, searchPattern);
};

export const getScreenshot = (filepath: string) => {
  const stmt = db.prepare('SELECT * FROM screenshots WHERE filepath = ?');
  return stmt.get(filepath);
}; 