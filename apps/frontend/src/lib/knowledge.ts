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
};

export const knowledgeRecords = recordsJson as KnowledgeRecord[];
export const knowledgeDepartments = [...new Set(knowledgeRecords.map((record) => record.department))];
export const knowledgeProjects = [...new Set(knowledgeRecords.map((record) => record.project))];
export const knowledgeTypes = [...new Set(knowledgeRecords.map((record) => record.type))];
export const suggestedSearches = [
  'Our sensor housing is overheating near the PCB during extended operation',
  'Firmware calibration drifts after temperature cycling',
  'Manufacturing validation fails at peak thermal load',
  'Connector pin fit and tolerance issue during assembly'
];

export function getKnowledgeRecord(id: string) {
  return knowledgeRecords.find((record) => record.id === id);
}
