// @ts-nocheck
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Campaign } from '@/types/campaign'

/**
 * Hook compartilhado para gerenciar o modal de criação de personagem
 * Centraliza a lógica de seleção de campanha e navegação
 */
export function useCreateCharacterModal(campaigns: Campaign[] = []) {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuth()

  // Filtrar campanhas onde o usuário pode criar personagem (participando como player)
  const availableCampaigns = useMemo(() => {
    return campaigns.filter(c => c.role === 'player')
  }, [campaigns])

  const openModal = () => {
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
  }

  const handleSelectCampaign = (campaignId: string) => {
    closeModal()
    navigate(`/campaign/${campaignId}/character/create`)
  }

  const handleCreateCampaign = () => {
    closeModal()
    navigate('/campaign/create')
  }

  return {
    isOpen,
    openModal,
    closeModal,
    availableCampaigns,
    hasAvailableCampaigns: availableCampaigns.length > 0,
    handleSelectCampaign,
    handleCreateCampaign,
  }
}

