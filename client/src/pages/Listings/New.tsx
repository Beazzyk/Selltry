import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import { createListing, uploadImages } from '@/api/listings.api';
import { publishListing } from '@/api/platforms.api';
import { Step1Category } from './wizard/Step1Category';
import { Step1Vehicle } from './wizard/Step1Vehicle';
import { Step2Details } from './wizard/Step2Details';
import { Step2FieldsGeneric } from './wizard/Step2FieldsGeneric';
import { Step3Images } from './wizard/Step3Images';
import { Step4Submit } from './wizard/Step4Submit';
import { WizardData, WIZARD_DEFAULTS } from './wizard/types';
import { ListingPreview } from '@/components/listings/ListingPreview';

const STEPS_AUTO = [
  { label: 'Kategoria', desc: 'Wybierz kategorię' },
  { label: 'Pojazd', desc: 'Identyfikacja i dane pojazdu' },
  { label: 'Szczegóły', desc: 'Stan, opis i parametry' },
  { label: 'Zdjęcia', desc: 'Dodaj zdjęcia' },
  { label: 'Cena', desc: 'Ustal cenę i zatwierdź' },
];

const STEPS_GENERIC = [
  { label: 'Kategoria', desc: 'Wybierz kategorię' },
  { label: 'Szczegóły', desc: 'Stan, opis i parametry' },
  { label: 'Zdjęcia', desc: 'Dodaj zdjęcia' },
  { label: 'Cena', desc: 'Ustal cenę i zatwierdź' },
];

export default function NewListingPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<WizardData>(WIZARD_DEFAULTS);
  const [submitting, setSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [createdListingId, setCreatedListingId] = useState<string | null>(null);

  const isAuto = data.categoryType === 'AUTOMOTIVE';
  const STEPS = isAuto ? STEPS_AUTO : STEPS_GENERIC;

  function patch(update: Partial<WizardData>) {
    setData((prev) => ({ ...prev, ...update }));
  }

  const CATEGORY_REQUIRED_PLATFORMS = ['ALLEGRO', 'OLX', 'OTOMOTO'];

  function platformCategoriesValid(): boolean {
    return data.selectedPlatforms
      .filter((p) => CATEGORY_REQUIRED_PLATFORMS.includes(p))
      .every((p) => !!data.platformCategories[p]);
  }

  function canProceed(): boolean {
    if (step === 0) return !!data.categoryType && !!data.categoryId;
    if (isAuto) {
      if (step === 1) return !!data.vehicleType;
      if (step === 2) return !!data.condition && !!data.title && (data.description?.length ?? 0) >= 10;
    } else {
      if (step === 1) return !!data.condition && !!data.title && (data.description?.length ?? 0) >= 10;
    }
    if (step === STEPS.length - 2) return true;
    if (step === STEPS.length - 1) return !!data.basePrice && platformCategoriesValid();
    return false;
  }

  const isPublishing = data.selectedPlatforms.length > 0;

  async function handleSubmit() {
    if (!data.categoryId || !data.condition || !data.title || !data.description || !data.basePrice) return;

    setSubmitting(true);
    try {
      // If listing already created (retry after partial failure), skip create
      let listingId = createdListingId;

      if (!listingId) {
        const listing = await createListing({
          title: data.title,
          description: data.description,
          basePrice: data.basePrice,
          condition: data.condition,
          quantity: data.quantity ?? 1,
          identMethod: data.identMethod,
          vin: data.vin,
          catalogNumber: data.catalogNumber,
          vehicleType: data.vehicleType,
          vehicleMakeId: data.vehicleMakeId,
          vehicleModelId: data.vehicleModelId,
          vehicleGenId: data.vehicleGenId,
          vehicleYearRaw: data.vehicleYearRaw,
          vehicleEngine: data.vehicleEngine,
          categoryId: data.categoryId,
          partSide: data.partSide,
          partDetails: data.partDetails,
          damageDescription: data.damageDescription,
          attributes: Object.keys(data.attributes).length > 0 ? data.attributes : undefined,
          platformCategories: Object.keys(data.platformCategories).length > 0 ? data.platformCategories : undefined,
        });
        listingId = listing.id;
        setCreatedListingId(listing.id);
      }

      if (data.images.length > 0) await uploadImages(listingId, data.images);
      if (data.selectedPlatforms.length > 0) await publishListing(listingId, data.selectedPlatforms);

      toast(
        data.selectedPlatforms.length > 0
          ? 'Wystawianie w toku — sprawdź status w liście ogłoszeń'
          : 'Szkic zapisany',
        'success',
      );
      navigate('/listings');
    } catch {
      toast('Błąd podczas zapisywania ogłoszenia', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nowe ogłoszenie</h1>
        <p className="text-sm text-gray-500 mt-1">Wypełnij dane krok po kroku</p>
      </div>

      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center flex-1">
            <button type="button" onClick={() => i < step && setStep(i)} className="flex flex-col items-center gap-1 flex-1">
              <div className={cn('flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                i < step && 'bg-[var(--navy)] text-white',
                i === step && 'bg-[var(--navy)] text-white ring-4 ring-[rgba(22,61,110,0.12)]',
                i > step && 'bg-gray-200 text-gray-500',
              )}>
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={cn('text-xs font-medium hidden sm:block', i === step ? 'text-[var(--navy)]' : 'text-gray-500')}>{s.label}</span>
            </button>
            {i < STEPS.length - 1 && <div className={cn('h-0.5 flex-1', i < step ? 'bg-[var(--navy)]' : 'bg-gray-200')} />}
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">{STEPS[step].label}</h2>
        <p className="text-sm text-gray-500 mb-6">{STEPS[step].desc}</p>

        {step === 0 && <Step1Category data={data} onChange={patch} />}
        {isAuto && step === 1 && <Step1Vehicle data={data} onChange={patch} />}
        {isAuto && step === 2 && <Step2Details data={data} onChange={patch} />}
        {!isAuto && step === 1 && <Step2FieldsGeneric data={data} onChange={patch} />}
        {step === STEPS.length - 2 && <Step3Images data={data} onChange={patch} />}
        {step === STEPS.length - 1 && <Step4Submit data={data} onChange={patch} />}
      </div>

      {showPreview && <ListingPreview data={data} onClose={() => setShowPreview(false)} />}

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => (step === 0 ? navigate('/listings') : setStep(step - 1))}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          {step === 0 ? 'Anuluj' : 'Wstecz'}
        </Button>

        {step < STEPS.length - 1 ? (
          <div className="flex gap-2">
            {step >= 2 && (
              <Button variant="outline" onClick={() => setShowPreview(true)}>
                <Eye className="h-4 w-4 mr-1" /> Podgląd
              </Button>
            )}
            <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
              Dalej <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-end gap-2">
            {data.selectedPlatforms.length > 0 && !platformCategoriesValid() && (
              <p className="text-xs text-amber-600">
                Wybierz kategorię dla każdej zaznaczonej platformy, żeby wystawić ogłoszenie.
              </p>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowPreview(true)}>
                <Eye className="h-4 w-4 mr-1" /> Podgląd
              </Button>
              <Button onClick={handleSubmit} disabled={!canProceed() || submitting}>
                {submitting
                  ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  : <Check className="h-4 w-4 mr-2" />}
                {submitting
                  ? (isPublishing ? 'Wystawianie...' : 'Zapisywanie...')
                  : (isPublishing ? 'Wystawiaj' : 'Zapisz szkic')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
