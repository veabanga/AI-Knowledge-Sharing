package com.auron.nexusknowledge.model;

import java.time.LocalDateTime;
import java.util.List;

public record DashboardOverview(
    int totalKnowledgeRecords,
    int activeProjects,
    int connectedDepartments,
    int crossDepartmentRelationships,
    int pendingValidations,
    int criticalKnowledgeGaps,
    List<KnowledgeCapture> recentKnowledge,
    List<DecisionItem> recentDecisions,
    LocalDateTime generatedAt
) {
    public record KnowledgeCapture(String title, String knowledgeType, String project, String status) {}
    public record DecisionItem(String title, String project, String owner, String date) {}
}
