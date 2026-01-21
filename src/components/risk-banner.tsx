import { AlertTriangle } from "lucide-react"

export function RiskBanner() {
    return (
        <div className="bg-red-900/20 border-2 border-red-500/50 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-4">
                <AlertTriangle className="h-6 w-6 text-red-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-red-300 mb-2">
                        ⚠️ INFORMATIVO - NÃO SUBSTITUI PROFISSIONAL
                    </h3>
                    <p className="text-sm text-red-200 leading-relaxed">
                        Este conteúdo é <strong>educacional e informativo</strong>.
                        Não constitui aconselhamento jurídico, contábil ou financeiro.
                        Sempre consulte um <strong>advogado, contador ou profissional qualificado</strong> antes de tomar decisões legais ou financeiras.
                    </p>
                    <p className="text-xs text-red-300 mt-3">
                        Os artefatos gerados são <strong>checklists, perguntas e rascunhos</strong> para você levar ao profissional,
                        não documentos finais para uso direto.
                    </p>
                </div>
            </div>
        </div>
    )
}
