import { useCallback, useEffect, useRef, useState } from 'react';
import { WIZARD_DRAFT_DEBOUNCE_MS } from './constants';
import {
  clearWizardDraft,
  loadDraft,
  loadDraftMeta,
  saveWizardDraft,
  WizardDraftMeta,
} from './draftStorage';
import { WizardData } from './types';

interface Options {
  step: number;
  data: WizardData;
  onRestore: (step: number, data: WizardData) => void;
}

export function useWizardDraft({ step, data, onRestore }: Options) {
  const [pendingDraft, setPendingDraft] = useState<WizardDraftMeta | null>(() => loadDraftMeta());
  const skipSaveRef = useRef(!!pendingDraft);
  const onRestoreRef = useRef(onRestore);
  onRestoreRef.current = onRestore;

  useEffect(() => {
    if (skipSaveRef.current) return;

    const timer = window.setTimeout(() => {
      void saveWizardDraft(step, data);
    }, WIZARD_DRAFT_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [step, data]);

  const restoreDraft = useCallback(async () => {
    const draft = await loadDraft();
    if (!draft) {
      setPendingDraft(null);
      skipSaveRef.current = false;
      return;
    }
    onRestoreRef.current(draft.step, draft.data);
    setPendingDraft(null);
    skipSaveRef.current = false;
  }, []);

  const dismissDraft = useCallback(() => {
    clearWizardDraft();
    setPendingDraft(null);
    skipSaveRef.current = false;
  }, []);

  const clearDraft = useCallback(() => {
    clearWizardDraft();
    setPendingDraft(null);
  }, []);

  return { pendingDraft, restoreDraft, dismissDraft, clearDraft };
}
