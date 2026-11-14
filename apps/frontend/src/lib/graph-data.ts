import { knowledgeDepartments, type KnowledgeRecord } from './knowledge';

export type GraphScope = { departments: string[]; projects: string[] };
export type GraphKnowledge = {
  title: string;
  knowledgeType: string;
  description: string;
  explanation: string;
  component: string;
  source: string;
  validation: string;
};
export type GraphNode = { id: string; label: string; type: string; group: string };
export type GraphEdge = { source: string; target: string; label: string };
export type GraphModel = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  scopes: Record<string, GraphScope>;
  details: Record<string, GraphKnowledge>;
  projects: string[];
};

const slug = (value: string) => value.toLocaleLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const departmentNodeId = (department: string) => `department-${slug(department)}`;
const projectNodeId = (project: string) => `project-${slug(project)}`;

const departmentDetails: Record<string, GraphKnowledge> = {
  'Mechanical Engineering': {
    title: 'Mechanical Engineering',
    knowledgeType: 'Department',
    description: 'Auron Mobility demo department covering enclosure design, materials and mechanical interfaces.',
    explanation: 'Its records connect housing, thermal and tolerance decisions with electrical and manufacturing teams.',
    component: 'Sensor enclosure and mechanical interfaces',
    source: 'Fictional Auron Mobility demo dataset',
    validation: 'Demo data'
  },
  'Electrical Engineering': {
    title: 'Electrical Engineering',
    knowledgeType: 'Department',
    description: 'Auron Mobility demo department covering PCB layout, sensor interfaces and electrical validation.',
    explanation: 'Its records link PCB heat, keepout and connector issues across sensor projects.',
    component: 'PCB sensor array and electrical interfaces',
    source: 'Fictional Auron Mobility demo dataset',
    validation: 'Demo data'
  },
  'Software Engineering': {
    title: 'Software Engineering',
    knowledgeType: 'Department',
    description: 'Auron Mobility demo department covering embedded firmware and sensor calibration.',
    explanation: 'Its records capture calibration drift, cold start and timing lessons for reuse.',
    component: 'Sensor calibration firmware',
    source: 'Fictional Auron Mobility demo dataset',
    validation: 'Demo data'
  },
  'Manufacturing Engineering': {
    title: 'Manufacturing Engineering',
    knowledgeType: 'Department',
    description: 'Auron Mobility demo department covering production readiness and manufacturing validation.',
    explanation: 'Its records connect line test failures and process checks with upstream product design.',
    component: 'Production test and assembly processes',
    source: 'Fictional Auron Mobility demo dataset',
    validation: 'Demo data'
  }
};

const shortLabel = (title: string) => `${title.split(/\s+/).slice(0, 2).join(' ')}…`;

export function buildGraphModel(records: KnowledgeRecord[]): GraphModel {
  const projects = [...new Set(records.map((record) => record.project))];
  const departments = [...new Set([...knowledgeDepartments, ...records.map((record) => record.department)])];
  const nodes: GraphNode[] = [
    ...departments.map((department) => ({
      id: departmentNodeId(department),
      label: department.replace(' Engineering', ''),
      type: 'Department',
      group: 'department'
    })),
    ...projects.map((project) => ({
      id: projectNodeId(project),
      label: project.split(' — ')[0],
      type: 'Project',
      group: 'project'
    })),
    ...records.map((record) => ({
      id: record.id,
      label: shortLabel(record.title),
      type: record.type,
      group: 'knowledge'
    }))
  ];

  const edges: GraphEdge[] = [
    ...records.flatMap((record) => [
      { source: departmentNodeId(record.department), target: record.id, label: 'CONTRIBUTES_TO' },
      { source: projectNodeId(record.project), target: record.id, label: 'CAPTURED_IN' }
    ]),
    ...records.flatMap((record) =>
      record.relatedRecordIds
        .filter((relatedId) => record.id < relatedId && records.some((candidate) => candidate.id === relatedId))
        .map((relatedId) => ({ source: record.id, target: relatedId, label: 'RELATED_TO' }))
    )
  ];

  const scopes: Record<string, GraphScope> = {
    ...Object.fromEntries(departments.map((department) => [
      departmentNodeId(department),
      {
        departments: [department],
        projects: [...new Set(records.filter((record) => record.department === department).map((record) => record.project))]
      }
    ])),
    ...Object.fromEntries(projects.map((project) => [
      projectNodeId(project),
      {
        departments: [...new Set(records.filter((record) => record.project === project).map((record) => record.department))],
        projects: [project]
      }
    ])),
    ...Object.fromEntries(records.map((record) => [
      record.id,
      { departments: [...new Set([record.department, ...(record.relatedDepartments ?? [])])], projects: [record.project] }
    ]))
  };

  const details: Record<string, GraphKnowledge> = {
    ...Object.fromEntries(departments.map((department) => [
      departmentNodeId(department),
      departmentDetails[department] ?? {
        title: department,
        knowledgeType: 'Department',
        description: 'A department represented in the local knowledge contribution.',
        explanation: 'This department was added through browser-side knowledge contribution.',
        component: 'Engineering knowledge',
        source: 'Manual contribution',
        validation: 'Demo data'
      }
    ])),
    ...Object.fromEntries(projects.map((project) => {
      const projectRecords = records.filter((record) => record.project === project);
      return [projectNodeId(project), {
        title: project,
        knowledgeType: 'Project',
        description: `${projectRecords.length} knowledge records are associated with this project.`,
        explanation: [...new Set(projectRecords.map((record) => record.title))].join('; '),
        component: [...new Set(projectRecords.map((record) => record.component))].join(', '),
        source: 'Fictional Auron Mobility project and knowledge records',
        validation: `${projectRecords.filter((record) => record.validation.status === 'Validated').length} validated · ${projectRecords.filter((record) => record.validation.status !== 'Validated').length} open or in progress`
      }];
    })),
    ...Object.fromEntries(records.map((record) => [
      record.id,
      {
        title: record.title,
        knowledgeType: record.type,
        description: record.problem,
        explanation: `Root cause: ${record.rootCause} Solution: ${record.solution}`,
        component: record.component,
        source: record.sources.map((source) => `${source.title} (${source.reference})`).join('; '),
        validation: record.validation.status
      }
    ]))
  };

  return { nodes, edges, scopes, details, projects };
}
