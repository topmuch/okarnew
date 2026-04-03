'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Shield, Eye, EyeOff, Loader2, AlertCircle, Building2 } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    companyName: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    terms: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const updateForm = (key: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.companyName || !form.firstName || !form.lastName || !form.email || !form.password) {
      setError('Veuillez remplir tous les champs obligatoires.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (form.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (!form.terms) {
      setError('Vous devez accepter les conditions d\'utilisation.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/cleancheck/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: form.companyName,
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          password: form.password,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        router.push('/dashboard')
      } else {
        setError(data.error || 'Une erreur est survenue lors de l\'inscription.')
      }
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-emerald-100/50 via-teal-100/30 to-transparent blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-teal-100/40 via-cyan-100/20 to-transparent blur-3xl" />
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200/50">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              CleanCheck
            </span>
          </Link>
        </div>

        <Card className="border-0 shadow-xl shadow-emerald-100/20 rounded-2xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Créer votre compte
            </CardTitle>
            <CardDescription className="text-gray-500">
              Inscrivez votre entreprise et commencez à digitaliser vos interventions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* Company Name */}
              <div className="space-y-2">
                <Label htmlFor="companyName">
                  <Building2 className="h-3.5 w-3.5 inline mr-1.5" />
                  Nom de l&apos;entreprise *
                </Label>
                <Input
                  id="companyName"
                  placeholder="CleanPro Services"
                  value={form.companyName}
                  onChange={(e) => updateForm('companyName', e.target.value)}
                  className="h-11 rounded-xl border-gray-200 focus:border-emerald-300 focus:ring-emerald-100"
                />
              </div>

              {/* Name Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom *</Label>
                  <Input
                    id="firstName"
                    placeholder="Marie"
                    value={form.firstName}
                    onChange={(e) => updateForm('firstName', e.target.value)}
                    className="h-11 rounded-xl border-gray-200 focus:border-emerald-300 focus:ring-emerald-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom *</Label>
                  <Input
                    id="lastName"
                    placeholder="Dupont"
                    value={form.lastName}
                    onChange={(e) => updateForm('lastName', e.target.value)}
                    className="h-11 rounded-xl border-gray-200 focus:border-emerald-300 focus:ring-emerald-100"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Adresse email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="marie@cleancheck.fr"
                  value={form.email}
                  onChange={(e) => updateForm('email', e.target.value)}
                  className="h-11 rounded-xl border-gray-200 focus:border-emerald-300 focus:ring-emerald-100"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+33 6 12 34 56 78"
                  value={form.phone}
                  onChange={(e) => updateForm('phone', e.target.value)}
                  className="h-11 rounded-xl border-gray-200 focus:border-emerald-300 focus:ring-emerald-100"
                />
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(e) => updateForm('password', e.target.value)}
                      className="h-11 rounded-xl border-gray-200 focus:border-emerald-300 focus:ring-emerald-100 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer *</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={(e) => updateForm('confirmPassword', e.target.value)}
                    className="h-11 rounded-xl border-gray-200 focus:border-emerald-300 focus:ring-emerald-100"
                  />
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-3">
                <Checkbox
                  id="terms"
                  checked={form.terms}
                  onCheckedChange={(checked) => updateForm('terms', !!checked)}
                  className="mt-0.5 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                />
                <Label htmlFor="terms" className="text-sm text-gray-600 font-normal leading-relaxed">
                  J&apos;accepte les{' '}
                  <Link href="#" className="text-emerald-600 hover:text-emerald-700 font-medium">
                    conditions d&apos;utilisation
                  </Link>{' '}
                  et la{' '}
                  <Link href="#" className="text-emerald-600 hover:text-emerald-700 font-medium">
                    politique de confidentialité
                  </Link>
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-200/50"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création du compte...
                  </>
                ) : (
                  'Créer mon compte gratuit'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Déjà inscrit ?{' '}
                <Link href="/auth/login" className="text-emerald-600 font-semibold hover:text-emerald-700">
                  Se connecter
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
