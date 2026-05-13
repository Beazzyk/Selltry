import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import { getListing, updateListing, uploadImages, deleteImage } from '@/api/listings.api';
import { Step1Category } from './wizard/Step1Category';
import { Step1Vehicle } from './wizard/Step1Vehicle';
import { Step2Details } from './wizard/Step2Details';
import { Step2FieldsGeneric } from './wizard/Step2FieldsGeneric';
import { Step3Images } from './wizard/Step3Images';
import { Step4Submit } from './wizard/Step4Submit';
import { WizardData, WIZARD_DEFAULTS } from './wizard/types';
import { Listing, ListingImage } from '@/types';

const STEPS_AUTO = [
  { label: 'Kategoria', desc: 'Zmień kategorię' },
  { label: 'Pojazd', desc: 'Dane pojazdu' },
  { label: 'Szczegóły', desc: 'Stan i opis' },
  { label: 'Zdjęcia', desc: 'Zarządzaj zdjęciami' },
  { label: 'Cena', desc: 'Cena i platformy' },
];

const STEPS_GENERIC = [
  { label: 'Kategoria', desc: 'Zmień kategorię' },
  { label: 'Szczegóły', desc: 'Stan i opis' },
  { label: 'Zdjęcia', desc: 'Zarządzaj zdjęciami' },
  { label: 'Cena', desc: 'Cena i platformy' },
];

function listingToWizardData(listing: Listing): WizardData {
  return {
    identMethod: listing.identMethod,
    vin: listing.vin,
    catalogNumber: listing.catalogNumber,
    vehicleType: listing.vehicleType,
    vehicleMakeId: listing.vehicleMakeId,
    vehicleModelId: listing.vehicleModelId,
    vehicleGenId: listing.vehicleGenId,
    vehicleYearRaw: listing.vehicleYearRaw,
    vehicleEngine: listing.vehicleEngine,
    categoryId: listing.categoryId,
    partSide: listing.partSide,
    condition: listing.condition,
    title: listing.title,
    description: listing.description,
    partDetails: listing.partDetails,
    damageDescription: listing.damageDescription,
    attributes: (listing.attributes as Record<string, string | number> | undefined) ?? {},
    images: [],
    basePrice: listing.basePrice,
    quantity: listing.quantity,
    selectedPlatforms: [],
  };
}

function SkeletonWizard() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-48" />
      <div className="flex gap-2">{[...Array(4)].map((_, i) => <div key={i} className="flex-1 h-10 bg-gray-200 rounded" />)}</div>
      <div className="h-64 bg-gray-200 rounded-xl" />
    </div>
  );
}

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<WizardData>(WIZARD_DEFAULTS);
  const [existingImages, setExistingImages] = useState<ListingImage[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const { data: listing, isLoading, isError } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => getListing(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (listing && !initialized) {
      setData(listingToWizardData(listing));
      setExistingImages(listing.images);
      setInitialized(true);
    }
  }, [listing, initialized]);

  const isAuto = data.categoryType === 'AUTOMOTIVE' || !data.categoryType;
  const STEPS = isAuto ? STEPS_AUTO : STEPS_GENERIC;

  function patch(update: Partial<WizardData>) {
    setData((prev) => ({ ...prev, ...update }));
  }

  function canProceed(): boolean {
    if (step === 0) return !!data.categoryId;
    if (isAuto) {
      if (step === 1) return !!data.vehicleType;
      if (step === 2) return !!data.condition && !!data.title && (data.description?.length ?? 0) >= 10;
    } else {
      if (step === 1) return !!data.condition && !!data.title && (data.description?.length ?? 0) >= 10;
    }
    if (step === STEPS.length - 2) return true;
    if (step === STEPS.length - 1) return !!data.basePrice;
    return false;
  }

  async function handleSubmit() {
    if (!id || !data.categoryId || !data.condition || !data.title || !data.description || !data.basePrice) return;

    setSubmitting(true);
    try {
      await updateListing(id, {
        title: data.title, description: data.description, basePrice: data.basePrice,
        condition: data.condition, quantity: data.quantity ?? 1, identMethod: data.identMethod,
        vin: data.vin, catalogNumber: data.catalogNumber, vehicleType: data.vehicleType,
        vehicleMakeId: data.vehicleMakeId, vehicleModelId: data.vehicleModelId,
        vehicleGenId: data.vehicleGenId, vehicleYearRaw: data.vehicleYearRaw,
        vehicleEngine: data.vehicleEngine, categoryId: data.categoryId,
        partSide: data.partSide, partDetails: data.partDetails,
        damageDescription: data.damageDescription,
        attributes: Object.keys(data.attributes).length > 0 ? data.attributes : undefined,
      });

      const removedIds = listing!.images.filter((img) => !existingImages.some((e) => e.id === img.id)).map((img) => img.id);
      await Promise.all(removedIds.map((imgId) => deleteImage(id, imgId)));
      if (data.images.length > 0) await uploadImages(id, data.images);

      toast('Ogłoszenie zaktualizowane!', 'success');
      navigate('/listings');
    } catch {
      toast('Błąd podczas zapisywania zmian', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading || !initialized) return <SkeletonWizard />;
  if (isError || !listing) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <p className="text-gray-500">Nie znaleziono ogłoszenia.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/listings')}>Wróć do listy</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edytuj ogłoszenie</h1>
        <p className="text-sm text-gray-500 mt-1 truncate">{listing.title}</p>
      </div>

      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center flex-1">
            <button type="button" onClick={() => i < step && setStep(i)} className="flex flex-col items-center gap-1 flex-1">
              <div className={cn('flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                i < step && 'bg-[var(--navy)] text-white', i === step && 'bg-[var(--navy)] text-white ring-4 ring-[rgba(22,61,110,0.12)]', i > step && 'bg-gray-200 text-gray-500')}>
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
        {step === STEPS.length - 2 && (
          <Step3Images data={data} onChange={patch} existingImages={existingImages} onDeleteExisting={(imgId) => setExistingImages((prev) => prev.filter((img) => img.id !== imgId))} />
        )}
        {step === STEPS.length - 1 && <Step4Submit data={data} onChange={patch} />}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => (step === 0 ? navigate('/listings') : setStep(step - 1))}>
          <ChevronLeft className="h-4 w-4 mr-1" />{step === 0 ? 'Anuluj' : 'Wstecz'}
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>Dalej <ChevronRight className="h-4 w-4 ml-1" /></Button>
        ) : (
          <Button onClick={handleSubmit} disabled={!canProceed() || submitting}>
            {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
            {submitting ? 'Zapisywanie...' : 'Zapisz zmiany'}
          </Button>
        )}
      </div>
    </div>
  );
}
