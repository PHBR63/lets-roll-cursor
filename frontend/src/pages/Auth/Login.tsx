import { useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useToast } from '@/hooks/useToast'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

/**
 * Schema de validação para login
 */
const loginSchema = z.object({
  email: z.string().email('E-mail inválido').min(1, 'E-mail é obrigatório'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

type LoginFormData = z.infer<typeof loginSchema>

/**
 * Página de Login
 * Modal/painel roxo escuro centralizado com tabs "Entrar"/"Registrar-se"
 */
export function Login() {
  const navigate = useNavigate()
  const toast = useToast()
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    // @ts-expect-error - zodResolver type incompatibility with @hookform/resolvers v3.10.0
    resolver: zodResolver(loginSchema),
  })

  // Sincronizar tab ativa com a rota
  useEffect(() => {
    setActiveTab('login')
  }, [])

  /**
   * Função para fazer login
   */
  const onSubmit = async (data: LoginFormData) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) throw error

      toast.success('Login realizado com sucesso!')
      navigate('/dashboard')
    } catch (error: unknown) {
      const err = error as Error
      const errorMessage =
        err.message === 'Invalid login credentials'
          ? 'E-mail ou senha incorretos'
          : err.message || 'Erro ao fazer login'
      toast.error('Erro ao fazer login', errorMessage)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-background border-card-secondary">
        <Tabs value={activeTab} onValueChange={(value) => {
          if (value === 'register') {
            navigate('/register')
          } else {
            setActiveTab(value as 'login' | 'register')
          }
        }} className="w-full">
          <CardHeader>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Registrar-se</TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent>
            <TabsContent value="login" className="mt-0">
              <div className="flex justify-center mb-6">
                <div className="bg-card p-8 rounded-lg border border-card-secondary">
                  <p className="text-white">Logo</p>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    autoComplete="email"
                    {...register('email')}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm animate-in fade-in-50">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...register('password')}
                    className={errors.password ? 'border-red-500' : ''}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm animate-in fade-in-50">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-accent hover:bg-accent/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    'Entrar'
                  )}
                </Button>
              </form>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  )
}

