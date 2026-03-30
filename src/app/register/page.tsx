/**
 * OKAR - Page d'Inscription
 * 
 * Permet l'inscription pour:
 * - Drivers (compte en attente de validation)
 * - Garages (compte en attente de validation)
 * 
 * TOUS les comptes nécessitent une validation par le SuperAdmin.
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Car, Eye, EyeOff, ArrowRight, CheckCircle2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { BackToHomeButton } from '@/components/okar/BackToHomeButton'

export default function RegisterPage() {
  const [accountType, setAccountType] = useState<'driver' | 'garage'>('driver')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Garage-specific fields
  const [businessName, setBusinessName] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Validation
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }
    
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }
    
    if (accountType === 'garage' && (!businessName || !address || !city)) {
      setError('Veuillez remplir toutes les informations du garage')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email,
          password,
          name,
          phone,
          role: accountType === 'garage' ? 'garage_pending' : 'driver',
          garageInfo: accountType === 'garage' ? {
            businessName,
            address,
            city,
            phone,
          } : undefined,
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSuccess(true)
        // Rediriger vers la page d'attente de validation
        setTimeout(() => {
          router.push('/pending-validation')
        }, 2000)
      } else {
        setError(data.error || 'Erreur lors de l\'inscription')
      }
    } catch (err) {
      setError('Une erreur inattendue s\'est produite')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-pink-50 to-blue-50 p-4">
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Inscription réussie!</h2>
            <p className="text-gray-600">
              Votre compte est en attente de validation par notre équipe. 
              Vous serez redirigé vers la page de confirmation...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-pink-50 to-blue-50 p-4">
      <div className="w-full max-w-lg space-y-8">
        {/* Back to home */}
        <div className="text-left">
          <BackToHomeButton />
        </div>
        
        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 via-pink-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Car className="h-8 w-8 text-white" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              OKAR
            </span>
          </Link>
          <p className="mt-2 text-gray-600">Créez votre compte OKAR</p>
        </div>

        {/* Formulaire */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Inscription</CardTitle>
            <CardDescription>
              Choisissez le type de compte qui vous correspond
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* Sélecteur de type de compte */}
              <Tabs value={accountType} onValueChange={(v) => setAccountType(v as 'driver' | 'garage')} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="driver">Propriétaire</TabsTrigger>
                  <TabsTrigger value="garage">Garage</TabsTrigger>
                </TabsList>
              </Tabs>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Champs communs */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet</Label>
                  <Input
                    id="name"
                    placeholder="Jean Dupont"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    placeholder="+221 77 123 45 67"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Champs garage */}
              {accountType === 'garage' && (
                <div className="space-y-4 pt-4 border-t">
                  <p className="text-sm text-gray-600">Informations du garage</p>
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Nom du garage</Label>
                    <Input
                      id="businessName"
                      placeholder="Auto Service Express"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Adresse</Label>
                    <Input
                      id="address"
                      placeholder="123 Avenue Cheikh Anta Diop"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Ville</Label>
                    <Input
                      id="city"
                      placeholder="Dakar"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 via-pink-500 to-blue-500 hover:from-orange-600 hover:via-pink-600 hover:to-blue-600 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Inscription...
                  </>
                ) : (
                  <>
                    Créer mon compte
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
              
              <div className="text-center text-sm text-gray-600">
                Déjà un compte?{' '}
                <Link href="/login" className="text-orange-600 hover:text-orange-700 font-medium">
                  Se connecter
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
