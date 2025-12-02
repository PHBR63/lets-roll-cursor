/**
 * Componente Game Board
 * Área central grande para exibir cenário/mapa do RPG
 */
interface GameBoardProps {
  sessionId?: string
}

export function GameBoard({ sessionId }: GameBoardProps) {
  return (
    <div className="flex-1 bg-card-secondary border-b border-card-secondary flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-text-secondary text-lg">
          Cenário do RPG
        </span>
      </div>
      
      {/* Placeholder para futuro: mapa interativo, upload de imagens, etc */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        {/* Botões de controle futuros (zoom, ferramentas) */}
      </div>
    </div>
  )
}

