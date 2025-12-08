/**
 * Landing Page Let's Roll - Versão Completa
 * Reconstruída conforme proposta de design
 * 7 seções: Hero, Features, Preview, Testimonials, Pricing, CTA Final, Footer
 */
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { BentoCard } from '@/components/ui/bento-grid'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { SpotlightCard } from '@/components/ui/spotlight-card'
import { BorderBeam } from '@/components/ui/border-beam'
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text'
import { NumberTicker } from '@/components/ui/number-ticker'
import { Logo } from '@/components/common/Logo'
import { 
  Crown, 
  Scroll, 
  Dices, 
  Eye, 
  Check, 
  User,
  Gamepad2,
  MessageSquare,
  FileText,
  ArrowRight,
  Quote
} from 'lucide-react'

export function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1A0033] via-[#2A0033] to-[#1A0033]">
      {/* SEÇÃO 1: HERO SECTION */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(128,0,255,0.1),transparent_50%)]" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-2 h-2 bg-[#8000FF] rounded-full animate-pulse" />
          <div className="absolute top-40 right-32 w-1 h-1 bg-[#A855F7] rounded-full animate-pulse delay-300" />
          <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-[#8000FF] rounded-full animate-pulse delay-700" />
        </div>

        {/* Navbar */}
        <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-6 md:p-8">
          <Logo size="md" link={false} />
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" className="text-white hover:text-[#8000FF]">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <ShimmerButton className="px-6 py-2">
                Conecte-se
              </ShimmerButton>
            </Link>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="container mx-auto px-4 md:px-8 pt-32 pb-16 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 animate-fade-in">
            Sua Mesa de RPG,<br />
            <AnimatedGradientText size="4xl" className="block">
              Reinventada.
            </AnimatedGradientText>
          </h1>
          
          <p className="text-lg md:text-xl lg:text-2xl text-[#E0E0E0] max-w-3xl mx-auto mb-8 leading-relaxed">
            Let's Roll é a plataforma definitiva para mestres e jogadores que buscam 
            <span className="text-[#A855F7] font-semibold"> imersão total </span>
            e <span className="text-[#A855F7] font-semibold">controle absoluto</span>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link to="/register">
              <ShimmerButton className="px-8 py-4 text-lg">
                <Dices className="w-5 h-5 mr-2 inline animate-spin-slow" />
                Comece a Aventura (Grátis)
              </ShimmerButton>
            </Link>
            <Button 
              variant="outline" 
              className="px-8 py-4 text-lg border-[#8000FF]/50 text-white hover:bg-[#8000FF]/20"
            >
              Ver Demo
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-[#A855F7] mb-12">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span>Gratuito</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span>Ilimitado</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span>Fácil de usar</span>
            </div>
          </div>

          {/* Dados 3D Placeholder */}
          <div className="relative mt-12 h-64 flex items-center justify-center">
            <div className="grid grid-cols-3 gap-4 opacity-60">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="w-16 h-16 bg-gradient-to-br from-[#8000FF] to-[#A855F7] rounded-lg flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(128,0,255,0.5)] animate-float"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  🎲
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 2: FEATURES */}
      <section className="py-24 px-4 md:px-8 relative">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center mb-4">
            Tudo que Você Precisa para uma Sessão
          </h2>
          <p className="text-xl md:text-2xl text-[#A855F7] text-center mb-16">
            Inesquecível
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SpotlightCard>
              <BentoCard
                name="Mestre no Comando"
                description="Controle total sobre suas sessões com ferramentas poderosas para mestres."
                icon={<Crown className="w-12 h-12" />}
              />
              <BorderBeam />
            </SpotlightCard>
            <SpotlightCard>
              <BentoCard
                name="Fichas Dinâmicas"
                description="Fichas de personagem completas e atualizadas em tempo real."
                icon={<Scroll className="w-12 h-12" />}
              />
              <BorderBeam delay={3.75} />
            </SpotlightCard>
            <SpotlightCard>
              <BentoCard
                name="Dados Integrados"
                description="Sistema de rolagem de dados integrado com histórico completo."
                icon={<Dices className="w-12 h-12" />}
              />
              <BorderBeam delay={7.5} />
            </SpotlightCard>
            <SpotlightCard>
              <BentoCard
                name="Imersão Total"
                description="Chat em tempo real, mapas interativos e muito mais."
                icon={<Eye className="w-12 h-12" />}
              />
              <BorderBeam delay={11.25} />
            </SpotlightCard>
          </div>
        </div>
      </section>

      {/* SEÇÃO 3: PREVIEW DA PLATAFORMA */}
      <section className="py-24 px-4 md:px-8 bg-[#1A0033]/50">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center mb-16">
            Veja a Plataforma em Ação
          </h2>

          {/* Screenshot Principal */}
          <div className="max-w-5xl mx-auto mb-12">
            <div className="relative rounded-lg overflow-hidden border-2 border-[#8000FF]/50 shadow-[0_20px_60px_rgba(128,0,255,0.3)]">
              <div className="aspect-video bg-gradient-to-br from-[#2A2A3A] to-[#1A0033] flex items-center justify-center">
                <div className="text-center">
                  <Gamepad2 className="w-24 h-24 text-[#8000FF] mx-auto mb-4" />
                  <p className="text-white text-xl">Dashboard da Plataforma</p>
                  <p className="text-[#A0A0A0] text-sm mt-2">Screenshot em breve</p>
                </div>
              </div>
            </div>
          </div>

          {/* Screenshots Secundários */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { icon: FileText, title: 'Ficha de Personagem', desc: 'Sistema completo' },
              { icon: Dices, title: 'Rolagem de Dados', desc: 'Integrado e rápido' },
              { icon: MessageSquare, title: 'Chat em Tempo Real', desc: 'Comunicação fluida' },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-[#2A2A3A] rounded-lg p-6 border border-[#8000FF]/20 hover:border-[#8000FF] transition-all hover:scale-105"
              >
                <item.icon className="w-12 h-12 text-[#8000FF] mb-4" />
                <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-[#A0A0A0] text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEÇÃO 4: TESTIMONIALS */}
      <section className="py-24 px-4 md:px-8">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center mb-16">
            O Que os Aventureiros Dizem
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                quote: "Finalmente uma plataforma que entende o que um mestre precisa. O controle sobre as sessões é incrível e meus jogadores nunca estiveram tão engajados.",
                author: "Mestre G.",
                role: "Mestre de RPG há 15 anos",
              },
              {
                quote: "A ficha de personagem é a melhor que já usei. É super fácil de atualizar e ter tudo em um só lugar me ajuda a focar na interpretação.",
                author: "Ana S.",
                role: "Jogadora de D&D",
              },
              {
                quote: "Nosso grupo joga online há anos e o Let's Roll é a primeira plataforma que realmente nos uniu. O chat e a rolagem de dados integrada são perfeitos.",
                author: "Grupo Os Desbravadores",
                role: "Grupo de RPG",
              },
            ].map((testimonial, i) => (
              <div
                key={i}
                className="bg-[#2A2A3A] rounded-lg p-6 border-l-4 border-[#8000FF] relative"
              >
                <Quote className="w-8 h-8 text-[#8000FF] opacity-30 absolute top-4 right-4" />
                <p className="text-[#E0E0E0] mb-6 relative z-10">{testimonial.quote}</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#8000FF] flex items-center justify-center text-white font-bold">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-semibold">{testimonial.author}</p>
                    <p className="text-[#A0A0A0] text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEÇÃO 5: PRICING */}
      <section className="py-24 px-4 md:px-8 bg-[#1A0033]/50">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center mb-16">
            Comece Gratuitamente
          </h2>

          <div className="max-w-lg mx-auto">
            <SpotlightCard className="bg-gradient-to-br from-[#2A2A3A] to-[#1A0033] rounded-lg p-8 border-2 border-[#8000FF] shadow-[0_0_40px_rgba(128,0,255,0.5)] relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-[#8000FF] text-white font-bold text-2xl px-6 py-2 rounded-full animate-pulse">
                  GRÁTIS PARA SEMPRE
                </span>
              </div>

              <div className="mt-8 space-y-4">
                {[
                  'Campanhas Ilimitadas',
                  'Jogadores Ilimitados',
                  'Fichas Completas',
                  'Chat em Tempo Real',
                  'Rolagem de Dados',
                  'Bestiário e Itens',
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Check className="w-6 h-6 text-[#00FF00] flex-shrink-0" />
                    <span className="text-white text-lg">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Link to="/register" className="block">
                  <ShimmerButton className="w-full py-4 text-lg" variant="primary" constantShimmer>
                    Criar Conta Grátis
                  </ShimmerButton>
                </Link>
              </div>
            </SpotlightCard>
            <div className="group relative mt-4">
              <BorderBeam size={200} duration={20} />
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 6: CTA FINAL */}
      <section className="py-24 px-4 md:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(128,0,255,0.2),transparent_70%)]" />
        <div className="container mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Pronto para Rolar os Dados?
          </h2>
          <p className="text-lg md:text-xl text-[#E0E0E0] max-w-2xl mx-auto mb-8">
            Crie sua conta gratuita e comece a construir sua próxima grande aventura. 
            Convide seus amigos e jogue em minutos.
          </p>
          <Link to="/register">
            <ShimmerButton className="px-12 py-6 text-xl mb-4">
              <Dices className="w-6 h-6 mr-2 inline animate-spin-slow" />
              Criar Minha Campanha Agora
            </ShimmerButton>
          </Link>
          <p className="text-[#A0A0A0] text-sm">
            Sem cartão de crédito • Sem instalação
          </p>
        </div>
      </section>

      {/* SEÇÃO 7: FOOTER */}
      <footer className="bg-[#1A0033] border-t border-[#8000FF] py-12 px-4 md:px-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <Logo size="md" link={false} />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-[#A0A0A0]">
                <li><a href="#" className="hover:text-[#8000FF] transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-[#8000FF] transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-[#8000FF] transition-colors">Roadmap</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2 text-[#A0A0A0]">
                <li><a href="#" className="hover:text-[#8000FF] transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-[#8000FF] transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-[#8000FF] transition-colors">Discord</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-[#A0A0A0]">
                <li><a href="#" className="hover:text-[#8000FF] transition-colors">Termos</a></li>
                <li><a href="#" className="hover:text-[#8000FF] transition-colors">Privacidade</a></li>
                <li><a href="#" className="hover:text-[#8000FF] transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#8000FF]/20 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-[#A0A0A0] text-sm mb-4 md:mb-0">
              © 2024 Let's Roll • Desenvolvido por Muu Walkers
            </p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#8000FF] rounded-full flex items-center justify-center text-lg">
                🐄
              </div>
              <div className="flex flex-col">
                <span className="text-[#A855F7] font-semibold text-sm leading-tight">Muu</span>
                <span className="text-[#8000FF] font-bold text-sm leading-tight">WALKERS</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
