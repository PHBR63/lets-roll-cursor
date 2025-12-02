/**
 * Footer com informação de desenvolvimento
 * "Desenvolvido por:" + logo "Muu Walkers"
 */
export function Footer() {
  return (
    <footer className="border-t border-card-secondary bg-card/50 backdrop-blur-sm py-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 text-text-secondary">
          <span className="text-sm">Desenvolvido por:</span>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center text-xs">
              🐄
            </div>
            <span className="text-accent-light font-semibold">Muu Walkers</span>
          </div>
        </div>
      </div>
      <div className="h-1 bg-accent-light mt-2" />
    </footer>
  )
}

