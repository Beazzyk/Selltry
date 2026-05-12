import { toAllegroHtml, toPlainText, convertDescriptionForPlatform } from '../../src/utils/description-converter';

const SAMPLE_HTML = `<div class="listing-description">
<h3>📦 Opis produktu</h3>
<p>Świetny produkt w dobrym stanie.</p>
<h3>✅ Kluczowe cechy</h3>
<ul>
<li>🏷️ Marka: Samsung</li>
<li>📦 Stan: Używany</li>
</ul>
<h3>🔧 Specyfikacja techniczna</h3>
<table>
<tr><th>Parametr</th><th>Wartość</th></tr>
<tr><td>RAM</td><td>8 GB</td></tr>
<tr><td>Ekran</td><td>6.2 cali</td></tr>
</table>
</div>`;

describe('toAllegroHtml', () => {
  it('removes div wrapper', () => {
    const result = toAllegroHtml(SAMPLE_HTML);
    expect(result).not.toContain('<div');
    expect(result).not.toContain('</div>');
  });

  it('converts h3 to <p><b>', () => {
    const result = toAllegroHtml(SAMPLE_HTML);
    expect(result).toContain('<p><b>');
    expect(result).not.toContain('<h3>');
  });

  it('converts table rows to ul/li with bold key', () => {
    const result = toAllegroHtml(SAMPLE_HTML);
    expect(result).toContain('<ul>');
    expect(result).toContain('<b>RAM</b>: 8 GB');
    expect(result).toContain('<b>Ekran</b>: 6.2 cali');
    expect(result).not.toContain('<table>');
  });

  it('keeps ul/li for features list', () => {
    const result = toAllegroHtml(SAMPLE_HTML);
    expect(result).toContain('<li>');
    expect(result).toContain('Marka: Samsung');
  });

  it('removes class attributes', () => {
    const result = toAllegroHtml(SAMPLE_HTML);
    expect(result).not.toContain('class=');
  });

  it('preserves p tags', () => {
    const result = toAllegroHtml(SAMPLE_HTML);
    expect(result).toContain('<p>');
    expect(result).toContain('Świetny produkt');
  });
});

describe('toPlainText', () => {
  it('strips all HTML tags', () => {
    const result = toPlainText(SAMPLE_HTML);
    expect(result).not.toMatch(/<[a-z]/i);
  });

  it('converts bullet list to • items', () => {
    const result = toPlainText(SAMPLE_HTML);
    expect(result).toContain('• 🏷️ Marka: Samsung');
  });

  it('converts table rows to key: value lines', () => {
    const result = toPlainText(SAMPLE_HTML);
    expect(result).toContain('RAM: 8 GB');
    expect(result).toContain('Ekran: 6.2 cali');
  });

  it('adds section separator after h3', () => {
    const result = toPlainText(SAMPLE_HTML);
    expect(result).toContain('─');
  });

  it('does not have excessive blank lines', () => {
    const result = toPlainText(SAMPLE_HTML);
    expect(result).not.toContain('\n\n\n');
  });
});

describe('convertDescriptionForPlatform', () => {
  it('returns allegro html for ALLEGRO', () => {
    const result = convertDescriptionForPlatform(SAMPLE_HTML, 'ALLEGRO');
    expect(result).toContain('<p><b>');
    expect(result).not.toContain('<div');
  });

  it('returns plain text for OLX', () => {
    const result = convertDescriptionForPlatform(SAMPLE_HTML, 'OLX');
    expect(result).not.toMatch(/<[a-z]/i);
  });

  it('returns plain text for OTOMOTO', () => {
    const result = convertDescriptionForPlatform(SAMPLE_HTML, 'OTOMOTO');
    expect(result).not.toMatch(/<[a-z]/i);
  });

  it('returns empty string for empty input', () => {
    expect(convertDescriptionForPlatform('', 'ALLEGRO')).toBe('');
    expect(convertDescriptionForPlatform('', 'OLX')).toBe('');
  });
});
