package com.auron.nexusknowledge.controller;

import com.auron.nexusknowledge.model.DashboardOverview;
import com.auron.nexusknowledge.model.DashboardOverview.DecisionItem;
import com.auron.nexusknowledge.model.DashboardOverview.KnowledgeCapture;
import com.auron.nexusknowledge.model.KnowledgeRecord;
import com.auron.nexusknowledge.model.ProjectSummary;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api")
public class OverviewController {

    @GetMapping("/overview")
    public DashboardOverview getOverview() {
        return new DashboardOverview(
            6480,
            18,
            4,
            37,
            31,
            7,
            List.of(
                new KnowledgeCapture("Housing redesign affects thermal profile", "Engineering change", "Automotive Sensor Development", "validated"),
                new KnowledgeCapture("Calibration drift in low-noise firmware", "Problem", "Embedded Sensor Software", "review pending"),
                new KnowledgeCapture("Production test fixture redesigned for throughput", "Process", "Sensor Manufacturing Integration", "validated"),
                new KnowledgeCapture("PCB trace routing constraint flagged by electrical team", "Requirement", "Automotive Sensor Development", "approved")
            ),
            List.of(
                new DecisionItem("Switch from aluminum bracket to composite bracket", "Automotive Sensor Development", "Alex Morgan", "2026-08-14"),
                new DecisionItem("Lock firmware timing to 10 kHz baseline", "Embedded Sensor Software", "Sarah Chen", "2026-08-21"),
                new DecisionItem("Adopt inline burn-in gate before packaging", "Sensor Manufacturing Integration", "David Miller", "2026-09-03")
            ),
            LocalDateTime.now()
        );
    }

    @GetMapping("/projects")
    public List<ProjectSummary> getProjects() {
        return List.of(
            new ProjectSummary(
                "Automotive Sensor Development",
                "Thermal and mechanical tuning for the next-generation sensor platform.",
                "Alex Morgan",
                List.of("Mechanical Engineering", "Electrical Engineering"),
                List.of("Alex Morgan", "Michael Weber"),
                "S5 - Calibration validation",
                12,
                9,
                78,
                "Thermal variance during validation"
            ),
            new ProjectSummary(
                "Embedded Sensor Software",
                "Calibration and embedded control logic for sensor firmware.",
                "Sarah Chen",
                List.of("Software Engineering", "Electrical Engineering"),
                List.of("Sarah Chen", "Michael Weber"),
                "S4 - Firmware tuning",
                9,
                11,
                84,
                "Clock drift in low-noise mode"
            ),
            new ProjectSummary(
                "Sensor Manufacturing Integration",
                "Production and test integration for high-volume manufacturing ramp up.",
                "David Miller",
                List.of("Manufacturing Engineering", "Mechanical Engineering"),
                List.of("David Miller", "Alex Morgan"),
                "S3 - Process capability ramp",
                7,
                8,
                68,
                "Inline test throughput below target"
            )
        );
    }

    @GetMapping("/knowledge")
    public List<KnowledgeRecord> getKnowledge() {
        return List.of(
            new KnowledgeRecord("Thermal housing redesign reduces sensor drifting", "A composite housing reduced thermal variation and improved sensor calibration stability.", "Decision", "Mechanical Engineering", "Automotive Sensor Development", "Design review; thermal model", "validated", "Alex Morgan"),
            new KnowledgeRecord("Firmware calibration issue linked to sensor noise floor", "Firmware timing in low-noise mode amplified thermal sensitivity and sensor variance.", "Problem", "Software Engineering", "Embedded Sensor Software", "Jira ENG-1172", "review pending", "Sarah Chen"),
            new KnowledgeRecord("Inline burn-in gate required before final packaging", "Manufacturing validation identified a burn-in gate before final packaging to reduce latent defects.", "Requirement", "Manufacturing Engineering", "Sensor Manufacturing Integration", "MSA sample study", "validated", "David Miller")
        );
    }
}
