import db from '../db/init.js';

export interface Screenshot {
  filepath: string;
  visual_elements: any;
  content_context: any;
  temporal_context: any;
  searchable_tags: string;
}

export const searchScreenshots = (query: string) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT * FROM screenshots 
      WHERE searchable_tags LIKE ? 
      OR json_extract(visual_elements, '$.ui_components') LIKE ?
      OR json_extract(content_context, '$.topic') LIKE ?
      OR json_extract(content_context, '$.technical_details') LIKE ?
    `;

    const searchPattern = `%${query}%`;
    db.all(sql, [searchPattern, searchPattern, searchPattern, searchPattern], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
};

export const getScreenshot = (filepath: string) => {
  const stmt = db.prepare('SELECT * FROM screenshots WHERE filepath = ?');
  return stmt.get(filepath);
}; 