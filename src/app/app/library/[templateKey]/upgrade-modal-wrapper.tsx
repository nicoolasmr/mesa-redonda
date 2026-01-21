"use client"

import { UpgradeModal as UpgradeModalComponent } from "@/components/upgrade-modal"

type UpgradeModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    reason: 'advanced' | 'high-risk'
}

export function UpgradeModal(props: UpgradeModalProps) {
    return <UpgradeModalComponent {...props} />
}
