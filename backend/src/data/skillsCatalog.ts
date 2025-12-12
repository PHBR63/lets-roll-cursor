import { SkillAttribute, SkillDefinition } from '../types/ordemParanormal'

export const SKILLS_CATALOG: Record<string, SkillDefinition> = {
    'Acrobacia': { name: 'Acrobacia', attribute: 'AGI', trainedOnly: false, penaltyArmor: true },
    'Adestramento': { name: 'Adestramento', attribute: 'PRE', trainedOnly: true },
    'Artes': { name: 'Artes', attribute: 'PRE', trainedOnly: true },
    'Atletismo': { name: 'Atletismo', attribute: 'FOR', trainedOnly: false },
    'Atualidades': { name: 'Atualidades', attribute: 'INT', trainedOnly: false },
    'Ciências': { name: 'Ciências', attribute: 'INT', trainedOnly: true },
    'Crime': {
        name: 'Crime',
        attribute: 'AGI',
        trainedOnly: true,
        penaltyArmor: true,
        kitItems: ['Ferramentas de Ladrão', 'Kit de Arrombamento']
    },
    'Diplomacia': { name: 'Diplomacia', attribute: 'PRE', trainedOnly: false },
    'Enganação': {
        name: 'Enganação',
        attribute: 'PRE',
        trainedOnly: false,
        kitItems: ['Kit de Disfarce', 'Documentos Falsos']  // Apenas para disfarces, mas vamos simplificar
    },
    'Fortitude': { name: 'Fortitude', attribute: 'VIG', trainedOnly: false },
    'Furtividade': { name: 'Furtividade', attribute: 'AGI', trainedOnly: false, penaltyArmor: true },
    'Iniciativa': { name: 'Iniciativa', attribute: 'AGI', trainedOnly: false },
    'Intimidação': { name: 'Intimidação', attribute: 'PRE', trainedOnly: false },
    'Intuição': { name: 'Intuição', attribute: 'INT', trainedOnly: false },
    'Investigação': { name: 'Investigação', attribute: 'INT', trainedOnly: false },
    'Luta': { name: 'Luta', attribute: 'FOR', trainedOnly: false },
    'Medicina': {
        name: 'Medicina',
        attribute: 'INT',
        trainedOnly: true,
        kitItems: ['Kit de Medicina', 'Primeiros Socorros']
    },
    'Ocultismo': { name: 'Ocultismo', attribute: 'INT', trainedOnly: true },
    'Percepção': { name: 'Percepção', attribute: 'PRE', trainedOnly: false },
    'Pilotagem': { name: 'Pilotagem', attribute: 'AGI', trainedOnly: true },
    'Pontaria': { name: 'Pontaria', attribute: 'AGI', trainedOnly: false },
    'Profissão': { name: 'Profissão', attribute: 'INT', trainedOnly: true },
    'Reflexos': { name: 'Reflexos', attribute: 'AGI', trainedOnly: false },
    'Religião': { name: 'Religião', attribute: 'PRE', trainedOnly: true },
    'Sobrevivência': { name: 'Sobrevivência', attribute: 'INT', trainedOnly: false },
    'Tática': { name: 'Tática', attribute: 'INT', trainedOnly: true },
    'Tecnologia': {
        name: 'Tecnologia',
        attribute: 'INT',
        trainedOnly: true,
        kitItems: ['Kit de Tecnologia', 'Notebook']
    },
    'Vontade': { name: 'Vontade', attribute: 'PRE', trainedOnly: false },
}

export function getSkillDefinition(skillName: string): SkillDefinition | undefined {
    return SKILLS_CATALOG[skillName]
}
