'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Plus,
  Search,
  Users,
  Star,
  Phone,
  Mail,
  ClipboardList,
  TrendingUp,
  Award,
  ChevronDown,
  ChevronUp,
  Loader2,
} from 'lucide-react'

interface Agent {
  id: string
  name: string
  email: string
  phone: string
  interventions: number
  score: number
  status: string
  breakdown?: {
    punctuality: number
    quality: number
    communication: number
    thoroughness: number
    professionalism: number
  }
}

const demoAgents: Agent[] = [
  {
    id: '1', name: 'Sophie Laurent', email: 'sophie@cleancheck.fr', phone: '+33 6 12 34 56 78',
    interventions: 47, score: 96, status: 'active',
    breakdown: { punctuality: 98, quality: 95, communication: 97, thoroughness: 94, professionalism: 96 },
  },
  {
    id: '2', name: 'Marc Dupont', email: 'marc@cleancheck.fr', phone: '+33 6 23 45 67 89',
    interventions: 35, score: 82, status: 'active',
    breakdown: { punctuality: 75, quality: 85, communication: 88, thoroughness: 80, professionalism: 82 },
  },
  {
    id: '3', name: 'Julie Renard', email: 'julie@cleancheck.fr', phone: '+33 6 34 56 78 90',
    interventions: 52, score: 91, status: 'active',
    breakdown: { punctuality: 92, quality: 90, communication: 93, thoroughness: 89, professionalism: 91 },
  },
  {
    id: '4', name: 'Pierre Moreau', email: 'pierre@cleancheck.fr', phone: '+33 6 45 67 89 01',
    interventions: 12, score: 65, status: 'inactive',
    breakdown: { punctuality: 60, quality: 70, communication: 65, thoroughness: 62, professionalism: 68 },
  },
  {
    id: '5', name: 'Emma Bernard', email: 'emma@cleancheck.fr', phone: '+33 6 56 78 90 12',
    interventions: 28, score: 88, status: 'active',
    breakdown: { punctuality: 90, quality: 87, communication: 89, thoroughness: 86, professionalism: 88 },
  },
]

function getScoreColor(score: number) {
  if (score >= 90) return { text: 'text-emerald-600', bg: 'bg-emerald-100', progress: 'bg-emerald-500' }
  if (score >= 75) return { text: 'text-blue-600', bg: 'bg-blue-100', progress: 'bg-blue-500' }
  if (score >= 60) return { text: 'text-amber-600', bg: 'bg-amber-100', progress: 'bg-amber-500' }
  return { text: 'text-red-600', bg: 'bg-red-100', progress: 'bg-red-500' }
}

function AgentCard({ agent }: { agent: Agent }) {
  const [expanded, setExpanded] = useState(false)
  const colors = getScoreColor(agent.score)

  return (
    <Card className="border-0 shadow-sm rounded-xl hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-sm">
              {agent.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{agent.name}</p>
              <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{agent.email}</span>
                <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{agent.phone}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className={`text-2xl font-bold ${colors.text}`}>{agent.score}</div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <ClipboardList className="h-3 w-3" />
                {agent.interventions} missions
              </div>
            </div>
            <Badge variant="secondary" className={`${agent.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'} text-xs`}>
              {agent.status === 'active' ? 'Actif' : 'Inactif'}
            </Badge>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              {expanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
            </button>
          </div>
        </div>

        {expanded && agent.breakdown && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Détail du score</p>
            {[
              { label: 'Ponctualité', value: agent.breakdown.punctuality },
              { label: 'Qualité', value: agent.breakdown.quality },
              { label: 'Communication', value: agent.breakdown.communication },
              { label: 'Minutie', value: agent.breakdown.thoroughness },
              { label: 'Professionnalisme', value: agent.breakdown.professionalism },
            ].map((criterion) => {
              const c = getScoreColor(criterion.value)
              return (
                <div key={criterion.label} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-32 shrink-0">{criterion.label}</span>
                  <div className="flex-1">
                    <Progress value={criterion.value} className="h-2" />
                  </div>
                  <span className={`text-sm font-semibold w-8 text-right ${c.text}`}>{criterion.value}</span>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [addLoading, setAddLoading] = useState(false)

  useEffect(() => {
    async function fetchAgents() {
      try {
        const res = await fetch('/api/agents')
        if (res.ok) {
          setAgents(await res.json())
        } else {
          setAgents(demoAgents)
        }
      } catch {
        setAgents(demoAgents)
      } finally {
        setLoading(false)
      }
    }
    fetchAgents()
  }, [])

  const filtered = agents.filter((a) =>
    !search ||
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleAddAgent = async () => {
    setAddLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    setAddLoading(false)
    setAddOpen(false)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="space-y-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agents</h1>
          <p className="text-gray-500 text-sm mt-1">{filtered.length} agent(s)</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un agent
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Ajouter un agent</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nom complet</Label>
                <Input placeholder="Jean Dupont" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="jean@cleancheck.fr" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Téléphone</Label>
                <Input type="tel" placeholder="+33 6 00 00 00 00" className="rounded-xl" />
              </div>
              <Button onClick={handleAddAgent} disabled={addLoading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                {addLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {addLoading ? 'Ajout en cours...' : 'Ajouter l\'agent'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Rechercher un agent..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-10 rounded-xl"
        />
      </div>

      {filtered.length === 0 ? (
        <Card className="border-0 shadow-sm rounded-xl">
          <CardContent className="py-16 text-center">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-gray-900 font-medium">Aucun agent trouvé</h3>
            <p className="text-gray-500 text-sm mt-1">Ajoutez votre premier agent pour commencer.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}
    </div>
  )
}
