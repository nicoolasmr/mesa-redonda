export type SpecialistKey =
    | 'marketing' | 'branding' | 'sales' | 'launches' | 'hiring'
    | 'ops' | 'product' | 'tech' | 'finance' | 'legal' | 'patents';

export interface SpecialistTemplate {
    key: SpecialistKey;
    name: string;
    description: string;
    risk_level: 'low' | 'medium' | 'high';
    icon: string;
    prompt_rules: string;
}

export const SPECIALIST_TEMPLATES: Record<SpecialistKey, SpecialistTemplate> = {
    marketing: {
        key: 'marketing',
        name: 'Growth & Marketing',
        description: 'Análise de canais, CAC, LTV e estratégias de aquisição.',
        risk_level: 'low',
        icon: '📣',
        prompt_rules: 'Foco em métricas de funil, canais de tração e posicionamento competitivo.'
    },
    branding: {
        key: 'branding',
        name: 'Branding & Voz',
        description: 'Análise de identidade, tom de voz e consistência de marca.',
        risk_level: 'low',
        icon: '🎭',
        prompt_rules: 'Avalie a consistência verbal e visual. Sugira melhorias no tom.'
    },
    sales: {
        key: 'sales',
        name: 'Vendas & CRM',
        description: 'Análise de funil de vendas, conversão e roteiros.',
        risk_level: 'medium',
        icon: '📈',
        prompt_rules: 'Identifique gargalos no fechamento. Avalie qualidade de leads.'
    },
    launches: {
        key: 'launches',
        name: 'Lançamentos',
        description: 'Estratégia de lançamento de produtos e infoprodutos.',
        risk_level: 'medium',
        icon: '🚀',
        prompt_rules: 'Avalie a antecipação e oferta. Check de copy e tráfego.'
    },
    hiring: {
        key: 'hiring',
        name: 'Hiring & People',
        description: 'Análise de currículos, fit cultural e job descriptions.',
        risk_level: 'low',
        icon: '🤝',
        prompt_rules: 'Compare candidatos com a cultura. Sugira perguntas de entrevista.'
    },
    ops: {
        key: 'ops',
        name: 'Operations & Eficiência',
        description: 'Análise de processos, custos fixos e automações.',
        risk_level: 'medium',
        icon: '⚙️',
        prompt_rules: 'Encontre redundâncias. Sugira automações de baixo custo.'
    },
    finance: {
        key: 'finance',
        name: 'Financeiro & Valuation',
        description: 'Análise de DRE, fluxo de caixa e projeções financeiras.',
        risk_level: 'high',
        icon: '💰',
        prompt_rules: 'Seja extremamente conservador. Identifique buracos no caixa. Use disclaimer obrigatório.'
    },
    legal: {
        key: 'legal',
        name: 'Jurídico & Compliance',
        description: 'Análise de contratos, riscos regulatórios e termos de uso.',
        risk_level: 'high',
        icon: '⚖️',
        prompt_rules: 'Identifique cláusulas abusivas ou riscos de lide. Nunca dê conselho legal final.'
    },
    product: {
        key: 'product',
        name: 'Produto & Roadmap',
        description: 'Análise de backlog, priorização RICE e feedback de usuários.',
        risk_level: 'low',
        icon: '🎯',
        prompt_rules: 'Foco em retenção, usabilidade e diferenciação de mercado.'
    },
    tech: {
        key: 'tech',
        name: 'Tech & Arquitetura',
        description: 'Análise de stack, escalabilidade e dívida técnica.',
        risk_level: 'medium',
        icon: '💻',
        prompt_rules: 'Avalie gargalos de performance e segurança da infraestrutura.'
    },
    patents: {
        key: 'patents',
        name: 'Patentes & IP',
        description: 'Análise de anterioridade e viabilidade de registro de marca/patente.',
        risk_level: 'high',
        icon: '📜',
        prompt_rules: 'Compare com tecnologias existentes. Identifique riscos de infração.'
    }
    // Adicionar outros conforme necessário...
};
