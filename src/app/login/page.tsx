/**
 * OKAR - Page de Connexion v2
 * 
 * Design Dark Luxury avec redirection fiable
 * Utilise router.push() pour éviter le rechargement complet
 */

'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Car, Eye, EyeOff, ArrowRight, AlertTriangle, WifiOff, Clock } from 'lucide-react'
import Link from 'next/link'

// Routes de redirection par rôle
const REDIRECT_ROUTES: Record<string, string> = {
  superadmin: '/dashboard/superadmin',
  garage_certified: '/dashboard/garage',
  garage_pending: '/dashboard/garage',
  driver: '/dashboard/driver',
}

function LoginContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  
  const { login, error, clearError } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl')

  // Gestion du submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setIsSubmitting(true)

    try {
      const result = await login(email, password)
      
      if (result.success && result.user) {
        setIsRedirecting(true)
        
        // Calculer la route de redirection
        const redirectPath = callbackUrl || REDIRECT_ROUTES[result.user.role] || '/'
        
        // Utiliser router.push pour un SPA fluide
        // Petit délai pour s'assurer que les cookies sont bien définis
        setTimeout(() => {
          router.push(redirectPath)
          router.refresh() // Forcer le refresh pour le middleware
        }, 100)
      } else {
        setIsSubmitting(false)
      }
    } catch (err) {
      console.error('Erreur inattendue:', err)
      setIsSubmitting(false)
    }
  }

  // Afficher le loader pendant la redirection
  if (isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-pink-500/20 rounded-full" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-pink-500 rounded-full border-t-transparent animate-spin" />
          </div>
          <span className="text-gray-400 font-medium">Redirection...</span>
        </div>
      </div>
    )
  }

  // Afficher une erreur de type réseau
  const isNetworkError = error?.type === 'network' || error?.type === 'timeout'
  
  // Afficher une erreur de compte en attente
  const isPendingAccount = error?.type === 'pending'

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-700 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/20">
              <Car className="h-8 w-8 text-white" />
            </div>
            <span className="text-3xl font-bold text-white">OKAR</span>
          </Link>
          <p className="mt-2 text-gray-400">Passeport Numérique Automobile</p>
        </div>

        {/* Formulaire */}
        <Card className="bg-[#1E293B]/80 backdrop-blur-md border-white/5 rounded-2xl">
          <CardHeader className="text-center border-b border-white/5">
            <CardTitle className="text-white text-xl">Connexion</CardTitle>
            <CardDescription className="text-gray-400">
              Connectez-vous pour accéder à votre espace
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5 pt-6">
              {/* Erreur réseau */}
              {isNetworkError && (
                <Alert className="bg-amber-500/10 border-amber-500/20 text-amber-400">
                  <WifiOff className="h-4 w-4" />
                  <AlertDescription>{error.message}</AlertDescription>
                </Alert>
              )}
              
              {/* Erreur compte en attente - Message spécial */}
              {isPendingAccount && (
                <Alert className="bg-orange-500/10 border-orange-500/20 text-orange-400">
                  <Clock className="h-4 w-4" />
                  <AlertDescription className="flex flex-col gap-2">
                    <span>{error.message}</span>
                    <Link 
                      href="/pending-validation" 
                      className="text-orange-300 underline hover:text-orange-200 text-sm font-medium"
                    >
                      En savoir plus sur la validation de mon compte
                    </Link>
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Erreur auth standard */}
              {error && !isNetworkError && !isPendingAccount && (
                <Alert className="bg-rose-500/10 border-rose-500/20 text-rose-400">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error.message}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label className="text-gray-300 text-sm">Email</Label>
                <Input
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="h-11 bg-[#0F172A] border-white/10 text-white placeholder:text-gray-500 focus:border-pink-500/50 rounded-xl disabled:opacity-50"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-gray-300 text-sm">Mot de passe</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="h-11 pr-10 bg-[#0F172A] border-white/10 text-white placeholder:text-gray-500 focus:border-pink-500/50 rounded-xl disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white font-semibold rounded-xl disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  <>
                    Se connecter
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
              
              <div className="text-center text-sm text-gray-400">
                Pas encore de compte?{' '}
                <Link href="/register" className="text-pink-400 hover:text-pink-300 font-medium">
                  Créer un compte
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Demo credentials */}
        <div className="bg-[#1E293B]/50 rounded-xl p-4 border border-white/5">
          <p className="text-gray-300 font-medium mb-2 text-center">Comptes de démonstration</p>
          <div className="space-y-1 text-xs font-mono text-gray-400">
            <p><span className="text-pink-400">SuperAdmin:</span> superadmin@okar.sn / admin123</p>
            <p><span className="text-pink-400">Garage:</span> moussa.diop@autodakar.sn / password123</p>
            <p><span className="text-pink-400">Driver:</span> amadou.diouf@email.com / password123</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-pink-500/20 rounded-full" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-pink-500 rounded-full border-t-transparent animate-spin" />
        </div>
        <span className="text-gray-400">Chargement...</span>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginContent />
    </Suspense>
  )
}
