import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { StepIndicator } from '@/components/layout/StepIndicator'
import { BaseRPGStep } from '@/components/wizard/BaseRPGStep'
import { AcquirablesStep } from '@/components/wizard/AcquirablesStep'
import { PersonalitiesStep } from '@/components/wizard/PersonalitiesStep'
import { WizardState } from '@/types/wizard'
import { useAuth } from '@/context/AuthContext'

/**
 * Página de criação de campanha
 * Gerencia o wizard em 3 etapas e integra com API
 */
export function CreateCampaign() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [wizardState, setWizardState] = useState<WizardState>({
    step: 1,
    baseData: {
      title: '',
      description: '',
    },
    acquirables: [
      {
        id: '1',
        name: '',
        properties: ['Ex: Nome', 'Ex: Descrição'],
      },
    ],
    personalities: [
      {
        id: '1',
        name: '',
        bars: [{ title: 'Ex: Energia', type: 'numerico' }],
        properties: ['Ex: Nome', 'Ex: Descrição'],
      },
    ],
  })

  /**
   * Atualiza o estado do wizard
   */
  const updateWizardState = (updates: Partial<WizardState>) => {
    setWizardState((prev) => ({ ...prev, ...updates }))
  }

  /**
   * Navega para próxima etapa
   */
  const handleNext = () => {
    if (wizardState.step < 3) {
      setWizardState((prev) => ({ ...prev, step: (prev.step + 1) as 1 | 2 | 3 }))
    }
  }

  /**
   * Volta para etapa anterior
   */
  const handleBack = () => {
    if (wizardState.step > 1) {
      setWizardState((prev) => ({ ...prev, step: (prev.step - 1) as 1 | 2 | 3 }))
    }
  }

  /**
   * Finaliza o wizard e cria a campanha
   */
  const handleSubmit = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Preparar dados para envio
      const formData = new FormData()
      
      // Dados base
      formData.append('title', wizardState.baseData.title)
      formData.append('description', wizardState.baseData.description)
      formData.append('systemRpg', wizardState.baseData.systemRpg || '')
      
      // Imagem
      if (wizardState.baseData.image) {
        formData.append('image', wizardState.baseData.image)
      }

      // Configurações customizadas
      formData.append(
        'config',
        JSON.stringify({
          acquirables: wizardState.acquirables,
          personalities: wizardState.personalities,
        })
      )

      // Obter token de autenticação
      const { supabase } = await import('@/integrations/supabase/client')
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        throw new Error('Sessão não encontrada')
      }

      // Enviar para API
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'

      const response = await fetch(`${apiUrl}/api/campaigns`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Erro ao criar campanha')
      }

      const campaign = await response.json()
      navigate(`/campaign/${campaign.id}`)
    } catch (error) {
      console.error('Erro ao criar campanha:', error)
      alert('Erro ao criar campanha. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Renderiza a etapa atual do wizard
   */
  const renderCurrentStep = () => {
    switch (wizardState.step) {
      case 1:
        return (
          <BaseRPGStep
            data={wizardState.baseData}
            onChange={(data) =>
              updateWizardState({ baseData: { ...wizardState.baseData, ...data } })
            }
            onNext={handleNext}
          />
        )
      case 2:
        return (
          <AcquirablesStep
            acquirables={wizardState.acquirables}
            onChange={(acquirables) => updateWizardState({ acquirables })}
            onNext={handleNext}
            onBack={handleBack}
          />
        )
      case 3:
        return (
          <PersonalitiesStep
            personalities={wizardState.personalities}
            onChange={(personalities) => updateWizardState({ personalities })}
            onBack={handleBack}
            onSubmit={handleSubmit}
          />
        )
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8 text-center">
            Criador de Mesa de RPG
          </h1>

          <StepIndicator currentStep={wizardState.step} />

          <div className="bg-card border border-card-secondary rounded-lg p-8">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-white">Criando campanha...</div>
              </div>
            ) : (
              renderCurrentStep()
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

