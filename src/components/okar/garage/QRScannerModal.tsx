/**
 * OKAR - QR Scanner Modal
 * 
 * Flux d'activation QR complet:
 * - Étape 1: Scan ou saisie manuelle
 * - Étape 2a: Si vierge → Formulaire activation
 * - Étape 2b: Si actif → Formulaire intervention
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Camera,
  QrCode,
  Search,
  Car,
  User,
  Phone,
  Mail,
  Calendar,
  FileText,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  Shield,
  AlertTriangle,
  Sparkles,
  Wrench,
} from 'lucide-react'

interface QRScannerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type QRStatus = 'idle' | 'checking' | 'valid_stock' | 'active_vehicle' | 'invalid' | 'not_yours'
type Step = 'scan' | 'activate' | 'intervention'

// Fonction pour vérifier un QR code via l'API
const checkQRCode = async (code: string): Promise<{ status: QRStatus; vehicle?: any; qrId?: string; error?: string }> => {
  try {
    const res = await fetch(`/api/garage/qrcodes/check?code=${encodeURIComponent(code)}`)
    const data = await res.json()
    
    if (!data.success) {
      return { 
        status: data.status as QRStatus || 'invalid', 
        error: data.error 
      }
    }
    
    if (data.status === 'valid_stock') {
      return {
        status: 'valid_stock',
        qrId: data.data.qrId
      }
    }
    
    if (data.status === 'active_vehicle') {
      return {
        status: 'active_vehicle',
        vehicle: data.data.vehicle
      }
    }
    
    return { status: 'invalid', error: 'Statut non reconnu' }
  } catch (error) {
    console.error('Erreur vérification QR:', error)
    return { status: 'invalid', error: 'Erreur de connexion' }
  }
}

export function QRScannerModal({ open, onOpenChange }: QRScannerModalProps) {
  const [step, setStep] = useState<Step>('scan')
  const [qrCode, setQrCode] = useState('')
  const [checking, setChecking] = useState(false)
  const [qrStatus, setQrStatus] = useState<QRStatus>('idle')
  const [vehicle, setVehicle] = useState<any>(null)
  const [manualInput, setManualInput] = useState('')
  const [errorMessage, setErrorMessage] = useState<string>('')
  
  // Formulaire activation
  const [formData, setFormData] = useState({
    plateNumber: '',
    brand: '',
    model: '',
    year: '',
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    technicalControlDate: '',
    insuranceExpiryDate: '',
  })

  const videoRef = useRef<HTMLVideoElement>(null)
  const [cameraActive, setCameraActive] = useState(false)

  const handleCheckQR = async (code: string) => {
    if (!code.trim()) return
    
    setChecking(true)
    setQrCode(code)
    setErrorMessage('')
    
    try {
      const result = await checkQRCode(code)
      setQrStatus(result.status)
      
      if (result.error) {
        setErrorMessage(result.error)
      }
      
      if (result.status === 'active_vehicle' && result.vehicle) {
        setVehicle(result.vehicle)
        setStep('intervention')
      } else if (result.status === 'valid_stock') {
        setStep('activate')
      }
    } catch (error) {
      setQrStatus('invalid')
      setErrorMessage('Erreur lors de la vérification')
    } finally {
      setChecking(false)
    }
  }

  const handleManualSubmit = () => {
    handleCheckQR(manualInput)
  }

  const resetScanner = () => {
    setStep('scan')
    setQrCode('')
    setQrStatus('idle')
    setVehicle(null)
    setManualInput('')
    setErrorMessage('')
    setFormData({
      plateNumber: '',
      brand: '',
      model: '',
      year: '',
      ownerName: '',
      ownerPhone: '',
      ownerEmail: '',
      technicalControlDate: '',
      insuranceExpiryDate: '',
    })
  }

  const handleClose = () => {
    resetScanner()
    onOpenChange(false)
  }

  const handleActivate = async () => {
    try {
      const res = await fetch('/api/garage/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrCodeId: qrCode,
          plateNumber: formData.plateNumber,
          brand: formData.brand,
          model: formData.model,
          year: formData.year,
          ownerName: formData.ownerName,
          ownerPhone: formData.ownerPhone,
          ownerEmail: formData.ownerEmail,
          technicalControlDate: formData.technicalControlDate,
          insuranceExpiryDate: formData.insuranceExpiryDate,
        })
      })
      
      const data = await res.json()
      
      if (data.success) {
        // TODO: Envoyer les identifiants au client par SMS/WhatsApp
        console.log('Véhicule activé:', data.data)
        handleClose()
      } else {
        setErrorMessage(data.error || 'Erreur lors de l\'activation')
      }
    } catch (error) {
      console.error('Erreur activation:', error)
      setErrorMessage('Erreur de connexion lors de l\'activation')
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setCameraActive(true)
      }
    } catch (error) {
      console.error('Camera error:', error)
    }
  }

  useEffect(() => {
    if (open && step === 'scan') {
      // Reset on open
    }
  }, [open, step])

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-okar-dark-card border-white/10 text-okar-text-primary">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-pink-400" />
            {step === 'scan' && 'Scanner un QR Code'}
            {step === 'activate' && 'Activer un Pass Véhicule'}
            {step === 'intervention' && 'Nouvelle Intervention'}
          </DialogTitle>
          <DialogDescription className="text-okar-text-muted">
            {step === 'scan' && 'Scannez ou saisissez le code QR pour identifier un véhicule'}
            {step === 'activate' && 'Remplissez les informations du véhicule et propriétaire'}
            {step === 'intervention' && 'Ce véhicule est déjà actif, enregistrez une intervention'}
          </DialogDescription>
        </DialogHeader>

        {/* Étape 1: Scan */}
        {step === 'scan' && (
          <div className="space-y-6">
            <Tabs defaultValue="manual" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-okar-dark-800/50">
                <TabsTrigger value="manual" className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-300">
                  Saisie Manuelle
                </TabsTrigger>
                <TabsTrigger value="camera" className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-300">
                  <Camera className="h-4 w-4 mr-2" />
                  Caméra
                </TabsTrigger>
              </TabsList>

              <TabsContent value="manual" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-okar-text-secondary">Code QR</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ex: OKAR-ABC-123"
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value.toUpperCase())}
                      className="bg-okar-dark-800/50 border-white/10 text-okar-text-primary placeholder:text-okar-text-muted focus:border-pink-500/50"
                    />
                    <Button
                      onClick={handleManualSubmit}
                      disabled={!manualInput.trim() || checking}
                      className="bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800"
                    >
                      {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="bg-okar-dark-800/30 rounded-xl p-4 border border-white/5">
                  <p className="text-okar-text-muted text-sm">
                    💡 Entrez le code inscrit sous le QR Code. Format: <span className="text-pink-400 font-mono">OKAR-XXX-XXX</span>
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="camera" className="mt-4">
                <div className="aspect-video bg-okar-dark-800 rounded-xl overflow-hidden relative border border-white/10">
                  {!cameraActive ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                      <Camera className="h-16 w-16 text-okar-text-muted" />
                      <Button
                        onClick={startCamera}
                        className="bg-gradient-to-r from-pink-600 to-pink-700"
                      >
                        Activer la caméra
                      </Button>
                    </div>
                  ) : (
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {/* Résultat vérification */}
            {checking && (
              <div className="flex items-center justify-center gap-3 py-8">
                <Loader2 className="h-6 w-6 animate-spin text-pink-400" />
                <span className="text-okar-text-secondary">Vérification du code...</span>
              </div>
            )}

            {qrStatus === 'invalid' && (
              <Card className="bg-rose-500/10 border-rose-500/20">
                <CardContent className="flex items-center gap-4 p-4">
                  <XCircle className="h-10 w-10 text-rose-400" />
                  <div>
                    <p className="font-semibold text-rose-300">Code invalide ou expiré</p>
                    <p className="text-sm text-rose-400/80">{errorMessage || 'Ce QR code n\'existe pas ou a été signalé comme perdu'}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {qrStatus === 'not_yours' && (
              <Card className="bg-amber-500/10 border-amber-500/20">
                <CardContent className="flex items-center gap-4 p-4">
                  <AlertTriangle className="h-10 w-10 text-amber-400" />
                  <div>
                    <p className="font-semibold text-amber-300">Code non attribué</p>
                    <p className="text-sm text-amber-400/80">{errorMessage || 'Ce QR code appartient à un autre garage'}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Étape 2a: Activation */}
        {step === 'activate' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              <div>
                <p className="font-semibold text-emerald-300">Code valide - Prêt à activer</p>
                <p className="text-sm text-emerald-400/80">Code: <span className="font-mono">{qrCode}</span></p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Infos véhicule */}
              <div className="col-span-2">
                <h3 className="text-sm font-semibold text-okar-text-secondary mb-3 flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  Informations Véhicule
                </h3>
              </div>
              
              <div className="space-y-2">
                <Label className="text-okar-text-muted text-xs">Immatriculation *</Label>
                <Input
                  placeholder="DK-123-AB"
                  value={formData.plateNumber}
                  onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value.toUpperCase() })}
                  className="bg-okar-dark-800/50 border-white/10 text-okar-text-primary"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-okar-text-muted text-xs">Marque *</Label>
                <Input
                  placeholder="Toyota"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="bg-okar-dark-800/50 border-white/10 text-okar-text-primary"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-okar-text-muted text-xs">Modèle *</Label>
                <Input
                  placeholder="Corolla"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="bg-okar-dark-800/50 border-white/10 text-okar-text-primary"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-okar-text-muted text-xs">Année</Label>
                <Input
                  type="number"
                  placeholder="2020"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="bg-okar-dark-800/50 border-white/10 text-okar-text-primary"
                />
              </div>

              {/* Infos propriétaire */}
              <div className="col-span-2 mt-4">
                <h3 className="text-sm font-semibold text-okar-text-secondary mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Informations Propriétaire
                </h3>
              </div>
              
              <div className="space-y-2">
                <Label className="text-okar-text-muted text-xs">Nom complet *</Label>
                <Input
                  placeholder="Ahmed Fall"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  className="bg-okar-dark-800/50 border-white/10 text-okar-text-primary"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-okar-text-muted text-xs">Téléphone *</Label>
                <Input
                  placeholder="77 123 45 67"
                  value={formData.ownerPhone}
                  onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                  className="bg-okar-dark-800/50 border-white/10 text-okar-text-primary"
                />
              </div>
              
              <div className="space-y-2 col-span-2">
                <Label className="text-okar-text-muted text-xs">Email (optionnel)</Label>
                <Input
                  type="email"
                  placeholder="client@email.com"
                  value={formData.ownerEmail}
                  onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                  className="bg-okar-dark-800/50 border-white/10 text-okar-text-primary"
                />
              </div>

              {/* Dates */}
              <div className="col-span-2 mt-4">
                <h3 className="text-sm font-semibold text-okar-text-secondary mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Documents
                </h3>
              </div>
              
              <div className="space-y-2">
                <Label className="text-okar-text-muted text-xs">Date CT</Label>
                <Input
                  type="date"
                  value={formData.technicalControlDate}
                  onChange={(e) => setFormData({ ...formData, technicalControlDate: e.target.value })}
                  className="bg-okar-dark-800/50 border-white/10 text-okar-text-primary"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-okar-text-muted text-xs">Expiration Assurance</Label>
                <Input
                  type="date"
                  value={formData.insuranceExpiryDate}
                  onChange={(e) => setFormData({ ...formData, insuranceExpiryDate: e.target.value })}
                  className="bg-okar-dark-800/50 border-white/10 text-okar-text-primary"
                />
              </div>

              {/* Photo véhicule */}
              <div className="col-span-2 mt-4">
                <Label className="text-okar-text-muted text-xs">Photo du véhicule (optionnel)</Label>
                <div className="mt-2 border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-pink-500/30 transition-colors cursor-pointer">
                  <Camera className="h-8 w-8 text-okar-text-muted mx-auto mb-2" />
                  <p className="text-sm text-okar-text-muted">Cliquez pour ajouter une photo</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={resetScanner} className="flex-1 border-white/10 text-okar-text-secondary">
                Retour
              </Button>
              <Button
                onClick={handleActivate}
                className="flex-1 bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Activer le Pass
              </Button>
            </div>
          </div>
        )}

        {/* Étape 2b: Intervention */}
        {step === 'intervention' && vehicle && (
          <div className="space-y-6">
            {/* Véhicule trouvé */}
            <Card className="bg-okar-dark-800/50 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center">
                    <Car className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-okar-text-primary">{vehicle.plateNumber}</span>
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-0">Actif</Badge>
                    </div>
                    <p className="text-okar-text-secondary">{vehicle.brand} {vehicle.model} ({vehicle.year})</p>
                    <div className="flex items-center gap-3 mt-1 text-sm text-okar-text-muted">
                      <span>{vehicle.ownerName}</span>
                      <span>•</span>
                      <span>{vehicle.ownerPhone}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-okar-text-muted">Santé</p>
                    <p className="text-2xl font-bold text-emerald-400">{vehicle.healthScore}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-center py-4">
              <Button
                onClick={() => {
                  // TODO: Ouvrir InterventionFormModal
                  handleClose()
                }}
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 h-14 px-8"
              >
                <Wrench className="h-5 w-5 mr-2" />
                Enregistrer une intervention
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>

            <Button variant="outline" onClick={resetScanner} className="w-full border-white/10 text-okar-text-secondary">
              Scanner un autre code
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
