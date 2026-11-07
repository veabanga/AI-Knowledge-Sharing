package com.auron.nexusknowledge.model;

import java.util.List;

public record ProjectSummary(
    String name,
    String description,
    String owner,
    List<String> departments,
    List<String> employees,
    String sprint,
    int issues,
    int documents,
    int progress,
    String risk
) {}
