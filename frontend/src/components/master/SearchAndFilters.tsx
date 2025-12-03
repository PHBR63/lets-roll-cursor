import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Componente de busca e filtros avançados
 */
interface SearchAndFiltersProps {
  searchValue: string
  onSearchChange: (value: string) => void
  filters?: {
    type?: string
    status?: string
    [key: string]: string | undefined
  }
  onFilterChange: (key: string, value: string) => void
  onClearFilters?: () => void
  placeholder?: string
}

export function SearchAndFilters({
  searchValue,
  onSearchChange,
  filters = {},
  onFilterChange,
  onClearFilters,
  placeholder = 'Buscar...',
}: SearchAndFiltersProps) {
  const hasActiveFilters = searchValue || Object.values(filters).some((v) => v && v !== 'all')

  return (
    <div className="space-y-3">
      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
        <Input
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="bg-input border-white/20 pl-10 pr-10"
        />
        {searchValue && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onSearchChange('')}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {filters.type !== undefined && (
          <Select
            value={filters.type || 'all'}
            onValueChange={(v) => onFilterChange('type', v)}
          >
            <SelectTrigger className="w-[140px] bg-input border-white/20 text-white">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Tipos</SelectItem>
              <SelectItem value="creature">Criatura</SelectItem>
              <SelectItem value="npc">NPC</SelectItem>
            </SelectContent>
          </Select>
        )}

        {filters.status !== undefined && (
          <Select
            value={filters.status || 'all'}
            onValueChange={(v) => onFilterChange('status', v)}
          >
            <SelectTrigger className="w-[140px] bg-input border-white/20 text-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="alive">Vivo</SelectItem>
              <SelectItem value="dying">Morrendo</SelectItem>
              <SelectItem value="unconscious">Inconsciente</SelectItem>
            </SelectContent>
          </Select>
        )}

        {hasActiveFilters && onClearFilters && (
          <Button
            size="sm"
            variant="outline"
            onClick={onClearFilters}
            className="text-xs"
          >
            <X className="w-3 h-3 mr-1" />
            Limpar Filtros
          </Button>
        )}
      </div>
    </div>
  )
}

