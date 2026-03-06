import { useQuery } from '@tanstack/react-query'
import { getDashboardStats } from '@/api/dashboard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Building2, Eye, FileText } from 'lucide-react'

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
  })

  const cards = [
    { title: 'Total propiedades', value: stats?.total_properties ?? '-', icon: Building2 },
    { title: 'Propiedades visibles', value: stats?.visible_properties ?? '-', icon: Eye },
    { title: 'Solicitudes sin leer', value: stats?.unread_requests ?? '-', icon: FileText },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      {isLoading ? (
        <p className="text-muted-foreground">Cargando...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card) => (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                <card.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
