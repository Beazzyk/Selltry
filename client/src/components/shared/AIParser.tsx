import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { parseListingInput } from '@/api/ai-parser.api';
import { ParsedListingData } from '@/api/ai-parser.api';

interface Props {
  onParsed: (data: ParsedListingData) => void;
}

export function AIParser({ onParsed }: Props) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsReview, setNeedsReview] = useState(false);
  const [parserMode, setParserMode] = useState<'AI' | 'REGEX' | null>(null);

  async function handleParse() {
    if (input.trim().length < 3) return;
    setLoading(true);
    try {
      const parsed = await parseListingInput(input.trim());
      onParsed(parsed);
      setNeedsReview(parsed.needsReview);
      setParserMode(parsed.parserMode);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-primary-200 bg-primary-50 p-4">
      <h3 className="text-sm font-semibold text-primary-900">Szybki opis (AI Parser)</h3>
      <p className="mb-3 mt-1 text-xs text-primary-700">
        Wpisz np. &quot;lampa tył suzuki samurai prawa 1990 używana&quot; — uzupełnimy kategorię, stan i tytuł.
      </p>
      <p className="mb-2 text-xs text-primary-600">
        {parserMode === 'REGEX'
          ? 'Tryb uproszczony (regex): wyniki wymagają ręcznej weryfikacji.'
          : 'Parser uzupełnia pola w kroku „Część”.'}
      </p>
      <div className="flex gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Szybki opis części..." />
        <Button type="button" onClick={handleParse} disabled={loading || input.trim().length < 3}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Wypełnij automatycznie
        </Button>
      </div>
      {needsReview && (
        <p className="mt-3 rounded-md bg-amber-100 px-2 py-1 text-xs text-amber-900">
          Sprawdź uzupełnione pola przed przejściem dalej.
        </p>
      )}
    </div>
  );
}
