import OpenAI from "openai";
import { MesaTemplate } from "./ai/templates";

// Initialize OpenAI Client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const SYSTEM_PROMPTS = {
    MODERATOR: `Você é o Moderador da Mesa Redonda, uma plataforma de decisão estratégica.
    Seu objetivo é conduzir o usuário a criar um ARTEFATO TANGÍVEL (Plano, Checklist, Documento).
    
    DIRETRIZES GERAIS:
    1. DETERMINISTIC-FIRST: Responda SEMPRE em formato JSON estruturado quando solicitado um artefato.
    2. MODE CÉTICO: Se o usuário ativar o modo cético, duvide de premissas otimistas.
    3. GUARDRAILS: Nunca invente dados. Se não souber, pergunte.
    
    ESTRUTURA DA RESPOSTA (JSON):
    Sempre que responder, tente encaixar neste schema JSON se for uma resposta final ou geração de artefato:
    {
      "text": "Explicação em texto markdown...",
      "artifact": { ... } // Opcional, apenas se for gerar o artefato
      "reasons": ["Razão 1", "Razão 2", "Razão 3"], // Por que você respondeu isso?
      "risks": ["Risco 1", "Risco 2"], // O que pode dar errado?
      "assumptions": ["Suposição A", "Suposição B"] // O que você assumiu?
    }
    Se for apenas conversa, use o campo "text".
    `,

    PERSONA_SCEPTIC: `Você é 'O Cético'. Seu trabalho é encontrar furos na lógica. Não seja mal-educado, mas seja implacável com riscos. Comece frases com "Mas e se..." ou "Você considerou...".`,
    PERSONA_OPTIMIST: `Você é 'O Visionário'. Seu trabalho é expandir horizontes. Pergunte 'Como isso pode ser 10x maior?'.`,
    PERSONA_ANALYST: `Você é 'O Analista'. Foque em dados, métricas, viabilidade técnica e "Como vamos medir isso?".`
};

export interface LLMMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

export async function callLLM(messages: LLMMessage[], model = process.env.OPENAI_MODEL || "gpt-4o-mini") {
    try {
        const response = await openai.chat.completions.create({
            messages,
            model,
            temperature: 0.7,
            response_format: { type: "json_object" }
        });

        return response.choices[0].message.content || "{}";
    } catch (error) {
        console.error("LLM Error:", error);
        // Fallback deterministic JSON
        return JSON.stringify({
            text: "Desculpe, tive um problema ao processar seu pedido. (Fallback Mode)",
            reasons: ["Erro de conexão ou timeout"],
            risks: ["Resposta não verificada"],
            assumptions: ["Tente novamente"]
        });
    }
}

export function buildSystemPrompt(template: MesaTemplate, isSkeptic = false) {
    let prompt = SYSTEM_PROMPTS.MODERATOR + "\n\n";
    if (isSkeptic) {
        prompt += "CRITICAL INSTRUCTION: HARD MODE / SCEPTIC MODE ENABLED.\n";
        prompt += "Você deve ser muito mais crítico, apontar falhas de lógica agressivamente e focar em riscos. Não aceite respostas genéricas.\n\n";
    }
    prompt += `CONTEXTO DA MESA: ${template.name}\n${template.description}\n\n`;

    prompt += "PERSONAS ATIVAS NESTA MESA:\n";
    template.personas.forEach(p => {
        prompt += `- ${p.name} (${p.role}): ${p.systemPrompt}\n`;
    });

    prompt += "\nUse essas personas para debater internamente antes de gerar a resposta final (Show your thinking process implicitamente no campo 'text').";

    return prompt;
}
