export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

export interface KnowledgeCapture {
  title: string;
  knowledgeType: string;
  project: string;
  status: string;
}

export interface DecisionItem {
  title: string;
  project: string;
  owner: string;
  date: string;
}

export interface DashboardOverview {
  totalKnowledgeRecords: number;
  activeProjects: number;
  connectedDepartments: number;
  crossDepartmentRelationships: number;
  pendingValidations: number;
  criticalKnowledgeGaps: number;
  recentKnowledge: KnowledgeCapture[];
  recentDecisions: DecisionItem[];
  generatedAt: string;
}

export interface ProjectRecord {
  name: string;
  description: string;
  owner: string;
  departments: string[];
  employees: string[];
  sprint: string;
  issues: number;
  documents: number;
  progress: number;
  risk: string;
}

export interface KnowledgeRecord {
  title: string;
  description: string;
  type: string;
  department: string;
  project: string;
  source: string;
  validation: string;
  owner: string;
}

export async function apiGet<T>(path: string): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { Accept: 'application/json' }
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Network request failed';
    throw new Error(`Could not reach the Nexus API at ${API_BASE_URL}: ${reason}`);
  }

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(
      `Nexus API returned ${response.status}${detail ? `: ${detail}` : ''}`
    );
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new Error(`Nexus API returned invalid JSON for ${path}`);
  }
}
