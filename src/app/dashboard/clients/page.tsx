'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  UserCheck,
  Plus,
  Search,
  Mail,
  Phone,
  MapPin,
  ClipboardList,
  Loader2,
} from 'lucide-react'

interface Client {
  id: string
  name: string
  email: string
  phone: string
  city: string
  interventions: number
}

const demoClients: Client[] = [
  { id: '1', name: 'Bureau Martin & Associés', email: 'contact@martin.fr', phone: '+33 1 42 00 00 00', city: 'Paris', interventions: 15 },
  { id: '2', name: 'Hôtel Riviera', email: 'info@riviera.com', phone: '+33 4 93 00 00 00', city: 'Nice', interventions: 30 },
  { id: '3', name: 'Clinique Santé+', email: 'admin@cliniquesante.fr', phone: '+33 5 61 00 00 00', city: 'Toulouse', interventions: 22 },
  { id: '4', name: 'Restaurant Le Jardin', email: 'le.jardin@resto.fr', phone: '+33 1 43 00 00 00', city: 'Paris', interventions: 8 },
  { id: '5', name: 'Immeuble Tour Eiffel', email: 'syndic@tour-eiffel.fr', phone: '+33 1 45 00 00 00', city: 'Paris', interventions: 45 },
  { id: '6', name: 'École Primaire Victor Hugo', email: 'contact@vhugo.fr', phone: '+33 3 88 00 00 00', city: 'Strasbourg', interventions: 12 },
  { id: '7', name: 'Salle de Sport FitZone', email: 'info@fitzone.fr', phone: '+33 4 78 00 00 00', city: 'Lyon', interventions: 18 },
  { id: '8', name: 'Banque Nationale', email: 'service@banque-nat.fr', phone: '+33 1 40 00 00 00', city: 'Paris', interventions: 60 },
]

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [addLoading, setAddLoading] = useState(false)

  useEffect(() => {
    async function fetchClients() {
      try {
        const res = await fetch('/api/clients')
        if (res.ok) {
          setClients(await res.json())
        } else {
          setClients(demoClients)
        }
      } catch {
        setClients(demoClients)
      } finally {
        setLoading(false)
      }
    }
    fetchClients()
  }, [])

  const filtered = clients.filter((c) =>
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.city.toLowerCase().includes(search.toLowerCase())
  )

  const handleAddClient = async () => {
    setAddLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    setAddLoading(false)
    setAddOpen(false)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="space-y-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-500 text-sm mt-1">{filtered.length} client(s)</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un client
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Ajouter un client</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nom de la société</Label>
                <Input placeholder="Mon Entreprise SARL" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="contact@entreprise.fr" className="rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input type="tel" placeholder="+33 1 00 00 00" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Ville</Label>
                  <Input placeholder="Paris" className="rounded-xl" />
                </div>
              </div>
              <Button onClick={handleAddClient} disabled={addLoading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                {addLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {addLoading ? 'Ajout en cours...' : 'Ajouter le client'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Rechercher par nom, email ou ville..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-10 rounded-xl"
        />
      </div>

      {filtered.length === 0 ? (
        <Card className="border-0 shadow-sm rounded-xl">
          <CardContent className="py-16 text-center">
            <UserCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-gray-900 font-medium">Aucun client trouvé</h3>
            <p className="text-gray-500 text-sm mt-1">Ajoutez votre premier client pour commencer.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((client) => (
            <Card key={client.id} className="border-0 shadow-sm rounded-xl hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                    <UserCheck className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{client.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">{client.city}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Mail className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    <span>{client.phone}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <ClipboardList className="h-3.5 w-3.5 text-emerald-500" />
                      {client.interventions} interventions
                    </div>
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-xs">
                      Client actif
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
