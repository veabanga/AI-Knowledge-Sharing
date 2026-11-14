import { writable } from 'svelte/store';

export type TourState = {
  active: boolean;
  step: number;
  createdRecordId?: string;
};

export type TourAction = 'run-example-search' | 'open-top-result' | 'open-created-record' | 'close-detail' | null;

export const tourState = writable<TourState>({ active: false, step: 0 });
export const tourTipVisible = writable(true);
export const tourAction = writable<TourAction>(null);

export function startTour() {
  tourAction.set(null);
  tourTipVisible.set(true);
  tourState.set({ active: true, step: 1 });
}

export function finishTour() {
  tourAction.set(null);
  tourTipVisible.set(true);
  tourState.set({ active: false, step: 0 });
}

export function continueTourWithRecord(recordId: string) {
  tourAction.set(null);
  tourState.set({ active: true, step: 8, createdRecordId: recordId });
}
