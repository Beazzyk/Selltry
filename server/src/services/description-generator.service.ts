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

export interface GenerateResult {
  title: string;
  platformTitles: {
    ALLEGRO: string;
    OLX: string;
    OTOMOTO?: string;
    OVOKO?: string;
  };
  description: string;
}

const TITLE_LIMITS = { ALLEGRO: 75, OLX: 70, OTOMOTO: 80, OVOKO: 100 };

const CONDITION_PL: Record<string, string> = {
  NEW: 'Nowy',
  USED: 'Używany',
  DAMAGED: 'Uszkodzony/Na części',
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

  const isAuto = input.categoryType === 'AUTOMOTIVE';
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

  const titleInstructions = isAuto
    ? `- ALLEGRO (max ${TITLE_LIMITS.ALLEGRO} znaków): marka+model pojazdu + część + rok + strona + stan + słowa kluczowe
- OLX (max ${TITLE_LIMITS.OLX} znaków): skondensowana wersja z kluczowymi informacjami
- OTOMOTO (max ${TITLE_LIMITS.OTOMOTO} znaków): nacisk na kompatybilność pojazdu i część`
    : `- ALLEGRO (max ${TITLE_LIMITS.ALLEGRO} znaków): marka + model + główna cecha + stan + słowa kluczowe SEO
- OLX (max ${TITLE_LIMITS.OLX} znaków): skondensowana wersja z najważniejszymi frazami`;

  return `Jesteś ekspertem SEO i copywriterem dla polskich marketplace.
Dla podanego produktu wygeneruj TYTUŁY i OPIS MARKETINGOWY.

DANE PRODUKTU:
Tytuł bazowy: ${input.title}
Kategoria: ${CATEGORY_CONTEXT[input.categoryType] ?? input.categoryType}
Stan: ${CONDITION_PL[input.condition] ?? input.condition}
${productInfo}

ZASADY TYTUŁÓW:
• Używaj słów kluczowych które kupujący wpisują w wyszukiwarce
• Umieszczaj najważniejsze informacje na początku (marka, model, typ produktu)
• Dla używanych: podaj rok, stan, markę
• Nie używaj CAPS LOCK dla całego tytułu — tylko pierwsza litera wyrazu
• Unikaj zbędnych znaków interpunkcyjnych

WYMAGANY FORMAT ODPOWIEDZI (dokładnie taka struktura, bez żadnych dodatkowych komentarzy):

<titles>
<main>${isAuto ? '[Marka pojazdu] [Model] [rok] [część] [strona] [stan] — SEO-friendly max 70 znaków' : '[Marka] [Model] [główna cecha] [stan] — SEO max 65 znaków'}</main>
<ALLEGRO>${titleInstructions.split('\n')[0].replace(/^- ALLEGRO.*: /, '')}</ALLEGRO>
<OLX>${titleInstructions.split('\n')[1].replace(/^- OLX.*: /, '')}</OLX>
${isAuto ? '<OTOMOTO>[tytuł zoptymalizowany pod Otomoto max 80 znaków]</OTOMOTO>' : ''}
</titles>
<description>
<div class="listing-description">

<h3>📦 Opis produktu</h3>
<p>[2-3 zdania marketingowego opisu — korzyści dla kupującego, unikalna wartość]</p>

<h3>✅ Kluczowe cechy</h3>
<ul>
[5-8 punktów z emoji — najważniejsze cechy i zalety TEGO KONKRETNEGO modelu]
</ul>

<h3>🔧 Specyfikacja techniczna</h3>
<table>
<tr><th>Parametr</th><th>Wartość</th></tr>
[Uzupełnij z wiedzy o modelu ${input.brand ?? ''} ${input.productModel ?? ''} — minimum 6 wierszy z konkretnymi danymi]
</table>

<h3>📐 Wymiary i waga</h3>
<p>[Rzeczywiste wymiary i waga produktu dla tego modelu]</p>

<h3>${isAuto ? '🚗 Kompatybilność pojazdów' : '🔗 Zastosowanie i kompatybilność'}</h3>
<p>[${isAuto ? 'Lista pasujących pojazdów/silników' : 'Zakres zastosowania, kompatybilność z innymi urządzeniami/systemami'}]</p>

<h3>⭐ Stan produktu</h3>
<p>[Szczegółowy opis stanu: ${CONDITION_PL[input.condition] ?? input.condition}]</p>

<h3>📬 Wysyłka i pakowanie</h3>
<p>[Informacje o pakowaniu, kurierze, odbiorze osobistym]</p>

</div>
</description>

WAŻNE: Zwróć TYLKO powyższą strukturę XML, bez żadnego dodatkowego tekstu przed ani po.
Wszystkie treści w języku polskim. Bądź konkretny — podawaj rzeczywiste dane techniczne.`;
}

