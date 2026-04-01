/**
 * OKAR - Stock QR Module
 * Module de gestion du stock QR codes
 * - Barre de progression
 * - Activation de pass
 * - Commande de lots
 * - Liste des QR codes
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  QrCode,
  Package,
  ShoppingCart,
  ScanLine,
  CheckCircle2,
  XCircle,
  Clock,
  Car,
  User,
  Plus,
  Loader2,
  AlertTriangle,
} from 'lucide-react'
import { QRScannerModal } from './QRScannerModal'

interface StockQRModuleProps {
  garageId?: string
  onOpenScanner?: () => void
}

interface QRCodeItem {
  id: string
  code: string
  lotId: string
  status: string
  activatedByName?: string
  activatedByPhone?: string
  activatedAt?: Date
  vehicle?: {
    plateNumber: string
    brand: string
    model: string
  }
  createdAt: Date
}

interface QRStats {
  total: number
  stock: number
  active: number
  percentage: number
}

export function StockQRModule({ garageId, onOpenScanner }: StockQRModuleProps) {
  const [qrCodes, setQrCodes] = useState<QRCodeItem[]>([])
  const [stats, setStats] = useState<QRStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [orderDialogOpen, setOrderDialogOpen] = useState(false)
  const [orderQuantity, setOrderQuantity] = useState(50)
  const [ordering, setOrdering] = useState(false)
  const [activeTab, setActiveTab] = useState<'stock' | 'active'>('stock')

  useEffect(() => {
    fetchQRStock()
  }, [garageId])

  const fetchQRStock = async () => {
    try {
      const res = await fetch('/api/garage/qrcodes')
      const data = await res.json()
      if (data.success) {
        setQrCodes(data.data.qrCodes)
        setStats(data.data.stats)
      }
    } catch (error) {
      console.error('Erreur chargement QR:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOrderQR = async () => {
    setOrdering(true)
    try {
      const res = await fetch('/api/garage/qrcodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          garageId: garageId || 'demo-garage-id',
          quantity: orderQuantity
        })
      })
      const data = await res.json()
      if (data.success) {
        setOrderDialogOpen(false)
        fetchQRStock()
      }
    } catch (error) {
      console.error('Erreur commande:', error)
    } finally {
      setOrdering(false)
    }
  }

  const handleOpenScanner = () => {
    if (onOpenScanner) {
      onOpenScanner()
    } else {
      setScannerOpen(true)
    }
  }

  const filteredCodes = qrCodes.filter(qr => 
    activeTab === 'stock' ? qr.status === 'stock' : qr.status === 'active'
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-48 bg-okar-dark-800/50 rounded-2xl animate-pulse" />
        <div className="h-64 bg-okar-dark-800/50 rounded-2xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stock Overview */}
      <Card className="bg-okar-dark-card border-white/10">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-okar-text-primary">
            <Package className="h-5 w-5 text-pink-400" />
            Stock QR Codes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Barre de progression */}
          <div className="bg-okar-dark-800/30 rounded-xl p-5 border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-okar-text-muted text-sm">Utilisation du stock</p>
                <p className="text-2xl font-bold text-white">
                  {stats?.stock || 0} <span className="text-okar-text-muted text-lg">disponibles</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-okar-text-muted text-sm">Total</p>
                <p className="text-xl font-semibold text-okar-text-secondary">{stats?.total || 0}</p>
              </div>
            </div>
            <Progress 
              value={stats?.percentage || 0} 
              className="h-3 bg-okar-dark-700 [&>div]:bg-gradient-to-r [&>div]:from-pink-500 [&>div]:to-rose-500" 
            />
            <p className="text-xs text-okar-text-muted mt-2">
              {stats?.active || 0} codes utilisés ({stats?.percentage?.toFixed(1) || 0}%)
            </p>
          </div>

          {/* Alerte stock bas */}
          {stats && stats.stock < 30 && (
            <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              <div>
                <p className="text-amber-300 font-medium">Stock faible</p>
                <p className="text-amber-400/80 text-sm">Pensez à commander de nouveaux QR codes</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={handleOpenScanner}
              className="h-16 bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800"
            >
              <div className="flex flex-col items-center gap-1">
                <ScanLine className="h-5 w-5" />
                <span className="text-sm">Activer un Pass</span>
              </div>
            </Button>
            <Button
              onClick={() => setOrderDialogOpen(true)}
              variant="outline"
              className="h-16 border-white/10 text-okar-text-primary hover:bg-white/5"
            >
              <div className="flex flex-col items-center gap-1">
                <ShoppingCart className="h-5 w-5" />
                <span className="text-sm">Commander un lot</span>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des QR Codes */}
      <Card className="bg-okar-dark-card border-white/10">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-okar-text-primary">
              <QrCode className="h-5 w-5 text-pink-400" />
              Liste des QR Codes
            </CardTitle>
            
            {/* Tabs */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={activeTab === 'stock' ? 'default' : 'outline'}
                onClick={() => setActiveTab('stock')}
                className={activeTab === 'stock' 
                  ? 'bg-pink-600 hover:bg-pink-700' 
                  : 'border-white/10 text-okar-text-secondary'
                }
              >
                En stock ({stats?.stock || 0})
              </Button>
              <Button
                size="sm"
                variant={activeTab === 'active' ? 'default' : 'outline'}
                onClick={() => setActiveTab('active')}
                className={activeTab === 'active' 
                  ? 'bg-pink-600 hover:bg-pink-700' 
                  : 'border-white/10 text-okar-text-secondary'
                }
              >
                Actifs ({stats?.active || 0})
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {filteredCodes.length === 0 ? (
              <div className="text-center py-8 text-okar-text-muted">
                <QrCode className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Aucun QR code {activeTab === 'stock' ? 'en stock' : 'actif'}</p>
              </div>
            ) : (
              filteredCodes.map((qr) => (
                <div
                  key={qr.id}
                  className="flex items-center gap-4 p-4 bg-okar-dark-800/30 rounded-xl border border-white/5 hover:bg-okar-dark-800/50 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    qr.status === 'stock' 
                      ? 'bg-gray-500/20' 
                      : 'bg-emerald-500/20'
                  }`}>
                    <QrCode className={`h-5 w-5 ${
                      qr.status === 'stock' ? 'text-gray-400' : 'text-emerald-400'
                    }`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-okar-text-primary">{qr.code}</span>
                      <Badge className={`text-xs border-0 ${
                        qr.status === 'stock' 
                          ? 'bg-gray-500/20 text-gray-400' 
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {qr.status === 'stock' ? 'Stock' : 'Actif'}
                      </Badge>
                    </div>
                    
                    {qr.status === 'active' && qr.vehicle && (
                      <div className="flex items-center gap-3 mt-1 text-xs text-okar-text-muted">
                        <span className="flex items-center gap-1">
                          <Car className="h-3 w-3" />
                          {qr.vehicle.plateNumber}
                        </span>
                        <span>{qr.vehicle.brand} {qr.vehicle.model}</span>
                      </div>
                    )}
                    
                    {qr.status === 'active' && qr.activatedByName && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-okar-text-muted">
                        <User className="h-3 w-3" />
                        {qr.activatedByName} • {qr.activatedByPhone}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right text-xs text-okar-text-muted">
                    {qr.status === 'active' && qr.activatedAt ? (
                      <span>Activé le {new Date(qr.activatedAt).toLocaleDateString('fr-FR')}</span>
                    ) : (
                      <span>Lot: {qr.lotId}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* QR Scanner Modal */}
      <QRScannerModal 
        open={scannerOpen} 
        onOpenChange={setScannerOpen} 
      />

      {/* Dialog de commande */}
      <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
        <DialogContent className="bg-okar-dark-card border-white/10 text-okar-text-primary">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-pink-400" />
              Commander des QR Codes
            </DialogTitle>
            <DialogDescription className="text-okar-text-muted">
              Choisissez la quantité de QR codes à commander
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="text-okar-text-secondary">Quantité</Label>
              <div className="grid grid-cols-4 gap-2">
                {[25, 50, 100, 200].map((qty) => (
                  <Button
                    key={qty}
                    variant={orderQuantity === qty ? 'default' : 'outline'}
                    onClick={() => setOrderQuantity(qty)}
                    className={orderQuantity === qty 
                      ? 'bg-pink-600 hover:bg-pink-700' 
                      : 'border-white/10 text-okar-text-secondary hover:text-white'
                    }
                  >
                    {qty}
                  </Button>
                ))}
              </div>
              <Input
                type="number"
                value={orderQuantity}
                onChange={(e) => setOrderQuantity(parseInt(e.target.value) || 50)}
                min={10}
                className="bg-okar-dark-800/50 border-white/10 text-okar-text-primary mt-2"
              />
            </div>
            
            <div className="bg-okar-dark-800/30 rounded-xl p-4 border border-white/5">
              <div className="flex justify-between items-center">
                <span className="text-okar-text-secondary">Prix estimé</span>
                <span className="text-xl font-bold text-amber-300">
                  {(orderQuantity * 500).toLocaleString()} FCFA
                </span>
              </div>
              <p className="text-xs text-okar-text-muted mt-1">
                500 FCFA par QR code • Livraison sous 48h
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setOrderDialogOpen(false)}
              className="flex-1 border-white/10 text-okar-text-secondary"
            >
              Annuler
            </Button>
            <Button
              onClick={handleOrderQR}
              disabled={ordering || orderQuantity < 10}
              className="flex-1 bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800"
            >
              {ordering ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Commande...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Commander {orderQuantity} QR
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default StockQRModule
