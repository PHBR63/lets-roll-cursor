// @ts-nocheck
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, X, Zap } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

import { Character } from '@/types/character'

/**
 * Painel de poderes paranormais do personagem
 * Permite adquirir e aprimorar poderes (gasta SAN máxima)
 */
interface ParanormalPowersPanelProps {
  character: Character
  onUpdate: () => void
}

interface ParanormalPower {
  id: string
  name: string
  element: string // Elemento paranormal
  level: number // Nível do poder (1-5)
  cost: number // Custo em SAN máxima
  description?: string
  requiresAffinity: boolean // Requer afinidade (50% NEX)
}

// Poderes básicos do sistema (expandido)
const AVAILABLE_POWERS: ParanormalPower[] = [
  // SANGUE
  {
    id: 'power-1',
    name: 'Sangue de Ferro',
    element: 'SANGUE',
    level: 1,
    cost: 2,
    description: 'Aumenta resistência física',
    requiresAffinity: false,
  },
  {
    id: 'power-2',
    name: 'Sangue Fervente',
    element: 'SANGUE',
    level: 2,
    cost: 4,
    description: 'Aumenta força e velocidade',
    requiresAffinity: true,
  },
  {
    id: 'power-3',
    name: 'Lâmina de Sangue',
    element: 'SANGUE',
    level: 3,
    cost: 6,
    description: 'Cria lâminas de sangue',
    requiresAffinity: true,
  },
  {
    id: 'power-4',
    name: 'Regeneração Sanguínea',
    element: 'SANGUE',
    level: 4,
    cost: 8,
    description: 'Regenera PV automaticamente',
    requiresAffinity: true,
  },
  {
    id: 'power-5',
    name: 'Controle Sanguíneo',
    element: 'SANGUE',
    level: 5,
    cost: 10,
    description: 'Controla sangue de outros seres',
    requiresAffinity: true,
  },
  // MORTE
  {
    id: 'power-6',
    name: 'Morte Minguante',
    element: 'MORTE',
    level: 1,
    cost: 2,
    description: 'Drena vida de inimigos',
    requiresAffinity: false,
  },
  {
    id: 'power-7',
    name: 'Toque da Morte',
    element: 'MORTE',
    level: 2,
    cost: 4,
    description: 'Causa dano necrótico',
    requiresAffinity: true,
  },
  {
    id: 'power-8',
    name: 'Espírito Vingativo',
    element: 'MORTE',
    level: 3,
    cost: 6,
    description: 'Invoca espíritos para atacar',
    requiresAffinity: true,
  },
  {
    id: 'power-9',
    name: 'Necromancia',
    element: 'MORTE',
    level: 4,
    cost: 8,
    description: 'Reanima cadáveres permanentemente',
    requiresAffinity: true,
  },
  {
    id: 'power-10',
    name: 'Domínio da Morte',
    element: 'MORTE',
    level: 5,
    cost: 10,
    description: 'Controle total sobre a morte',
    requiresAffinity: true,
  },
  // ENERGIA
  {
    id: 'power-11',
    name: 'Eletrocinese',
    element: 'ENERGIA',
    level: 1,
    cost: 2,
    description: 'Manipula energia elétrica',
    requiresAffinity: false,
  },
  {
    id: 'power-12',
    name: 'Campo Elétrico',
    element: 'ENERGIA',
    level: 2,
    cost: 4,
    description: 'Cria campo elétrico defensivo',
    requiresAffinity: true,
  },
  {
    id: 'power-13',
    name: 'Raio Destrutivo',
    element: 'ENERGIA',
    level: 3,
    cost: 6,
    description: 'Lança raios poderosos',
    requiresAffinity: true,
  },
  // CONHECIMENTO
  {
    id: 'power-14',
    name: 'Telepatia',
    element: 'CONHECIMENTO',
    level: 1,
    cost: 2,
    description: 'Comunicação mental',
    requiresAffinity: false,
  },
  {
    id: 'power-15',
    name: 'Clarividência',
    element: 'CONHECIMENTO',
    level: 2,
    cost: 4,
    description: 'Vê através de obstáculos e tempo',
    requiresAffinity: true,
  },
  {
    id: 'power-16',
    name: 'Controle Mental',
    element: 'CONHECIMENTO',
    level: 3,
    cost: 6,
    description: 'Controla mentes de outros',
    requiresAffinity: true,
  },
  // MEDO
  {
    id: 'power-17',
    name: 'Pesadelo',
    element: 'MEDO',
    level: 1,
    cost: 2,
    description: 'Causa terror em alvos',
    requiresAffinity: false,
  },
  {
    id: 'power-18',
    name: 'Ilusão',
    element: 'MEDO',
    level: 2,
    cost: 4,
    description: 'Cria ilusões assustadoras',
    requiresAffinity: true,
  },
  {
    id: 'power-19',
    name: 'Terror Absoluto',
    element: 'MEDO',
    level: 3,
    cost: 6,
    description: 'Paralisa alvos com medo',
    requiresAffinity: true,
  },
]