function parseResponse(raw: string): GenerateResult {
  const titlesMatch = raw.match(/<titles>([\s\S]*?)<\/titles>/);
  const descMatch = raw.match(/<description>([\s\S]*?)<\/description>/);

  const titlesBlock = titlesMatch?.[1] ?? '';
  const description = descMatch?.[1]?.trim() ?? raw;

  function extractTag(tag: string): string {
    const m = titlesBlock.match(new RegExp(`<${tag}>(.*?)</${tag}>`, 's'));
    return m?.[1]?.trim() ?? '';
  }

  const main = extractTag('main');
  const allegro = extractTag('ALLEGRO');
  const olx = extractTag('OLX');
  const otomoto = extractTag('OTOMOTO');

  return {
    title: main || allegro || olx || '',
    platformTitles: {
      ALLEGRO: (allegro || main).slice(0, TITLE_LIMITS.ALLEGRO),
      OLX: (olx || main).slice(0, TITLE_LIMITS.OLX),
      ...(otomoto ? { OTOMOTO: otomoto.slice(0, TITLE_LIMITS.OTOMOTO) } : {}),
    },
    description,
  };
}

function mockResult(input: DescriptionInput): GenerateResult {
  const base = input.title;
  const brand = input.brand ?? '';
  const model = input.productModel ?? '';
  const cond = CONDITION_PL[input.condition] ?? '';

  const description = `<div class="listing-description">
<h3>📦 Opis produktu</h3>
<p>Oferuję ${base}. Produkt w stanie: <strong>${cond}</strong>. Gotowy do wysyłki.</p>
<h3>✅ Kluczowe cechy</h3>
<ul>
<li>🏷️ Marka: ${brand} ${model}</li>
<li>📦 Stan: ${cond}</li>
<li>✅ Sprawdzony przed wysyłką</li>
<li>🚀 Wysyłka w 24h</li>
</ul>
<h3>🔧 Specyfikacja techniczna</h3>
<table>
<tr><th>Parametr</th><th>Wartość</th></tr>
<tr><td>Marka</td><td>${brand}</td></tr>
<tr><td>Model</td><td>${model}</td></tr>
<tr><td>Stan</td><td>${cond}</td></tr>
</table>
<h3>📬 Wysyłka i pakowanie</h3>
<p>Starannie zapakowane, wysyłka kurierem DPD/DHL w ciągu 24h.</p>
</div>`;

  return {
    title: base.slice(0, 70),
    platformTitles: {
      ALLEGRO: base.slice(0, 75),
      OLX: base.slice(0, 70),
    },
    description,
  };
}

const anthropic = env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: env.ANTHROPIC_API_KEY }) : null;

export async function generateDescription(input: DescriptionInput): Promise<GenerateResult> {
  if (!anthropic) {
    // MOCK MODE — wymaga ANTHROPIC_API_KEY
    return mockResult(input);
  }

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2500,
    messages: [{ role: 'user', content: buildPrompt(input) }],
  });

  const raw = message.content.find((b) => b.type === 'text')?.text ?? '';
  return parseResponse(raw);
}
