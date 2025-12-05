import { useState, useMemo } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ALL_RITUALS, Ritual } from '@/data/rituals'
import { Search, Filter, X, Sparkles, Zap, Heart, Skull, BookOpen, Eye, Info } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Informações sobre os elementos do Outro Lado
 */
const ELEMENTS_INFO = {
  SANGUE: {
    name: 'Sangue',
    essence: 'Sentimento',
    characteristics: 'Dor, obsessão, paixão, amor, fome, ódio',
    colors: 'Tons de vermelho',
    phrase: 'Tudo começa pelo Sangue. O Sangue é o fluxo que banha a eternidade do Outro Lado.',
    icon: Heart,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
  },
  MORTE: {
    name: 'Morte',
    essence: 'Tempo',
    characteristics: 'Espirais, repetição, Lodo Preto, distorção temporal',
    colors: 'Preto e tons de cinza',
    phrase: 'Tudo tem um começo e um fim, e o Tempo leva todas as coisas. Nada que é levado pela Morte pode voltar ao que era antes.',
    icon: Skull,
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/30',
  },
  CONHECIMENTO: {
    name: 'Conhecimento',
    essence: 'Consciência',
    characteristics: 'Descobrir, aprender, conhecer, decifrar',
    colors: 'Branco e tons de amarelo',
    phrase: 'Saber tudo é perder tudo.',
    icon: BookOpen,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
  },
  ENERGIA: {
    name: 'Energia',
    essence: 'Caos',
    characteristics: 'Intangível, anarquia, transformação, imprevisibilidade',
    colors: 'Roxo, azul, ciano, rosa, verde',
    phrase: 'O Caos é inevitável.',
    icon: Zap,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
  },
  MEDO: {
    name: 'Medo',
    essence: 'O Outro Lado',
    characteristics: 'Desconhecido, infinito, incompreensível',
    colors: 'Transparente, distorcido',
    phrase: 'O Medo é infinito.',
    icon: Eye,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
  },
  VARIÁVEL: {
    name: 'Variável',
    essence: 'Escolhido ao aprender',
    characteristics: 'Depende do elemento escolhido',
    colors: 'Depende do elemento escolhido',
    phrase: 'O poder se adapta à vontade do ocultista.',
    icon: Sparkles,
    color: 'text-white',
    bgColor: 'bg-white/10',
    borderColor: 'border-white/30',
  },
}

/**
 * Componente para exibir informações sobre um elemento
 */
