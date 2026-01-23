import { z } from "zod";

export const StudyPackSchema = z.object({
    summary: z.object({
        one_liner: z.string(),
        paragraph: z.string(),
    }),
    key_findings: z.array(z.object({
        title: z.string(),
        evidence: z.string(),
        confidence: z.enum(["low", "med", "high"]),
    })),
    kpis: z.array(z.object({
        label: z.string(),
        value: z.string(),
        note: z.string().nullable(),
    })),
    risks: z.array(z.object({
        risk: z.string(),
        impact: z.string(),
        mitigation: z.string(),
        confidence: z.enum(["low", "med", "high"]),
    })),
    assumptions: z.array(z.string()),
    next_steps: z.array(z.object({
        step: z.string(),
        owner: z.string().nullable(),
        deadline: z.string().nullable(),
        priority: z.enum(["P0", "P1", "P2"]),
    })),
    questions_for_user: z.array(z.string()),
    disclaimer: z.string().nullable(),
});

export const DashboardPackSchema = z.object({
    cards: z.array(z.object({
        title: z.string(),
        value: z.string(),
        delta: z.string().nullable(),
        note: z.string().nullable(),
    })),
    charts: z.array(z.object({
        type: z.enum(["bar", "line", "pie", "table"]),
        title: z.string(),
        xKey: z.string().nullable(),
        yKey: z.string().nullable(),
        series: z.array(z.string()).nullable(),
        data: z.array(z.record(z.string(), z.any())),
        note: z.string().nullable(),
    })),
    tables: z.array(z.object({
        title: z.string(),
        columns: z.array(z.string()),
        rows: z.array(z.array(z.string())),
    })),
});

export type StudyPack = z.infer<typeof StudyPackSchema>;
export type DashboardPack = z.infer<typeof DashboardPackSchema>;
