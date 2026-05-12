/**
 * Converts AI-generated HTML description to platform-specific formats.
 * Our HTML uses: div.listing-description, h3, ul/li, table/tr/td, p
 */

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, '');
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#\d+;/g, '');
}

/**
 * Allegro: allows <p>, <b>, <strong>, <em>, <ul>, <ol>, <li>, <br>
 * Converts: h3→<p><b>, table→<ul>, div wrapper→removed
 */
export function toAllegroHtml(html: string): string {
  let result = html;

  // Remove outer wrapper
  result = result.replace(/<div[^>]*>/gi, '').replace(/<\/div>/gi, '');

  // h3 with emoji → <p><b>text</b></p>
  result = result.replace(/<h3>(.*?)<\/h3>/gis, '<p><b>$1</b></p>');

  // table → convert rows to "<b>key</b> – value" list items
  result = result.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (_, tableContent: string) => {
    const rows: string[] = [];
    const rowMatches = tableContent.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
    for (const rowMatch of rowMatches) {
      const cells: string[] = [];
      const cellMatches = rowMatch[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi);
      for (const cell of cellMatches) {
        const text = decodeEntities(stripTags(cell[1])).trim();
        if (text) cells.push(text);
      }
      if (cells.length >= 2 && !cells[0].toLowerCase().includes('parametr')) {
        rows.push(`<li><b>${cells[0]}</b>: ${cells[1]}</li>`);
      }
    }
    return rows.length ? `<ul>${rows.join('')}</ul>` : '';
  });

  // Clean up: remove unsupported attributes and tags
  result = result.replace(/ class="[^"]*"/gi, '');
  result = result.replace(/<span[^>]*>/gi, '').replace(/<\/span>/gi, '');
  result = result.replace(/<th[^>]*>/gi, '<td>').replace(/<\/th>/gi, '</td>');

  // Collapse whitespace
  result = result.replace(/\s{2,}/g, ' ').trim();

  return result;
}

/**
 * OLX / Otomoto: plain text with Unicode formatting
 */
export function toPlainText(html: string): string {
  let result = html;

  // h3 → section header with separator
  result = result.replace(/<h3>(.*?)<\/h3>/gis, '\n\n$1\n' + '─'.repeat(30) + '\n');

  // table rows → "key: value" lines
  result = result.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (_, tableContent: string) => {
    const lines: string[] = [];
    const rowMatches = tableContent.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
    for (const rowMatch of rowMatches) {
      const cells: string[] = [];
      const cellMatches = rowMatch[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi);
      for (const cell of cellMatches) {
        const text = decodeEntities(stripTags(cell[1])).trim();
        if (text) cells.push(text);
      }
      if (cells.length >= 2 && !cells[0].toLowerCase().includes('parametr')) {
        lines.push(`${cells[0]}: ${cells[1]}`);
      }
    }
    return lines.join('\n') + '\n';
  });

  // ul/li → bullet points
  result = result.replace(/<li>(.*?)<\/li>/gis, '• $1\n');
  result = result.replace(/<ul[^>]*>|<\/ul>|<ol[^>]*>|<\/ol>/gi, '\n');

  // p, br → newlines
  result = result.replace(/<p[^>]*>/gi, '\n').replace(/<\/p>/gi, '\n');
  result = result.replace(/<br\s*\/?>/gi, '\n');

  // Strip remaining tags
  result = stripTags(result);
  result = decodeEntities(result);

  // Clean up whitespace
  result = result.replace(/\n{3,}/g, '\n\n').trim();

  return result;
}

/**
 * Returns description in the correct format for a given platform
 */
export function convertDescriptionForPlatform(html: string, platform: string): string {
  if (!html) return '';
  if (platform === 'ALLEGRO') return toAllegroHtml(html);
  if (platform === 'OLX' || platform === 'OTOMOTO' || platform === 'OVOKO') return toPlainText(html);
  return toPlainText(html);
}
