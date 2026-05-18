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

  // categoryName is the most specific identifier — put it first
  const partName = input.categoryName ?? '';
  const vehicleStr = [input.vehicleMake, input.vehicleModel, input.vehicleYear].filter(Boolean).join(' ');
  const productStr = [input.brand, input.productModel].filter(Boolean).join(' ');
  const productLine = [partName, vehicleStr || productStr].filter(Boolean).join(' ');
  const productLabel = productLine || input.title || partName || (CATEGORY_CONTEXT[input.categoryType] ?? 'produkt');

  const sideShort = input.partSide && input.partSide !== 'Nie dotyczy'
    ? (input.partSide.toLowerCase().startsWith('lew') ? 'L' : 'P')
    : '';

  const autoTitleExample = [partName, vehicleStr, sideShort, CONDITION_PL[input.condition] ?? '']
    .filter(Boolean).join(' ');

  return `Wygeneruj ogłoszenie sprzedażowe na polskie marketplace.

DANE PRODUKTU:
${partName ? `Nazwa części/produktu: ${partName}` : ''}
${vehicleStr ? `Pojazd: ${vehicleStr}` : ''}
${productStr ? `Marka/model produktu: ${productStr}` : ''}
Stan: ${CONDITION_PL[input.condition] ?? 'używany'}
${input.partSide && input.partSide !== 'Nie dotyczy' ? `Strona montażu: ${input.partSide}` : ''}
${attrLines}

ZASADA NADRZĘDNA: Zawsze zwróć kompletną odpowiedź w wymaganym formacie XML.
Uzupełnij brakujące dane technicznie z wiedzy o produkcie. Nigdy nie odmawiaj.

TYTUŁY:
${isAuto
  ? `Wzór: [nazwa części] [marka pojazdu] [model] [rok] [L lub P jeśli dotyczy] [stan]
Przykład na podstawie danych: "${autoTitleExample}"
Pierwsze słowo = nazwa części (${partName || 'np. Chłodnica'}), NIE "Części" ani "Motoryzacja"`
  : `Wzór: [marka] [model produktu] [kluczowa cecha] [stan]
Pierwsze słowo = nazwa marki lub produktu (${partName || productStr || 'nazwa produktu'})`}
- Pierwsza litera tytułu wielka, reszta małe
- Zero zbędnej interpunkcji

STYL opisu — pisz jak sprzedawca, nie AI:
- Żadnych: "Świetna okazja", "Nie przegap", "Idealne dla", "Z przyjemnością"
- Żadnych: myślników (--- –––), gwiazdek *tekst*, wielokropków
- Emoji tylko w nagłówkach h3
- Opis max 3 zdania — fakty
- Każdy punkt listy max 10 słów

FORMAT (tylko ta struktura, nic więcej):

<titles>
<main>${isAuto ? autoTitleExample || `${partName} ${vehicleStr}`.trim() : `${productStr || partName}`} — max ${TITLE_LIMITS.OLX} znaków</main>
<ALLEGRO>jak main ale max ${TITLE_LIMITS.ALLEGRO} znaków z dodatkowymi słowami kluczowymi</ALLEGRO>
<OLX>jak main ale max ${TITLE_LIMITS.OLX} znaków</OLX>
${isAuto ? `<OTOMOTO>jak main ale max ${TITLE_LIMITS.OTOMOTO} znaków</OTOMOTO>` : ''}
</titles>
<description>
<div class="listing-description">

<h3>Opis</h3>
<p>[Max 3 konkretne zdania. Fakty, nie marketing. Co to jest, do czego służy, dlaczego warto.]</p>

<h3>Cechy</h3>
<ul>
[5-7 krótkich punktów — tylko fakty techniczne, bez owijania w bawełnę]
</ul>

<h3>Specyfikacja</h3>
<table>
<tr><th>Parametr</th><th>Wartość</th></tr>
[Min 6 wierszy z rzeczywistymi danymi dla ${productLabel} — bez pustych pól]
</table>

<h3>Wymiary</h3>
<p>[Konkretne wymiary i waga. Jeśli nie znasz dokładnych — podaj przybliżone dla tego modelu.]</p>

<h3>${isAuto ? 'Pasuje do' : 'Zastosowanie'}</h3>
<p>[${isAuto ? 'Modele pojazdów/silniki. Lista, nie akapit.' : 'Do czego służy, z czym współpracuje.'}]</p>

<h3>Stan</h3>
<p>[Rzetelny opis stanu. ${CONDITION_PL[input.condition] ?? ''}. Co działa, co ewentualnie wymaga uwagi.]</p>

<h3>Wysyłka</h3>
<p>[Jedno zdanie: opakowanie i czas wysyłki.]</p>

</div>
</description>`;
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
  const brand = input.brand ?? '';
  const model = input.productModel ?? '';
  const cond = CONDITION_PL[input.condition] ?? 'używany';
  const base = input.title
    || [brand, model, CATEGORY_CONTEXT[input.categoryType]].filter(Boolean).join(' ')
    || 'Produkt';

  const description = `<div class="listing-description">
<h3>📦 Opis</h3>
<p>${base}${brand ? ` marki ${brand}` : ''}${model ? ` model ${model}` : ''}. Stan: ${cond}. Gotowe do wysyłki następnego dnia roboczego.</p>
<h3>✅ Cechy</h3>
<ul>
${brand ? `<li>Marka: ${brand}</li>` : ''}
${model ? `<li>Model: ${model}</li>` : ''}
<li>Stan: ${cond}</li>
<li>Sprawdzony przed wysyłką</li>
</ul>
<h3>🔧 Specyfikacja</h3>
<table>
<tr><th>Parametr</th><th>Wartość</th></tr>
${brand ? `<tr><td>Marka</td><td>${brand}</td></tr>` : ''}
${model ? `<tr><td>Model</td><td>${model}</td></tr>` : ''}
<tr><td>Stan</td><td>${cond}</td></tr>
</table>
<h3>📬 Wysyłka</h3>
<p>Bezpieczne opakowanie, wysyłka kurierem w 24h od płatności.</p>
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
