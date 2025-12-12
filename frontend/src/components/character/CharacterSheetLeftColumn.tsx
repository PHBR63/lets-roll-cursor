// @ts-nocheck
import { Character, CharacterUpdateData } from '@/types/character'
import { VitalsPanel } from './VitalsPanel'
import { AttributesGrid } from './AttributesGrid'
import { ProfileCard } from './cards/ProfileCard'
// import { AccordionSection } from './layout/AccordionSection'
import { InventoryPanel } from './InventoryPanel'
// import { PersonalData } from './PersonalData' // Will wrap in accordion
// import { Biography } from './Biography' // Will wrap in accordion

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'
import { PersonalData } from './PersonalData'

interface CharacterSheetLeftColumnProps {
    character: Character
    onUpdate: (updates: CharacterUpdateData) => void
    onRefresh: () => void
}

export function CharacterSheetLeftColumn({ character, onUpdate, onRefresh }: CharacterSheetLeftColumnProps) {
    return (
        <div className="flex flex-col gap-6">
            {/* Profile & Name Card */}
            <ProfileCard character={character} className="panel" />

            {/* Vitals (PV/SAN/PE) */}
            <VitalsPanel
                character={character}
                onUpdateResource={() => onRefresh()}
            />

            {/* Attributes Hex Grid */}
            <AttributesGrid
                character={character}
                onUpdate={onUpdate}
            />

            {/* Dados Pessoais (Accordion) */}
            <div className="panel overflow-hidden">
                <Accordion type="single" collapsible>
                    <AccordionItem value="personal" className="border-none">
                        <AccordionTrigger className="px-4 py-3 hover:bg-white/5 hover:no-underline text-white font-medium text-sm">
                            Dados Pessoais
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                            <PersonalData character={character} onUpdate={onUpdate} />
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>

            {/* Inventário */}
            <InventoryPanel character={character} onUpdate={onRefresh} />

            {/* Biografia (Moved to bottom of right column in design, but keeping structure flexible) 
           Actually design request says "Biografia do Personagem" at the bottom full width.
           We can keep it here or there. Let's stick to design: Bottom. 
           So removing from here.
       */}
        </div>
    )
}
