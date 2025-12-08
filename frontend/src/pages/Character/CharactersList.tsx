// @ts-nocheck
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/common/EmptyState'
import { User, Plus, ArrowRight } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { Character } from '@/types/character'
import { getApiBaseUrl } from '@/utils/apiUrl'
import { useApiError } from '@/hooks/useApiError'

/**
 * Página de listagem de todos os personagens do usuário
 */
export function CharactersList() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  const { handleErrorWithToast, handleResponseError } = useApiError()

  useEffect(() => {
    if (user) {
      loadCharacters()
    } else {
      setLoading(false)
    }
  }, [user])

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
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Carregando personagens...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
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
            onClick={() => navigate('/dashboard')}
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
                onClick={() => navigate(`/character/${character.id}`)}
                className="bg-card border border-card-secondary rounded-lg p-6 cursor-pointer hover:border-accent transition-all hover:shadow-lg hover:shadow-accent/20"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-xl mb-2">
                      {character.name}
                    </h3>
                    {character.class && (
                      <p className="text-accent text-sm font-medium mb-1">
                        {character.class}
                      </p>
                    )}
                  </div>
                  <ArrowRight className="w-5 h-5 text-text-secondary flex-shrink-0" />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
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
                <div className="space-y-1 text-sm">
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
            description="Você ainda não criou nenhum personagem. Para criar um personagem, você precisa estar participando de uma campanha."
            action={{
              label: 'Ver Campanhas',
              onClick: () => navigate('/dashboard'),
            }}
          />
        )}
      </main>

      <Footer />
    </div>
  )
}

