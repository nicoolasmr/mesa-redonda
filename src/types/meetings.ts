import { z } from "zod";

export const MeetingStatusSchema = z.enum([
    'created',
    'uploaded',
    'transcribing',
    'analyzing',
    'done',
    'error'
]);

export type MeetingStatus = z.infer<typeof MeetingStatusSchema>;

export const DecisionSchema = z.object({
    decision: z.string(),
    why: z.string(),
    criteria: z.array(z.string()),
    owner: z.string().nullable(),
    deadline: z.string().nullable(),
});

export const ActionItemSchema = z.object({
    task: z.string(),
    owner: z.string().nullable(),
    deadline: z.string().nullable(),
    priority: z.enum(["P0", "P1", "P2"]),
});

export const RiskSchema = z.object({
    risk: z.string(),
    impact: z.string(),
    mitigation: z.string(),
    owner: z.string().nullable(),
});

export const MeetingInsightsSchema = z.object({
    summary: z.object({
        one_liner: z.string(),
        paragraph: z.string(),
    }),
    decisions: z.array(DecisionSchema),
    action_items: z.array(ActionItemSchema),
    risks: z.array(RiskSchema),
    open_questions: z.array(z.string()),
    next_agenda: z.array(z.string()),
    follow_up_message: z.string(),
});

export type MeetingInsights = z.infer<typeof MeetingInsightsSchema>;

export interface MeetingTranscript {
    id: string;
    meeting_id: string;
    transcript_text: string;
    transcript_json: any; // TODO: Define more granularly if Whisper provides structured data
    model_used: string;
    created_at: string;
}

export interface Meeting {
    id: string;
    workspace_id: string;
    created_by: string;
    title: string;
    consent_confirmed: boolean;
    jurisdiction?: string;
    audio_object_path?: string;
    duration_seconds?: number;
    status: MeetingStatus;
    error_message?: string;
    created_at: string;
    updated_at: string;
}