export function ParanormalPowersPanel({
  character,
  onUpdate,
}: ParanormalPowersPanelProps) {
  const [powers, setPowers] = useState<ParanormalPower[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedPower, setSelectedPower] = useState<string>('')
  const [upgrading, setUpgrading] = useState<string | null>(null)

  useEffect(() => {
    // Carregar poderes do personagem
    const characterPowers = (character.paranormalPowers || []) as unknown as ParanormalPower[]
    setPowers(characterPowers)
  }, [character])

  /**
   * Adquire poder (gasta SAN máxima)
   */
  const handleAcquirePower = async () => {
    if (!selectedPower || !character?.id) return

    const power = AVAILABLE_POWERS.find((p) => p.id === selectedPower)
    if (!power) return

    // Verificar se requer afinidade
    const hasAffinity = character.affinity === power.element && (character.stats?.nex || 0) >= 50
    if (power.requiresAffinity && !hasAffinity) {
      alert('Este poder requer afinidade com o elemento ' + power.element)
      return
    }

    // Verificar se já tem o poder
    const characterPowers = (character.paranormalPowers || []) as unknown as ParanormalPower[]
    if (characterPowers.some((p) => p.id === power.id)) {
      alert('Você já possui este poder')
      return
    }

    // Calcular nova SAN máxima
    const stats = character.stats || {}
    const san = stats.san || { current: 0, max: 0 }
    const newSanMax = Math.max(0, san.max - (power.cost as number))

    if (newSanMax < san.current) {
      alert('SAN máxima insuficiente. Você precisa reduzir sua SAN atual primeiro.')
      return
    }

    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      
      const updatedPowers = [...characterPowers, { ...power, level: 1 }]
      const updatedStats = {
        ...stats,
        san: {
          current: Math.min(san.current, newSanMax),
          max: newSanMax,
        },
      }

      const response = await fetch(`${apiUrl}/api/characters/${character.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.session.access_token}`,
        },
        body: JSON.stringify({
          paranormalPowers: updatedPowers,
          stats: updatedStats,
        }),
      })

      if (response.ok) {
        setShowAddModal(false)
        setSelectedPower('')
        onUpdate()
      }
    } catch (error) {
      console.error('Erro ao adquirir poder:', error)
      alert('Erro ao adquirir poder. Tente novamente.')
    }
  }

  /**
   * Aprimora poder (gasta SAN máxima novamente)
   */
  const handleUpgradePower = async (powerId: string) => {
    if (!character?.id || upgrading) return

    const characterPowers = (character.paranormalPowers || []) as unknown as ParanormalPower[]
    const power = characterPowers.find((p) => p.id === powerId)
    if (!power) return

    // Verificar se pode aprimorar (requer afinidade e nível < 5)
    const hasAffinity = character.affinity === power.element && (character.stats?.nex || 0) >= 50
    if (!hasAffinity) {
      alert('Aprimorar poderes requer afinidade com o elemento')
      return
    }

    if ((power.level as number) >= 5) {
      alert('Este poder já está no nível máximo')
      return
    }

    // Calcular nova SAN máxima
    const stats = character.stats || {}
    const san = stats.san || { current: 0, max: 0 }
    const newSanMax = Math.max(0, san.max - (power.cost as number))

    if (newSanMax < san.current) {
      alert('SAN máxima insuficiente. Você precisa reduzir sua SAN atual primeiro.')
      return
    }

    setUpgrading(powerId)

    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      
      const updatedPowers = characterPowers.map((p) =>
        p.id === powerId ? { ...p, level: (p.level as number) + 1 } : p
      )
      const updatedStats = {
        ...stats,
        san: {
          current: Math.min(san.current, newSanMax),
          max: newSanMax,
        },
      }

      const response = await fetch(`${apiUrl}/api/characters/${character.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.session.access_token}`,
        },
        body: JSON.stringify({
          paranormalPowers: updatedPowers,
          stats: updatedStats,
        }),
      })

      if (response.ok) {
        onUpdate()
      }
    } catch (error) {
      console.error('Erro ao aprimorar poder:', error)
      alert('Erro ao aprimorar poder. Tente novamente.')
    } finally {
      setUpgrading(null)
    }
  }

  /**
   * Remove poder (não recupera SAN máxima)
   */
  const handleRemovePower = async (powerId: string) => {
    if (!character?.id) return

    if (!confirm('Tem certeza que deseja remover este poder? A SAN máxima não será recuperada.')) {
      return
    }

    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      
      const characterPowers = character.paranormalPowers || []
      const updatedPowers = characterPowers.filter((p) => p.id !== powerId)

      const response = await fetch(`${apiUrl}/api/characters/${character.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.session.access_token}`,
        },
        body: JSON.stringify({
          paranormalPowers: updatedPowers,
        }),
      })

      if (response.ok) {
        onUpdate()
      }
    } catch (error) {
      console.error('Erro ao remover poder:', error)
      alert('Erro ao remover poder. Tente novamente.')
    }
  }

  const characterPowers = character.paranormalPowers || []
  const hasAffinity = character.affinity && (character.stats?.nex || 0) >= 50

  return (
    <div className="bg-card rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Poderes Paranormais</h2>
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Adquirir Poder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adquirir Poder Paranormal</DialogTitle>
              <DialogDescription>
                Adquirir um poder reduz permanentemente sua SAN máxima
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Poder</Label>
                <Select value={selectedPower} onValueChange={setSelectedPower}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um poder" />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_POWERS.filter(
                      (p) => !characterPowers.some((cp) => cp.id === p.id)
                    ).map((power) => (
                      <SelectItem key={power.id} value={power.id}>
                        {power.name} ({(power.cost as number)} SAN máx.)
                        {power.requiresAffinity && ' - Requer Afinidade'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedPower && (
                <div className="p-3 bg-card-secondary rounded-lg">
                  <p className="text-sm text-text-secondary">
                    {AVAILABLE_POWERS.find((p) => p.id === selectedPower)?.description}
                  </p>
                </div>
              )}
              <div className="flex gap-2">
                <Button onClick={handleAcquirePower} disabled={!selectedPower}>
                  Adquirir
                </Button>
                <Button variant="outline" onClick={() => setShowAddModal(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {characterPowers.length === 0 ? (
        <div className="text-muted-foreground text-sm text-center py-4">
          Nenhum poder adquirido
        </div>
      ) : (
        <div className="space-y-3">
          {(characterPowers as unknown as ParanormalPower[]).map((power) => {
            const canUpgrade =
              hasAffinity &&
              character.affinity === power.element &&
              power.level < 5

            return (
              <Card key={power.id} className="p-4 bg-card-secondary">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-white">{power.name}</h3>
                      <Badge variant="outline">Nível {power.level}</Badge>
                      {power.element && (
                        <Badge variant="secondary">{power.element}</Badge>
                      )}
                      {character.affinity === power.element && (
                        <Badge variant="default" className="bg-purple-600">
                          Afinidade
                        </Badge>
                      )}
                    </div>
                    {power.description && (
                      <p className="text-sm text-text-secondary mb-2">{power.description}</p>
                    )}
                    <div className="text-sm text-text-secondary">
                      Custo: <span className="text-blue-400 font-semibold">{(power.cost as number)} SAN máx.</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {canUpgrade && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleUpgradePower(power.id)}
                        disabled={upgrading === power.id}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Zap className="w-4 h-4 mr-1" />
                        {upgrading === power.id ? 'Aprimorando...' : 'Aprimorar'}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemovePower(power.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

