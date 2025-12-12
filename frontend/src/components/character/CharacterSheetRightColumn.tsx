import { Character, CharacterUpdateData } from '@/types/character'
import { CombatPanel } from './CombatPanel'

import { AccordionSection } from './layout/AccordionSection'
import { Biography } from './Biography'

interface CharacterSheetRightColumnProps {
    character: Character
    onUpdate: (updates: CharacterUpdateData) => void
}

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SkillsTab } from './tabs/SkillsTab'

export function CharacterSheetRightColumn({ character, onUpdate }: CharacterSheetRightColumnProps) {
    return (
        <div className="flex flex-col h-full">
            {/* @ts-expect-error - ReactNode type mismatch */}
            <Tabs defaultValue="general" className="w-full">
                {/* @ts-expect-error - ReactNode type mismatch */}
                <TabsList className="grid w-full grid-cols-2 bg-black/40 border border-white/10 mb-6">
                    {/* @ts-expect-error - ReactNode type mismatch */}
                    <TabsTrigger value="general">Geral</TabsTrigger>
                    {/* @ts-expect-error - ReactNode type mismatch */}
                    <TabsTrigger value="skills">Perícias</TabsTrigger>
                </TabsList>

                {/* @ts-expect-error - ReactNode type mismatch */}
                <TabsContent value="general" className="flex flex-col gap-6 mt-0">
                    {/* Combate Table */}
                    <CombatPanel character={character} />

                    {/* Accordions Section */}
                    <div className="flex flex-col gap-4">
                        <AccordionSection id="skills-recipes" title="Habilidades/Receitas">
                            {/* Placeholder for now */}
                            <div className="text-sm text-zinc-500 italic p-2">Lista de habilidades...</div>
                        </AccordionSection>

                        <AccordionSection id="important-people" title="Pessoas Importantes">
                            <div className="text-sm text-zinc-500 italic p-2">Notas sobre NPCs...</div>
                        </AccordionSection>

                        <AccordionSection id="important-items" title="Itens Importantes">
                            <div className="text-sm text-zinc-500 italic p-2">Itens de história...</div>
                        </AccordionSection>

                        <AccordionSection id="diseases" title="Doenças">
                            <div className="text-sm text-zinc-500 italic p-2">Condições especiais...</div>
                        </AccordionSection>
                    </div>

                    {/* Apresentação (Textarea) */}
                    <AccordionSection id="presentation" title="Apresentação do Personagem" defaultOpen>
                        <div className="text-sm text-zinc-300 leading-relaxed max-w-none prose prose-invert p-2">
                            <p className="opacity-80">
                                {character.biography || "Sem apresentação definida..."}
                            </p>
                        </div>
                    </AccordionSection>

                    {/* Biografia (Full Width at bottom) */}
                    <AccordionSection id="biography" title="Biografia Do Personagem">
                        <Biography character={character} onUpdate={onUpdate} />
                    </AccordionSection>
                </TabsContent>

                {/* @ts-expect-error - ReactNode type mismatch */}
                <TabsContent value="skills" className="mt-0">
                    <SkillsTab character={character} onUpdate={onUpdate} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
