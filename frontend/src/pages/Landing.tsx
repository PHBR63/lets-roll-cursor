import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid'
import { User, Crown, ScrollText, Dices, Eye, Check, ArrowRight, Quote } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useEffect, useState } from 'react'
import { Vortex } from '@/components/ui/vortex'
import { Footer } from '@/components/layout/Footer'
import { motion } from 'framer-motion'

/**
 * Landing Page completa conforme proposta
 * 7 seções: Hero, Features, Preview, Testimonials, Pricing, CTA Final, Footer
 */
export function Landing() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [isClient, setIsClient] = useState(false)

  // Detectar se está no cliente
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Redirecionar usuários autenticados para o dashboard
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, loading, navigate])

  // Parallax scroll para screenshot principal
  useEffect(() => {
    if (!isClient) return
    
    const handleScroll = () => {
      const scrolled = window.scrollY
      const screenshot = document.querySelector('[data-parallax]')
      if (screenshot) {
        (screenshot as HTMLElement).style.setProperty('--scroll-y', `${scrolled * 0.5}px`)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isClient])

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    )
  }

  // Se usuário estiver autenticado, não renderizar nada (será redirecionado)
  if (user) {
    return null
  }

  return (
    <div className="min-h-screen">
      <Vortex
        className="fixed inset-0 z-0"
        containerClassName="min-h-screen"
        particleCount={150}
        rangeY={800}
        baseHue={270}
        baseSpeed={0.0}
        rangeSpeed={1.5}
        baseRadius={1}
        rangeRadius={2}
        backgroundColor="hsl(271, 100%, 10%)"
      >
        <div className="relative z-10">
          {/* SEÇÃO 1: HERO */}
          <section className="min-h-screen flex flex-col items-center justify-center px-4 py-20 relative">
            {/* Navbar simples */}
            <nav className="absolute top-0 left-0 right-0 z-20 p-4 md:p-6">
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link to="/">
                  <div className="bg-[#2A2A3A] px-4 py-2 rounded-lg border border-[#8000FF]/20 hover:border-[#8000FF] transition-colors">
                    <span className="text-white font-bold text-lg">Let's Roll</span>
                  </div>
                </Link>
                <div className="flex items-center gap-3">
                  <Link to="/login">
                    <Button variant="ghost" className="text-white hover:bg-[#8000FF]/20">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="outline" className="bg-[#2A2A3A]/80 backdrop-blur-sm text-white border-[#8000FF]/20 hover:bg-[#8000FF] hover:text-white flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Conecte-se
                    </Button>
                  </Link>
                </div>
              </div>
            </nav>

            {/* Conteúdo Hero */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto text-center space-y-8 mt-20"
            >
              <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
                Sua Mesa de RPG,<br />
                <span className="text-[#8000FF]">Reinventada.</span>
              </h1>
              
              <p className="text-2xl text-[#E0E0E0] max-w-2xl mx-auto leading-relaxed">
                Let's Roll é a plataforma definitiva para mestres e jogadores que buscam imersão total e controle absoluto.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link to="/register">
                  <Button variant="shimmer" size="lg" className="text-lg px-8 py-6">
                    Comece a Aventura (Grátis)
                    <Dices className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="outline" size="lg" className="text-lg px-8 py-6 border-[#8000FF]/40 text-white hover:bg-[#8000FF]/20">
                    Ver Demo
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
                <div className="flex items-center gap-2 text-[#A855F7] text-base">
                  <Check className="w-5 h-5" />
                  <span>Gratuito</span>
                </div>
                <div className="flex items-center gap-2 text-[#A855F7] text-base">
                  <Check className="w-5 h-5" />
                  <span>Ilimitado</span>
                </div>
                <div className="flex items-center gap-2 text-[#A855F7] text-base">
                  <Check className="w-5 h-5" />
                  <span>Fácil de usar</span>
                </div>
              </div>
            </motion.div>

            {/* Imagem de Dados 3D Animados - Centro-inferior */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10"
            >
              <div className="relative">
                <div className="flex items-center gap-4">
                  {[20, 12, 10, 8, 6, 4].map((sides, index) => (
                    <motion.div
                      key={sides}
                      animate={{ 
                        rotate: [0, 360],
                        y: [0, -10, 0]
                      }}
                      transition={{
                        duration: 3 + index * 0.5,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                      className="w-12 h-12 md:w-16 md:h-16 bg-[#8000FF] rounded-lg flex items-center justify-center text-white font-bold text-xs md:text-sm shadow-[0_0_20px_rgba(128,0,255,0.5)]"
                    >
                      D{sides}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </section>

          {/* SEÇÃO 2: FEATURES */}
          <section className="py-20 px-4 bg-[#1A0033]/50">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Tudo que Você Precisa para uma Sessão<br />
                  <span className="text-[#8000FF]">Inesquecível</span>
                </h2>
              </motion.div>

              <BentoGrid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    icon: <Crown className="w-12 h-12 text-[#8000FF]" style={{ filter: 'drop-shadow(0 0 8px rgba(128,0,255,0.5))' }} />,
                    title: "Mestre no Comando",
                    description: "Controle total sobre suas sessões com ferramentas poderosas para gerenciar criaturas, NPCs e o fluxo da narrativa."
                  },
                  {
                    icon: <ScrollText className="w-12 h-12 text-[#8000FF]" style={{ filter: 'drop-shadow(0 0 8px rgba(128,0,255,0.5))' }} />,
                    title: "Fichas Dinâmicas",
                    description: "Fichas de personagem completas e atualizáveis em tempo real, com cálculos automáticos de atributos e recursos."
                  },
                  {
                    icon: <Dices className="w-12 h-12 text-[#8000FF]" style={{ filter: 'drop-shadow(0 0 8px rgba(128,0,255,0.5))' }} />,
                    title: "Dados Integrados",
                    description: "Sistema de rolagem de dados integrado com histórico completo, suporte a múltiplos tipos de rolagem e resultados em tempo real."
                  },
                  {
                    icon: <Eye className="w-12 h-12 text-[#8000FF]" style={{ filter: 'drop-shadow(0 0 8px rgba(128,0,255,0.5))' }} />,
                    title: "Imersão Total",
                    description: "Chat em tempo real, mapas interativos e recursos visuais que transportam seus jogadores para dentro da aventura."
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <BentoCard
                      className="h-full p-8"
                      icon={feature.icon}
                      name={feature.title}
                      description={feature.description}
                    />
                  </motion.div>
                ))}
              </BentoGrid>
            </div>
          </section>

          {/* SEÇÃO 3: PREVIEW */}
          <section className="py-20 px-4">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Veja a Plataforma em <span className="text-[#8000FF]">Ação</span>
                </h2>
              </motion.div>

              {/* Screenshot Principal */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mb-12"
                data-parallax
                style={{ 
                  transform: 'translateY(var(--scroll-y, 0px))',
                  transition: 'transform 0.1s ease-out'
                }}
              >
                <div className="bg-[#2A2A3A] border-2 border-[#8000FF]/30 rounded-lg p-4 shadow-[0_20px_60px_rgba(128,0,255,0.3)]">
                  <div className="aspect-video bg-gradient-to-br from-[#1A0033] to-[#2A2A3A] rounded flex items-center justify-center">
                    <div className="text-center">
                      <Dices className="w-16 h-16 text-[#8000FF] mx-auto mb-4" />
                      <p className="text-white text-lg">Dashboard da Plataforma</p>
                      <p className="text-[#A0A0A0] text-sm mt-2">Screenshot será adicionado aqui</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Screenshots Secundários */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { title: "Ficha de Personagem", description: "Interface completa e intuitiva", icon: <ScrollText className="w-8 h-8 text-[#8000FF]" /> },
                  { title: "Rolagem de Dados", description: "Sistema integrado e histórico", icon: <Dices className="w-8 h-8 text-[#8000FF]" /> },
                  { title: "Chat em Tempo Real", description: "Comunicação instantânea", icon: <Eye className="w-8 h-8 text-[#8000FF]" /> }
                ].map((preview, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className="overflow-hidden rounded-lg"
                  >
                    <BentoCard
                      className="h-64"
                      name={preview.title}
                      description={preview.description}
                      icon={preview.icon}
                      backgroundImage={undefined}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* SEÇÃO 4: TESTIMONIALS */}
          <section className="py-20 px-4 bg-[#1A0033]/50">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  O Que os <span className="text-[#8000FF]">Aventureiros</span> Dizem
                </h2>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    quote: "Finalmente uma plataforma que entende o que um mestre precisa. O controle sobre as sessões é incrível e meus jogadores nunca estiveram tão engajados.",
                    author: "Mestre G.",
                    role: "Mestre de RPG há 15 anos"
                  },
                  {
                    quote: "A ficha de personagem é a melhor que já usei. É super fácil de atualizar e ter tudo em um só lugar me ajuda a focar na interpretação.",
                    author: "Ana S.",
                    role: "Jogadora de D&D"
                  },
                  {
                    quote: "Nosso grupo joga online há anos e o Let's Roll é a primeira plataforma que realmente nos uniu. O chat e a rolagem de dados integrada são perfeitos.",
                    author: "Grupo Os Desbravadores",
                    role: "Grupo de RPG"
                  }
                ].map((testimonial, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <div className="bg-[#2A2A3A] border-l-4 border-[#8000FF] p-6 rounded-lg h-full">
                      <Quote className="w-8 h-8 text-[#8000FF] opacity-30 mb-4" />
                      <p className="text-white mb-4 leading-relaxed text-base">{testimonial.quote}</p>
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-[#8000FF] border-2 border-[#8000FF] flex items-center justify-center text-white font-bold text-xl">
                          {testimonial.author.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white font-semibold">{testimonial.author}</p>
                          <p className="text-[#A0A0A0] text-sm">{testimonial.role}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* SEÇÃO 5: PRICING */}
          <section className="py-20 px-4">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Comece <span className="text-[#8000FF]">Gratuitamente</span>
                </h2>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="max-w-lg mx-auto"
              >
                <div className="bg-gradient-to-b from-[#2A2A3A] to-[#1A0033] border-2 border-[#8000FF] rounded-lg p-8 shadow-[0_0_40px_rgba(128,0,255,0.3)]">
                  <div className="text-center mb-8">
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="inline-block bg-[#8000FF] px-6 py-2 rounded-full mb-4"
                    >
                      <span className="text-white font-bold text-2xl">GRÁTIS PARA SEMPRE</span>
                    </motion.div>
                  </div>

                  <div className="space-y-4 mb-8">
                    {[
                      "Campanhas Ilimitadas",
                      "Jogadores Ilimitados",
                      "Fichas Completas",
                      "Chat em Tempo Real",
                      "Rolagem de Dados",
                      "Bestiário e Itens"
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-[#00FF00] flex-shrink-0" />
                        <span className="text-white text-lg">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Link to="/register" className="block">
                    <Button variant="shimmer" className="w-full text-lg py-6">
                      Criar Conta Grátis
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </section>

          {/* SEÇÃO 6: CTA FINAL */}
          <section className="py-20 px-4 bg-gradient-to-b from-[#1A0033] to-[#2A0033] relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(128,0,255,0.3),transparent)]" />
            
            {/* Partículas de dados flutuando */}
            {isClient && (
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-[#8000FF] opacity-20"
                    initial={{ 
                      x: Math.random() * window.innerWidth,
                      y: window.innerHeight + 50,
                      rotate: 0
                    }}
                    animate={{
                      y: -50,
                      rotate: 360,
                      x: Math.random() * window.innerWidth
                    }}
                    transition={{
                      duration: 10 + Math.random() * 5,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    style={{ fontSize: '2rem' }}
                  >
                    <Dices className="w-8 h-8" />
                  </motion.div>
                ))}
              </div>
            )}

            <div className="max-w-4xl mx-auto text-center relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                <h2 className="text-3xl md:text-5xl font-bold text-white">
                  Pronto para <span className="text-[#8000FF]">Rolar os Dados?</span>
                </h2>
                <p className="text-xl text-[#E0E0E0] max-w-2xl mx-auto">
                  Crie sua conta gratuita e comece a construir sua próxima grande aventura. Convide seus amigos e jogue em minutos.
                </p>
                <Link to="/register">
                  <Button variant="shimmer" size="lg" className="text-xl px-12 py-8 shadow-[0_0_40px_rgba(128,0,255,0.5)]">
                    Criar Minha Campanha Agora
                    <Dices className="w-6 h-6 ml-3 animate-[spin_3s_linear_infinite]" />
                  </Button>
                </Link>
                <p className="text-[#A0A0A0] text-sm">
                  Sem cartão de crédito • Sem instalação
                </p>
              </motion.div>
            </div>
          </section>

          {/* SEÇÃO 7: FOOTER */}
          <Footer />
        </div>
      </Vortex>
    </div>
  )
}
