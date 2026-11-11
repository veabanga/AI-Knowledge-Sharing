import type { KnowledgeRecord } from './knowledge';

export type SearchResult = {
  record: KnowledgeRecord;
  score: number;
  matchedFields: string[];
};

const fieldWeights: { key: keyof KnowledgeRecord; label: string; weight: number }[] = [
  { key: 'title', label: 'Title', weight: 8 },
  { key: 'problem', label: 'Original problem', weight: 6 },
  { key: 'rootCause', label: 'Root cause', weight: 5 },
  { key: 'solution', label: 'Solution', weight: 5 },
  { key: 'lessons', label: 'Lessons learned', weight: 4 },
  { key: 'tags', label: 'Tags', weight: 4 },
  { key: 'component', label: 'Component', weight: 2 },
  { key: 'project', label: 'Project', weight: 1.5 },
  { key: 'department', label: 'Department', weight: 1.5 },
  { key: 'type', label: 'Knowledge type', weight: 1 }
];

const stopWords = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'been', 'but', 'by', 'did', 'do',
  'does', 'for', 'from', 'has', 'have', 'how', 'i', 'in', 'is', 'it', 'me', 'during',
  'near', 'of', 'on', 'or', 'our', 'the', 'this', 'to', 'was', 'we', 'what',
  'when', 'where', 'which', 'with', 'would', 'you'
]);

const synonyms: Record<string, string[]> = {
  overheat: ['thermal', 'temperature', 'heat'],
  overheating: ['thermal', 'temperature', 'heat'],
  hot: ['thermal', 'temperature', 'heat'],
  heating: ['thermal', 'temperature', 'heat'],
  enclosure: ['housing'],
  housing: ['enclosure'],
  pcb: ['board', 'circuit'],
  board: ['pcb', 'circuit'],
  airflow: ['ventilation', 'clearance'],
  ventilation: ['airflow'],
  drift: ['offset', 'calibration'],
  drifting: ['offset', 'calibration'],
  tolerance: ['fit', 'clearance', 'stack'],
  manufacturing: ['production', 'assembly'],
  production: ['manufacturing', 'assembly'],
  failure: ['fails', 'failed', 'problem'],
  fails: ['failure', 'failed', 'problem'],
  encountered: ['problem', 'issue'],
  issue: ['problem', 'failure'],
  issues: ['problem', 'failure']
};

function normalizeToken(token: string) {
  let normalized = token.toLocaleLowerCase();
  if (normalized.length > 5 && normalized.endsWith('ing')) normalized = normalized.slice(0, -3);
  else if (normalized.length > 4 && normalized.endsWith('ed')) normalized = normalized.slice(0, -2);
  else if (normalized.length > 4 && normalized.endsWith('s')) normalized = normalized.slice(0, -1);
  return normalized;
}

function queryTokens(query: string) {
  return [...new Set(query.toLocaleLowerCase().match(/[a-z0-9]+/g)?.map(normalizeToken).filter((token) => token.length > 2 && !stopWords.has(token)) ?? [])];
}

function fieldText(record: KnowledgeRecord, key: keyof KnowledgeRecord) {
  const value = record[key];
  if (Array.isArray(value)) return value.join(' ').toLocaleLowerCase();
  return String(value).toLocaleLowerCase();
}

export function searchKnowledge(records: KnowledgeRecord[], query: string): SearchResult[] {
  const terms = queryTokens(query);
  if (terms.length === 0) {
    return records.map((record) => ({ record, score: 0, matchedFields: [] }));
  }

  const ranked = records
    .map((record) => {
      let score = 0;
      const matched = new Set<string>();
      let matchedTerms = 0;

      for (const term of terms) {
        const relatedTerms = [term, ...(synonyms[term] ?? [])];
        let bestForTerm = 0;
        let bestLabel = '';
        for (const field of fieldWeights) {
          const text = fieldText(record, field.key);
          const directMatch = relatedTerms.some((candidate) => text.includes(candidate));
          if (directMatch && field.weight > bestForTerm) {
            bestForTerm = field.weight;
            bestLabel = field.label;
          }
        }
        if (bestForTerm > 0) {
          matchedTerms += 1;
          score += bestForTerm;
          matched.add(bestLabel);
        }
      }

      if (matchedTerms > 1) score += (matchedTerms - 1) * 1.25;
      const normalizedQuery = query.toLocaleLowerCase().trim();
      if (normalizedQuery.length > 6 && record.title.toLocaleLowerCase().includes(normalizedQuery)) score += 12;

      return { record, score, matchedFields: [...matched], matchedTerms };
    })
    .filter((result) => result.score > 0 && result.matchedTerms >= Math.max(1, Math.ceil(terms.length * 0.35)))
    .sort((a, b) => b.score - a.score || a.record.title.localeCompare(b.record.title));

  return ranked.map(({ matchedTerms: _matchedTerms, ...result }) => result);
}
