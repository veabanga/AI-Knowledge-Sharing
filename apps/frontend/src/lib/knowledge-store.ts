import { writable } from 'svelte/store';
import {
  curatedKnowledgeRecords,
  type KnowledgeRecord
} from './knowledge';

const storageKey = 'nexus-knowledge-contributions-v1';

export type ContributionInput = Omit<KnowledgeRecord, 'id' | 'createdAt' | 'updatedAt' | 'sourceType'>;

function isKnowledgeRecord(value: unknown): value is KnowledgeRecord {
  if (!value || typeof value !== 'object') return false;
  const record = value as Partial<KnowledgeRecord>;
  return typeof record.id === 'string'
    && typeof record.title === 'string'
    && typeof record.project === 'string'
    && typeof record.department === 'string'
    && typeof record.problem === 'string'
    && typeof record.validation?.status === 'string'
    && Array.isArray(record.tags)
    && Array.isArray(record.relatedRecordIds)
    && Array.isArray(record.sources);
}

function mergeRecords(manualRecords: KnowledgeRecord[]) {
  const curatedIds = new Set(curatedKnowledgeRecords.map((record) => record.id));
  const uniqueManual = manualRecords.filter((record) => !curatedIds.has(record.id));
  return [...curatedKnowledgeRecords, ...uniqueManual];
}

function createKnowledgeStore() {
  const { subscribe, set, update } = writable<KnowledgeRecord[]>(curatedKnowledgeRecords);
  let loaded = false;

  function load() {
    if (typeof window === 'undefined' || loaded) return;
    loaded = true;
    try {
      const saved: unknown = JSON.parse(window.localStorage.getItem(storageKey) ?? '[]');
      if (!Array.isArray(saved) || !saved.every(isKnowledgeRecord)) {
        throw new Error('Stored knowledge contributions have an invalid format.');
      }
      set(mergeRecords(saved));
    } catch (error) {
      loaded = false;
      throw new Error(
        error instanceof Error
          ? `Could not load browser contributions: ${error.message}`
          : 'Could not load browser contributions.'
      );
    }
  }

  function add(input: ContributionInput) {
    if (typeof window === 'undefined') {
      throw new Error('Knowledge contributions can only be saved in a browser.');
    }
    load();
    let manualRecords: KnowledgeRecord[];
    try {
      const saved: unknown = JSON.parse(window.localStorage.getItem(storageKey) ?? '[]');
      if (!Array.isArray(saved) || !saved.every(isKnowledgeRecord)) {
        throw new Error('Stored knowledge contributions have an invalid format.');
      }
      const id = `manual-${crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
      const createdAt = new Date().toISOString();
      const record: KnowledgeRecord = {
        ...input,
        id,
        createdAt,
        updatedAt: createdAt,
        sourceType: 'Manual contribution'
      };
      manualRecords = [...saved, record];
      window.localStorage.setItem(storageKey, JSON.stringify(manualRecords));
      update(() => mergeRecords(manualRecords));
      return record;
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? `Could not save this contribution in browser storage: ${error.message}`
          : 'Could not save this contribution in browser storage.'
      );
    }
  }

  function handleStorage(event: StorageEvent) {
    if (event.key !== storageKey) return;
    loaded = false;
    load();
  }

  return {
    subscribe,
    load,
    add,
    handleStorage
  };
}

export const knowledgeStore = createKnowledgeStore();

export function loadKnowledgeStore() {
  knowledgeStore.load();
}

export function addKnowledgeRecord(input: ContributionInput) {
  return knowledgeStore.add(input);
}

export const contributionStorageKey = storageKey;
