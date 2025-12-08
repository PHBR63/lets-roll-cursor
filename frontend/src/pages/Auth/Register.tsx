import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useToast } from '@/hooks/useToast'
import { Loader2 } from 'lucide-react'
import { Logo } from '@/components/common/Logo'

/**
 * Schema de validação para registro
 */
const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Usuário deve ter no mínimo 3 caracteres')
      .max(20, 'Usuário deve ter no máximo 20 caracteres')
      .regex(/^[a-zA-Z0-9_]+$/, 'Usuário pode conter apenas letras, números e _'),
    email: z.string().email('E-mail inválido').min(1, 'E-mail é obrigatório'),
    password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
    confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

type RegisterFormData = z.infer<typeof registerSchema>

/**
 * Página de Registro
 * Similar ao login, com campos adicionais
 */
export function Register() {
  const navigate = useNavigate()
  const toast = useToast()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    // @ts-expect-error - zodResolver type incompatibility with @hookform/resolvers v3.10.0
    resolver: zodResolver(registerSchema),
  })

  /**
   * Função para criar conta
   */
  const onSubmit = async (data: RegisterFormData) => {
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            username: data.username,
          },
        },
      })

      if (error) throw error

      toast.success('Conta criada com sucesso!')
      navigate('/dashboard')
    } catch (error: unknown) {
      const err = error as Error
      const errorMessage =
        err.message === 'User already registered'
          ? 'Este e-mail já está cadastrado'
          : err.message || 'Erro ao criar conta'
      toast.error('Erro ao criar conta', errorMessage)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-background border-card-secondary">
        <CardHeader>
          <Tabs defaultValue="register" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">
                <Link to="/login">Entrar</Link>
              </TabsTrigger>
              <TabsTrigger value="register">Registrar-se</TabsTrigger>
            </TabsList>

            <TabsContent value="register">
              <div className="flex justify-center mb-6">
                <Logo size="md" link={false} />
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Usuário</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="seu_usuario"
                    {...register('username')}
                    className={errors.username ? 'border-red-500' : ''}
                  />
                  {errors.username && (
                    <p className="text-red-500 text-sm animate-in fade-in-50">
                      {errors.username.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
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
                    {...register('password')}
                    className={errors.password ? 'border-red-500' : ''}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm animate-in fade-in-50">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    {...register('confirmPassword')}
                    className={errors.confirmPassword ? 'border-red-500' : ''}
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm animate-in fade-in-50">
                      {errors.confirmPassword.message}
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
                      Criando conta...
                    </>
                  ) : (
                    'Criar Conta'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>
    </div>
  )
}

