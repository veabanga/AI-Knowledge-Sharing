import recordsJson from './data/knowledge.json';

export type KnowledgeRecord = {
  id: string;
  title: string;
  type: string;
  department: string;
  project: string;
  component: string;
  problem: string;
  rootCause: string;
  solution: string;
  validation: { status: string; summary: string };
  lessons: string;
  tags: string[];
  relatedIssues: { id: string; title: string }[];
  relatedRecordIds: string[];
  sources: { title: string; reference: string; kind: string }[];
  author: string;
  createdAt: string;
  updatedAt: string;
  sourceType?: 'Curated demo' | 'Manual contribution';
  detailedContext?: string;
  category?: string;
  contributorName?: string;
  occurredAt?: string;
  stepsTaken?: string;
  validationMethod?: string;
  validationOutcome?: string;
  recommendations?: string;
  investigation?: string;
  attemptedApproaches?: string;
  unsuccessfulApproaches?: string;
  blocker?: string;
  supportNeeded?: string;
  nextSteps?: string;
  relatedDepartments?: string[];
};

export const curatedKnowledgeRecords = recordsJson as KnowledgeRecord[];
export const knowledgeRecords = curatedKnowledgeRecords;
export const knowledgeDepartments = ['Mechanical Engineering', 'Electrical Engineering', 'Software Engineering', 'Manufacturing Engineering'];
export const curatedKnowledgeProjects = [...new Set(curatedKnowledgeRecords.map((record) => record.project))];
export const knowledgeProjects = curatedKnowledgeProjects;
export const knowledgeTypes = [...new Set(curatedKnowledgeRecords.map((record) => record.type))];
export const suggestedSearches = [
  'Our sensor housing is overheating near the PCB during extended operation',
  'Firmware calibration drifts after temperature cycling',
  'Manufacturing validation fails at peak thermal load',
  'Connector pin fit and tolerance issue during assembly'
];

export function getKnowledgeRecord(id: string) {
  return knowledgeRecords.find((record) => record.id === id);
}
