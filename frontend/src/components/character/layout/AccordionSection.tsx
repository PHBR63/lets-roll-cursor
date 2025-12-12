// @ts-nocheck
import { ReactNode } from 'react'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'
import { cn } from '@/lib/utils'

interface AccordionSectionProps {
    id: string
    title: string
    children: ReactNode
    className?: string
    defaultOpen?: boolean
}

export function AccordionSection({ id, title, children, className, defaultOpen = false }: AccordionSectionProps) {
    return (
        <div className={cn("panel overflow-hidden", className)}>
            <Accordion type="single" collapsible defaultValue={defaultOpen ? id : undefined}>
                <AccordionItem value={id} className="border-none">
                    <AccordionTrigger className="px-4 py-3 hover:bg-white/5 hover:no-underline text-white font-medium text-sm sm:text-base data-[state=open]:bg-white/5 transition-colors">
                        {title}
                    </AccordionTrigger>
                    <AccordionContent className="px-4 py-4 text-zinc-300">
                        {children}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    )
}