function ElementInfoCard({ element }: { element: keyof typeof ELEMENTS_INFO }) {
  const info = ELEMENTS_INFO[element]
  const Icon = info.icon

  return (
    <Card className={`${info.bgColor} ${info.borderColor} border`}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Icon className={`w-6 h-6 ${info.color}`} />
          <div>
            <CardTitle className="text-white">{info.name}</CardTitle>
            <CardDescription className="text-text-secondary">{info.essence}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-text-secondary mb-1">Características:</p>
          <p className="text-sm text-white">{info.characteristics}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-text-secondary mb-1">Cores:</p>
          <p className="text-sm text-white">{info.colors}</p>
        </div>
        <div className="pt-2 border-t border-white/10">
          <p className="text-sm italic text-text-secondary">"{info.phrase}"</p>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Componente para exibir detalhes de um ritual
 */
function RitualCard({ ritual }: { ritual: Ritual }) {
  const elementInfo = ELEMENTS_INFO[ritual.element]
  const ElementIcon = elementInfo.icon

  return (
    <Dialog>
      <DialogTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="cursor-pointer"
        >
          <Card className={`${elementInfo.bgColor} ${elementInfo.borderColor} border hover:border-opacity-60 transition-all`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <ElementIcon className={`w-5 h-5 ${elementInfo.color}`} />
                    <CardTitle className="text-white text-lg">{ritual.name}</CardTitle>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">
                      {ritual.circle}º Círculo
                    </Badge>
                    <Badge variant="outline" className={`${elementInfo.color} border-current`}>
                      {elementInfo.name}
                    </Badge>
                    {ritual.isHomebrew && (
                      <Badge variant="outline" className="text-xs bg-orange-500/20 border-orange-500/50 text-orange-400">
                        Homebrew
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Zap className="w-4 h-4 text-green-400" />
                    <span className="text-text-secondary">{ritual.cost.pe} PE</span>
                  </div>
                  {ritual.cost.san && (
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4 text-blue-400" />
                      <span className="text-text-secondary">{ritual.cost.san} SAN</span>
                    </div>
                  )}
                </div>
                <p className="text-text-secondary line-clamp-2">{ritual.description}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <ElementIcon className={`w-6 h-6 ${elementInfo.color}`} />
            <DialogTitle className="text-2xl">{ritual.name}</DialogTitle>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline">{ritual.circle}º Círculo</Badge>
            <Badge variant="outline" className={`${elementInfo.color} border-current`}>
              {elementInfo.name}
            </Badge>
            {ritual.isHomebrew && (
              <Badge variant="outline" className="bg-orange-500/20 border-orange-500/50 text-orange-400">
                Homebrew
              </Badge>
            )}
          </div>
        </DialogHeader>
        <DialogDescription className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold text-text-secondary mb-1">Execução:</p>
              <p className="text-white capitalize">{ritual.execution}</p>
            </div>
            <div>
              <p className="font-semibold text-text-secondary mb-1">Alcance:</p>
              <p className="text-white">{ritual.range}</p>
            </div>
            <div>
              <p className="font-semibold text-text-secondary mb-1">Alvo:</p>
              <p className="text-white">{ritual.target}</p>
            </div>
            <div>
              <p className="font-semibold text-text-secondary mb-1">Duração:</p>
              <p className="text-white">{ritual.duration}</p>
            </div>
            {ritual.resistance && (
              <div>
                <p className="font-semibold text-text-secondary mb-1">Resistência:</p>
                <p className="text-white">{ritual.resistance}</p>
              </div>
            )}
            <div>
              <p className="font-semibold text-text-secondary mb-1">Custo:</p>
              <div className="flex items-center gap-2">
                <span className="text-green-400 font-semibold">{ritual.cost.pe} PE</span>
                {ritual.cost.san && (
                  <span className="text-blue-400 font-semibold">{ritual.cost.san} SAN</span>
                )}
              </div>
            </div>
          </div>

          <div>
            <p className="font-semibold text-text-secondary mb-2">Descrição:</p>
            <p className="text-white leading-relaxed">{ritual.description}</p>
          </div>

          {ritual.requiresIngredients && ritual.ingredients && (
            <div>
              <p className="font-semibold text-text-secondary mb-2">Ingredientes:</p>
              <div className="flex flex-wrap gap-2">
                {ritual.ingredients.map((ingredient, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {ingredient}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {(ritual.discente || ritual.verdadeiro) && (
            <div className="space-y-3 pt-4 border-t border-white/10">
              {ritual.discente && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="bg-blue-500/20 border-blue-500/50">
                      Discente
                    </Badge>
                    <span className="text-sm text-text-secondary">
                      (+{ritual.discente.pe} PE
                      {ritual.discente.requiresCircle && `, requer ${ritual.discente.requiresCircle}º círculo`})
                    </span>
                  </div>
                  <p className="text-white text-sm leading-relaxed">{ritual.discente.description}</p>
                </div>
              )}

              {ritual.verdadeiro && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="bg-purple-500/20 border-purple-500/50">
                      Verdadeiro
                    </Badge>
                    <span className="text-sm text-text-secondary">
                      (+{ritual.verdadeiro.pe} PE
                      {ritual.verdadeiro.requiresCircle && `, requer ${ritual.verdadeiro.requiresCircle}º círculo`}
                      {ritual.verdadeiro.requiresAffinity && ', requer afinidade'}
                      )
                    </span>
                  </div>
                  <p className="text-white text-sm leading-relaxed">{ritual.verdadeiro.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogDescription>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Página principal do Guia de Rituais
 */
export function RitualsGuide() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCircle, setSelectedCircle] = useState<string>('all')
  const [selectedElement, setSelectedElement] = useState<string>('all')
  const [maxCost, setMaxCost] = useState<string>('all')
  const [showHomebrew, setShowHomebrew] = useState<boolean>(true)
  const [showElementsInfo, setShowElementsInfo] = useState(false)

  /**
   * Filtra os rituais baseado nos critérios selecionados
   */
  const filteredRituals = useMemo(() => {
    return ALL_RITUALS.filter((ritual) => {
      // Filtro por busca
      if (searchTerm && !ritual.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !ritual.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }

      // Filtro por círculo
      if (selectedCircle !== 'all' && ritual.circle !== parseInt(selectedCircle)) {
        return false
      }

      // Filtro por elemento
      if (selectedElement !== 'all' && ritual.element !== selectedElement) {
        return false
      }

      // Filtro por custo máximo
      if (maxCost !== 'all') {
        const max = parseInt(maxCost)
        if (ritual.cost.pe > max) {
          return false
        }
      }

      // Filtro por homebrew
      if (!showHomebrew && ritual.isHomebrew) {
        return false
      }

      return true
    })
  }, [searchTerm, selectedCircle, selectedElement, maxCost, showHomebrew])

  /**
   * Agrupa rituais por círculo
   */
  const ritualsByCircle = useMemo(() => {
    const grouped: Record<number, Ritual[]> = {}
    filteredRituals.forEach((ritual) => {
      if (!grouped[ritual.circle]) {
        grouped[ritual.circle] = []
      }
      grouped[ritual.circle].push(ritual)
    })
    return grouped
  }, [filteredRituals])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Guia Completo de Rituais</h1>
          <p className="text-text-secondary text-lg mb-4">
            Ordem Paranormal RPG - Manifestações do poder do Outro Lado
          </p>
          {showHomebrew && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-orange-400 font-semibold mb-1">Aviso sobre Rituais Homebrew</p>
                  <p className="text-text-secondary text-sm">
                    Alguns rituais marcados como "Homebrew" são criações da comunidade e não são oficiais.
                    Eles podem estar desbalanceados e precisar de ajustes. Recomenda-se consultar o mestre antes de usar rituais homebrew em suas campanhas.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Informações sobre os Elementos */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Os Elementos do Outro Lado</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowElementsInfo(!showElementsInfo)}
            >
              <Info className="w-4 h-4 mr-2" />
              {showElementsInfo ? 'Ocultar' : 'Mostrar'} Informações
            </Button>
          </div>
          {showElementsInfo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
            >
              {(Object.keys(ELEMENTS_INFO) as Array<keyof typeof ELEMENTS_INFO>).map((element) => (
                <ElementInfoCard key={element} element={element} />
              ))}
            </motion.div>
          )}
        </div>

        {/* Filtros */}
        <Card className="mb-8 bg-card border-card-secondary">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-accent" />
              <CardTitle>Filtros</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  <Input
                    id="search"
                    placeholder="Nome ou descrição..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="circle">Círculo</Label>
                <Select value={selectedCircle} onValueChange={setSelectedCircle}>
                  <SelectTrigger id="circle">
                    <SelectValue placeholder="Todos os círculos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="1">1º Círculo</SelectItem>
                    <SelectItem value="2">2º Círculo</SelectItem>
                    <SelectItem value="3">3º Círculo</SelectItem>
                    <SelectItem value="4">4º Círculo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="element">Elemento</Label>
                <Select value={selectedElement} onValueChange={setSelectedElement}>
                  <SelectTrigger id="element">
                    <SelectValue placeholder="Todos os elementos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="SANGUE">Sangue</SelectItem>
                    <SelectItem value="MORTE">Morte</SelectItem>
                    <SelectItem value="CONHECIMENTO">Conhecimento</SelectItem>
                    <SelectItem value="ENERGIA">Energia</SelectItem>
                    <SelectItem value="MEDO">Medo</SelectItem>
                    <SelectItem value="VARIÁVEL">Variável</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxCost">Custo Máximo (PE)</Label>
                <Select value={maxCost} onValueChange={setMaxCost}>
                  <SelectTrigger id="maxCost">
                    <SelectValue placeholder="Sem limite" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Sem limite</SelectItem>
                    <SelectItem value="1">1 PE</SelectItem>
                    <SelectItem value="2">2 PE</SelectItem>
                    <SelectItem value="3">3 PE</SelectItem>
                    <SelectItem value="4">4 PE</SelectItem>
                    <SelectItem value="5">5 PE</SelectItem>
                    <SelectItem value="10">10 PE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showHomebrew"
                  checked={showHomebrew}
                  onChange={(e) => setShowHomebrew(e.target.checked)}
                  className="w-4 h-4 rounded border-card-secondary bg-card text-accent focus:ring-accent"
                />
                <Label htmlFor="showHomebrew" className="text-sm font-normal cursor-pointer">
                  Incluir rituais homebrew (criados pela comunidade)
                </Label>
              </div>
              {!showHomebrew && (
                <p className="text-xs text-text-secondary mt-1">
                  Rituais homebrew são criações da comunidade e podem estar desbalanceados. Consulte o mestre antes de usar.
                </p>
              )}
            </div>

            {/* Botão para limpar filtros */}
            {(searchTerm || selectedCircle !== 'all' || selectedElement !== 'all' || maxCost !== 'all' || !showHomebrew) && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedCircle('all')
                    setSelectedElement('all')
                    setMaxCost('all')
                    setShowHomebrew(true)
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Limpar Filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <div className="mb-6">
          <p className="text-text-secondary">
            Mostrando <span className="text-white font-semibold">{filteredRituals.length}</span> de{' '}
            <span className="text-white font-semibold">{ALL_RITUALS.length}</span> rituais
          </p>
        </div>

        {/* Lista de Rituais */}
        {filteredRituals.length === 0 ? (
          <Card className="bg-card border-card-secondary">
            <CardContent className="py-12 text-center">
              <p className="text-text-secondary">Nenhum ritual encontrado com os filtros selecionados.</p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">Todos ({filteredRituals.length})</TabsTrigger>
              {[1, 2, 3, 4].map((circle: number) => (
                <TabsTrigger key={circle} value={`circle-${circle}`} disabled={!ritualsByCircle[circle]}>
                  {circle}º Círculo ({ritualsByCircle[circle]?.length || 0})
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence mode="wait">
                  {filteredRituals.map((ritual: Ritual) => (
                    <motion.div
                      key={ritual.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <RitualCard ritual={ritual} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </TabsContent>

            {[1, 2, 3, 4].map((circle: number) => (
              <TabsContent key={circle} value={`circle-${circle}`} className="space-y-4">
                {ritualsByCircle[circle] ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence mode="wait">
                      {ritualsByCircle[circle].map((ritual: Ritual) => (
                        <motion.div
                          key={ritual.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.2 }}
                        >
                          <RitualCard ritual={ritual} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Card className="bg-card border-card-secondary">
                    <CardContent className="py-12 text-center">
                      <p className="text-text-secondary">Nenhum ritual do {circle}º círculo encontrado.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </main>
      <Footer />
    </div>
  )
}

