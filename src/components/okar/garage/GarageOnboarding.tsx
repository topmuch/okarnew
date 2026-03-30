/**
 * OKAR - Garage Onboarding Pages
 */

'use client'

import { useAuth } from '@/context/AuthProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  MessageCircle,
  Car,
  Sparkles,
  Shield,
  Zap,
} from 'lucide-react'
import Link from 'next/link'

// ============================================================================
// PAGE: EN ATTENTE DE VALIDATION
// ============================================================================

export function PendingValidationPage() {
  const { user } = useAuth()

  const steps = [
    { label: 'Documents reçus', completed: true },
    { label: 'Vérification en cours', completed: true, active: true },
    { label: 'Validation admin', completed: false },
    { label: 'Accès activé', completed: false },
  ]

  return (
    <div className="min-h-screen bg-okar-dark-900 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-700 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/20">
              <Car className="h-8 w-8 text-white" />
            </div>
            <div className="text-left">
              <span className="text-2xl font-bold text-white">OKAR</span>
              <Badge className="ml-2 bg-amber-500/20 text-amber-300 border-0">En attente</Badge>
            </div>
          </Link>
        </div>

        {/* Card principale */}
        <Card className="bg-okar-dark-card/60 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden">
          <div className="relative bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent p-8 pb-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 blur-3xl" />
            <div className="relative flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl text-white">Compte en attente de validation</CardTitle>
                <CardDescription className="text-okar-text-muted mt-1">
                  Votre demande est en cours d'examen
                </CardDescription>
              </div>
            </div>
          </div>

          <CardContent className="p-6 space-y-6">
            {/* Progress steps */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-okar-text-secondary">Progression de votre demande</p>
              <div className="relative">
                {steps.map((step, index) => (
                  <div key={step.label} className="flex items-center gap-3 py-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step.completed
                        ? 'bg-gradient-to-br from-emerald-400 to-green-500'
                        : step.active
                          ? 'bg-gradient-to-br from-amber-400 to-orange-500 animate-pulse'
                          : 'bg-okar-dark-700'
                    }`}>
                      {step.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      ) : step.active ? (
                        <Clock className="h-4 w-4 text-white" />
                      ) : (
                        <span className="text-xs text-okar-text-muted">{index + 1}</span>
                      )}
                    </div>
                    <span className={`text-sm ${
                      step.completed || step.active ? 'text-okar-text-primary' : 'text-okar-text-muted'
                    }`}>
                      {step.label}
                    </span>
                    {step.active && (
                      <Badge className="bg-amber-500/20 text-amber-300 border-0 text-xs animate-pulse">
                        En cours
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Info box */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <div className="flex gap-3">
                <Shield className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-blue-300 font-medium text-sm">Processus de validation</p>
                  <p className="text-blue-400/80 text-sm mt-1">
                    Notre équipe vérifie généralement les demandes sous 24-48h ouvrées.
                    Vous recevrez un email et un SMS dès que votre compte sera activé.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="pt-4 border-t border-white/5">
              <p className="text-sm text-okar-text-muted text-center">
                Une question ?{' '}
                <a href="tel:+221770000000" className="text-pink-400 hover:text-pink-300">
                  Contactez le support
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ============================================================================
// PAGE: COMPTE SUSPENDU
// ============================================================================

export function SuspendedAccountPage() {
  const { logout } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="min-h-screen bg-okar-dark-900 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-red-700 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Car className="h-8 w-8 text-white" />
            </div>
            <div className="text-left">
              <span className="text-2xl font-bold text-white">OKAR</span>
              <Badge className="ml-2 bg-rose-500/20 text-rose-300 border-0">Suspendu</Badge>
            </div>
          </Link>
        </div>

        {/* Card principale */}
        <Card className="bg-okar-dark-card/60 backdrop-blur-xl border border-rose-500/20 rounded-2xl overflow-hidden">
          <div className="relative bg-gradient-to-br from-rose-500/10 via-red-500/5 to-transparent p-8 pb-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-400/10 blur-3xl" />
            <div className="relative flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/20">
                <AlertTriangle className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl text-white">Compte suspendu</CardTitle>
                <CardDescription className="text-okar-text-muted mt-1">
                  L'accès à votre garage a été restreint
                </CardDescription>
              </div>
            </div>
          </div>

          <CardContent className="p-6 space-y-6">
            {/* Raison */}
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4">
              <p className="text-rose-300 font-medium">Motif de suspension</p>
              <p className="text-rose-400/80 text-sm mt-1">
                Votre abonnement a expiré ou votre compte ne respecte pas les conditions d'utilisation.
              </p>
            </div>

            {/* Impact */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-okar-text-secondary">Conséquences</p>
              <ul className="space-y-2">
                {[
                  'Accès au dashboard restreint',
                  'Impossible d\'enregistrer de nouvelles interventions',
                  'Profil public désactivé',
                  'Stock QR inaccessible',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-okar-text-muted">
                    <XCircle className="h-4 w-4 text-rose-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Admin */}
            <div className="bg-okar-dark-800/50 rounded-xl p-4 space-y-4">
              <p className="text-sm font-medium text-okar-text-secondary">Contacter l'administration</p>
              <div className="space-y-3">
                <a
                  href="tel:+221770000000"
                  className="flex items-center gap-3 p-3 bg-okar-dark-700/50 rounded-lg hover:bg-okar-dark-700 transition-colors"
                >
                  <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center">
                    <Phone className="h-5 w-5 text-pink-400" />
                  </div>
                  <div>
                    <p className="text-okar-text-primary font-medium">Téléphone</p>
                    <p className="text-okar-text-muted text-sm">+221 77 000 00 00</p>
                  </div>
                </a>
                <a
                  href="mailto:support@okar.sn"
                  className="flex items-center gap-3 p-3 bg-okar-dark-700/50 rounded-lg hover:bg-okar-dark-700 transition-colors"
                >
                  <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center">
                    <Mail className="h-5 w-5 text-pink-400" />
                  </div>
                  <div>
                    <p className="text-okar-text-primary font-medium">Email</p>
                    <p className="text-okar-text-muted text-sm">support@okar.sn</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Logout */}
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full border-white/10 text-okar-text-secondary hover:bg-okar-dark-800"
            >
              Se déconnecter
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
