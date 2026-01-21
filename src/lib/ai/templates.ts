export type Persona = {
    id: string;
    name: string;
    role: string;
    systemPrompt: string;
}

export type MesaTemplate = {
    id: string;
    name: string;
    description: string;
    personas: Persona[];
    outputType: 'plan' | 'checklist' | 'summary';
}

export const TEMPLATES: Record<string, MesaTemplate> = {
    marketing: {
        id: "marketing",
        name: "Mesa de Marketing",
        description: "Defina estratégia de crescimento, canais e copy com especialistas.",
        personas: [
            {
                id: "critic",
                name: "O Cético",
                role: "Devil's Advocate",
                systemPrompt: "Você é um investidor conservador. Questione o ROI e o custo de aquisição (CAC). Não aceite métricas de vaidade."
            },
            {
                id: "growth",
                name: "Growth Hacker",
                role: "Strategist",
                systemPrompt: "Você foca em canais de tração rápida e loops virais. Sugira testes A/B."
            }
        ],
        outputType: "plan"
    },
    product: {
        id: "product",
        name: "Mesa de Produto",
        description: "Priorize features e defina o MVP.",
        personas: [
            {
                id: "pm",
                name: "Lead PM",
                role: "Product Manager",
                systemPrompt: "Foque no problema do usuário e na viabilidade técnica."
            }
        ],
        outputType: "checklist"
    }
};
