package com.auron.nexusknowledge.model;

public record KnowledgeRecord(
    String title,
    String description,
    String type,
    String department,
    String project,
    String source,
    String validation,
    String owner
) {}
