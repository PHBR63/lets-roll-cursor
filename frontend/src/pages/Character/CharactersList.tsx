// @ts-nocheck
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/common/EmptyState'
import { User, Plus, ArrowRight, Trash2, Edit } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { Character } from '@/types/character'
import { Campaign } from '@/types/campaign'
import { getApiBaseUrl } from '@/utils/apiUrl'
import { useApiError } from '@/hooks/useApiError'
import { useCreateCharacterModal } from '@/hooks/useCreateCharacterModal'
import { CreateCharacterModal } from '@/components/character/CreateCharacterModal'
import { SEOHead } from '@/components/common/SEOHead'
import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog'
import { useToast } from '@/hooks/useToast'

/**
 * Página de listagem de todos os personagens do usuário
 */
export function CharactersList() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [characters, setCharacters] = useState<Character[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [characterToDelete, setCharacterToDelete] = useState<Character | null>(null)
  const [deleting, setDeleting] = useState(false)
  const { handleErrorWithToast, handleResponseError } = useApiError()
  const toast = useToast()

  // Hook compartilhado para modal de criação de personagem
  const createCharacterModal = useCreateCharacterModal(campaigns)

  useEffect(() => {
    if (user) {
      Promise.all([loadCharacters(), loadCampaigns()]).finally(() => {
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [user])

  /**
   * Carrega campanhas do usuário
   */
  const loadCampaigns = async () => {
    if (!user) return

    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = getApiBaseUrl()
      const response = await fetch(`${apiUrl}/api/campaigns`, {
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setCampaigns(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      // Silenciosamente falha se não conseguir carregar campanhas
      console.warn('Erro ao carregar campanhas:', error)
      setCampaigns([])
    }
  }

  /**
   * Carrega todos os personagens do usuário
   */
  const loadCharacters = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) {
        setLoading(false)
        return
      }

      const apiUrl = getApiBaseUrl()
      const response = await fetch(`${apiUrl}/api/characters?userId=${user.id}`, {
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      })

      if (!response.ok) {
        await handleResponseError(response, 'Erro ao carregar personagens')
        setCharacters([])
        return
      }

      const data = await response.json()
      setCharacters(Array.isArray(data) ? data : [])
    } catch (error) {
      if (error instanceof TypeError && (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_REFUSED'))) {
        console.warn('Backend não está disponível.')
        setCharacters([])
      } else {
        handleErrorWithToast(error, 'Erro ao carregar personagens')
        setCharacters([])
      }
    }
  }

  /**
   * Handler para deletar personagem
   */
  const handleDeleteCharacter = async () => {
    if (!characterToDelete || !user) return

    setDeleting(true)
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = getApiBaseUrl()
      const response = await fetch(`${apiUrl}/api/characters/${characterToDelete.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      })

      if (!response.ok) {
        await handleResponseError(response, 'Erro ao deletar personagem')
        return
      }

      toast.success('Personagem deletado', `${characterToDelete.name} foi removido com sucesso.`)
      setCharacterToDelete(null)
      loadCharacters()
    } catch (error) {
      handleErrorWithToast(error, 'Erro ao deletar personagem')
    } finally {
      setDeleting(false)
    }
  }

  /**
   * Abre dialog de confirmação de exclusão
   */
  const openDeleteDialog = (character: Character, e: React.MouseEvent) => {
    e.stopPropagation() // Prevenir navegação ao clicar no botão
    setCharacterToDelete(character)
    setDeleteDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Carregando personagens...</div>
      </div>
    )
  }

  const baseUrl = import.meta.env.VITE_APP_URL || 'https://lets-roll.vercel.app'

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Meus Personagens - Gerenciar Fichas | Let's Roll"
        description="Gerencie todos os seus personagens de RPG em um só lugar. Visualize fichas completas, atributos, perícias e estatísticas do sistema Ordem Paranormal."
        keywords="meus personagens, gerenciar personagens RPG, fichas de personagem, personagens Ordem Paranormal, lista de personagens"
        canonical={`${baseUrl}/characters`}
        ogTitle="Meus Personagens - Gerenciar Fichas"
        ogDescription="Gerencie todos os seus personagens de RPG em um só lugar."
        noindex={true}
      />
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-4 md:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Meus Personagens
            </h1>
            <p className="text-text-secondary">
              Gerencie todos os seus personagens em um só lugar
            </p>
          </div>
          <Button
            onClick={createCharacterModal.openModal}
            className="bg-accent hover:bg-accent/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar Personagem
          </Button>
        </div>

        {/* Lista de Personagens */}
        {characters.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.map((character) => (
              <div
                key={character.id}
                className="bg-card border border-card-secondary rounded-lg p-6 hover:border-accent transition-all hover:shadow-lg hover:shadow-accent/20"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => navigate(`/character/${character.id}`)}
                  >
                    <h3 className="text-white font-bold text-xl mb-2">
                      {character.name}
                    </h3>
                    {character.class && (
                      <p className="text-accent text-sm font-medium mb-1">
                        {character.class}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/character/${character.id}`)
                      }}
                      className="h-8 w-8 p-0 text-text-secondary hover:text-white hover:bg-accent/20"
                      title="Ver detalhes"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => openDeleteDialog(character, e)}
                      className="h-8 w-8 p-0 text-destructive hover:bg-destructive/20"
                      title="Deletar personagem"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Stats */}
                <div
                  className="grid grid-cols-3 gap-3 mb-4 cursor-pointer"
                  onClick={() => navigate(`/character/${character.id}`)}
                >
                  {character.stats?.pv && (
                    <div className="bg-card-secondary rounded p-2">
                      <div className="text-xs text-text-secondary mb-1">PV</div>
                      <div className="text-white font-semibold">
                        {character.stats.pv.current}/{character.stats.pv.max}
                      </div>
                    </div>
                  )}
                  {character.stats?.san && (
                    <div className="bg-card-secondary rounded p-2">
                      <div className="text-xs text-text-secondary mb-1">SAN</div>
                      <div className="text-white font-semibold">
                        {character.stats.san.current}/{character.stats.san.max}
                      </div>
                    </div>
                  )}
                  {character.stats?.pe && (
                    <div className="bg-card-secondary rounded p-2">
                      <div className="text-xs text-text-secondary mb-1">PE</div>
                      <div className="text-white font-semibold">
                        {character.stats.pe.current}/{character.stats.pe.max}
                      </div>
                    </div>
                  )}
                </div>

                {/* Informações Adicionais */}
                <div
                  className="space-y-1 text-sm cursor-pointer"
                  onClick={() => navigate(`/character/${character.id}`)}
                >
                  {character.stats?.nex && (
                    <p className="text-text-secondary">
                      <span className="text-white font-medium">NEX:</span> {character.stats.nex}%
                    </p>
                  )}
                  {character.origin && (
                    <p className="text-text-secondary">
                      <span className="text-white font-medium">Origem:</span> {character.origin}
                    </p>
                  )}
                  {character.campaign && (
                    <p className="text-text-secondary">
                      <span className="text-white font-medium">Campanha:</span> {character.campaign.name}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<User className="w-12 h-12 text-text-secondary" />}
            title="Nenhum personagem encontrado"
            description="Você ainda não criou nenhum personagem. Crie um para começar suas aventuras!"
            action={{
              label: '+ Criar Personagem',
              onClick: createCharacterModal.openModal,
            }}
          />
        )}
      </main>

      {/* Modal para selecionar campanha e criar personagem */}
      <CreateCharacterModal
        open={createCharacterModal.isOpen}
        onOpenChange={createCharacterModal.closeModal}
        availableCampaigns={createCharacterModal.availableCampaigns}
        onSelectCampaign={createCharacterModal.handleSelectCampaign}
        onCreateCampaign={createCharacterModal.handleCreateCampaign}
      />

      {/* Dialog de confirmação de exclusão */}
      {characterToDelete && (
        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteCharacter}
          title="Deletar Personagem"
          description={`Tem certeza que deseja deletar o personagem "${characterToDelete.name}"? Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos.`}
          confirmLabel="Deletar Personagem"
          loading={deleting}
        />
      )}

      <Footer />
    </div>
  )
}

