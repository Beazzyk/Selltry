import Anthropic from '@anthropic-ai/sdk';
import { env } from '../utils/env';

export interface DescriptionInput {
  categoryType: string;
  categoryName?: string;
  brand?: string;
  productModel?: string;
  condition: string;
  title: string;
  partSide?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  attributes?: Record<string, unknown>;
}

const CONDITION_PL: Record<string, string> = {
  NEW: 'Nowy — nieużywany, w oryginalnym opakowaniu lub fabrycznie nowy',
  USED: 'Używany — produkt sprawny, mogą występować ślady normalnego użytkowania',
  DAMAGED: 'Uszkodzony — produkt wymaga naprawy lub przeznaczony na części',
};

const CATEGORY_CONTEXT: Record<string, string> = {
  AUTOMOTIVE: 'części samochodowe / motoryzacja',
  ELECTRONICS: 'elektronika użytkowa',
  HOME_GARDEN: 'dom i ogród / AGD',
  FASHION: 'moda i odzież',
  SPORT: 'sport i rekreacja',
  TOOLS: 'narzędzia i elektronarzędzia',
  OTHER: 'ogólna',
};

function buildPrompt(input: DescriptionInput): string {
  const attrs = input.attributes ?? {};
  const attrLines = Object.entries(attrs)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `- ${k}: ${String(v)}`)
    .join('\n');

  const vehicleInfo = input.vehicleMake
    ? `Pojazd: ${input.vehicleMake} ${input.vehicleModel ?? ''} ${input.vehicleYear ?? ''}`.trim()
    : '';

  const productInfo = [
    input.brand ? `Marka: ${input.brand}` : '',
    input.productModel ? `Model: ${input.productModel}` : '',
    vehicleInfo,
    input.partSide && input.partSide !== 'Nie dotyczy' ? `Strona montażu: ${input.partSide}` : '',
    attrLines,
  ].filter(Boolean).join('\n');

  return `Jesteś ekspertem ds. e-commerce i copywriterem dla polskich marketplace (Allegro, OLX, Otomoto).
Napisz KOMPLETNY, profesjonalny opis ogłoszenia sprzedażowego w języku polskim.

DANE PRODUKTU:
Tytuł: ${input.title}
Kategoria: ${CATEGORY_CONTEXT[input.categoryType] ?? input.categoryType}
Stan: ${CONDITION_PL[input.condition] ?? input.condition}
${productInfo}

INSTRUKCJE:
1. Użyj swojej wiedzy o tym produkcie (marka + model) żeby uzupełnić PEŁNĄ specyfikację techniczną — parametry, wymiary, waga, materiały, kompatybilność.
2. Napisz opisy sekcji w stylu przekonującego copywritingu — korzyści dla kupującego, nie tylko suche fakty.
3. Uwzględnij słowa kluczowe SEO naturalnie wplecione w tekst.
4. Struktura MUSI zawierać dokładnie te sekcje (użyj nagłówków HTML):

<div class="listing-description">

<h3>📦 Opis produktu</h3>
<p>[2-3 zdania marketingowego opisu — dlaczego warto kupić, co wyróżnia produkt]</p>

<h3>✅ Kluczowe cechy</h3>
<ul>
[5-8 punktów z najważniejszymi cechami i zaletami — używaj emoji dla wizualności]
</ul>

<h3>🔧 Specyfikacja techniczna</h3>
<table>
<tr><th>Parametr</th><th>Wartość</th></tr>
[WYPEŁNIJ na podstawie wiedzy o modelu — min. 6 wierszy]
</table>

<h3>📐 Wymiary i waga</h3>
<p>[Wymiary i waga produktu jeśli znane lub szacunkowe dla modelu]</p>

<h3>🚗 Kompatybilność / Zastosowanie</h3>
<p>[Dla części — pasujące pojazdy/modele; dla elektroniki — kompatybilność; dla innych — zakres zastosowania]</p>

<h3>⭐ Stan produktu</h3>
<p>[Szczegółowy opis stanu: ${CONDITION_PL[input.condition] ?? input.condition}]</p>

<h3>📬 Wysyłka i pakowanie</h3>
<p>[Informacje o pakowaniu, możliwości wysyłki kurierem, odbioru osobistego]</p>

</div>

WAŻNE: Zwróć TYLKO kod HTML bez żadnych komentarzy, markdownu ani dodatkowego tekstu.
Cały opis musi być po polsku. Bądź konkretny i szczegółowy — kupujący docenią szczegóły techniczne.`;
}

function mockDescription(input: DescriptionInput): string {
  const brand = input.brand ?? '';
  const model = input.productModel ?? '';
  return `<div class="listing-description">
<h3>📦 Opis produktu</h3>
<p>Oferuję ${input.title} w stanie: ${CONDITION_PL[input.condition] ?? input.condition}. Produkt gotowy do natychmiastowej wysyłki.</p>

<h3>✅ Kluczowe cechy</h3>
<ul>
<li>🏷️ Marka: ${brand} ${model}</li>
<li>📦 Stan: ${CONDITION_PL[input.condition] ?? input.condition}</li>
<li>✅ Sprawdzony przed wysyłką</li>
<li>🚀 Szybka wysyłka — następny dzień roboczy</li>
</ul>

<h3>🔧 Specyfikacja techniczna</h3>
<table>
<tr><th>Parametr</th><th>Wartość</th></tr>
<tr><td>Marka</td><td>${brand}</td></tr>
<tr><td>Model</td><td>${model}</td></tr>
<tr><td>Stan</td><td>${input.condition}</td></tr>
</table>

<h3>📬 Wysyłka i pakowanie</h3>
<p>Produkt zostanie starannie zapakowany i wysłany kurierem w ciągu 24h od zaksięgowania płatności.</p>
</div>`;
}

const anthropic = env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: env.ANTHROPIC_API_KEY }) : null;

export async function generateDescription(input: DescriptionInput): Promise<string> {
  if (!anthropic) {
    // MOCK MODE — wymaga ANTHROPIC_API_KEY
    return mockDescription(input);
  }

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    messages: [{ role: 'user', content: buildPrompt(input) }],
  });

  const text = message.content.find((b) => b.type === 'text')?.text ?? '';
  return text.trim();
}
