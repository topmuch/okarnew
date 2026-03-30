/**
 * OKAR - Transfer Code Component
 * Génération et affichage du code de transfert
 */

'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Key, 
  Copy, 
  Check, 
  Clock, 
  RefreshCw,
  Share2,
  Loader2
} from 'lucide-react'

interface TransferCodeProps {
  hasActiveCode: boolean
  code?: string
  expiresAt?: Date | string
  remainingMinutes?: number
  onGenerateCode: () => Promise<{ code: string; expiresAt: Date }>
}

export function TransferCode({ 
  hasActiveCode, 
  code: existingCode, 
  expiresAt, 
  remainingMinutes,
  onGenerateCode 
}: TransferCodeProps) {
  const [code, setCode] = useState(existingCode || '')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [expiry, setExpiry] = useState(expiresAt)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const result = await onGenerateCode()
      setCode(result.code)
      setExpiry(result.expiresAt)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatCode = (codeStr: string) => {
    return codeStr.match(/.{1,3}/g)?.join(' ') || codeStr
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
      <CardHeader>
        <CardTitle className="text-gray-900 flex items-center gap-2">
          <Share2 className="h-5 w-5 text-orange-500" />
          Transfert de Propriété
        </CardTitle>
        <CardDescription>
          Générez un code temporaire pour transférer votre véhicule à un acheteur
        </CardDescription>
      </CardHeader>
      <CardContent>
        {code ? (
          <div className="text-center space-y-4">
            {/* Code affiché */}
            <div className="p-6 bg-gradient-to-r from-orange-50 via-pink-50 to-blue-50 rounded-2xl border-2 border-dashed border-orange-300">
              <p className="text-sm text-gray-500 mb-2">Code de transfert</p>
              <p className="text-4xl font-mono font-bold text-gray-900 tracking-widest">
                {formatCode(code)}
              </p>
            </div>

            {/* Temps restant */}
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <Clock className="h-4 w-4" />
              <span className="text-sm">
                {remainingMinutes !== undefined 
                  ? `Valide pendant ${remainingMinutes} minutes`
                  : expiry 
                    ? `Expire le ${new Date(expiry).toLocaleString('fr-FR')}`
                    : 'Code valide 24 heures'}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button onClick={handleCopy} className="flex-1 rounded-xl">
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copié!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copier le code
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleGenerate}
                disabled={loading}
                className="rounded-xl"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Key className="h-10 w-10 text-orange-600" />
            </div>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Vous êtes sur le point de générer un code de transfert pour votre véhicule.
              L'acheteur pourra récupérer tout l'historique certifié.
            </p>
            <Button 
              onClick={handleGenerate}
              disabled={loading}
              className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-xl px-8"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <Key className="h-4 w-4 mr-2" />
                  Générer le code
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
