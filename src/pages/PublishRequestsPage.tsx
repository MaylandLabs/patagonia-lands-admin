import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPublishRequests, markAsRead } from '@/api/publish-requests'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toast'
import { Mail, MailOpen } from 'lucide-react'
import type { PublishRequest } from '@/types'

export default function PublishRequestsPage() {
  const [selected, setSelected] = useState<PublishRequest | null>(null)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data, isLoading } = useQuery({
    queryKey: ['publish-requests'],
    queryFn: () => getPublishRequests(),
  })

  const requests = data?.data ?? []

  const readMutation = useMutation({
    mutationFn: (id: number) => markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publish-requests'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
    onError: () => toast({ title: 'Error al actualizar', variant: 'destructive' }),
  })

  const handleOpen = (req: PublishRequest) => {
    setSelected(req)
    if (!req.read) {
      readMutation.mutate(req.id)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Solicitudes de publicacion</h1>

      {isLoading ? (
        <p className="text-muted-foreground">Cargando...</p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium w-8"></th>
                <th className="text-left p-3 font-medium">Nombre</th>
                <th className="text-left p-3 font-medium">Email</th>
                <th className="text-left p-3 font-medium">Telefono</th>
                <th className="text-left p-3 font-medium">Provincia</th>
                <th className="text-left p-3 font-medium">Hectareas</th>
                <th className="text-left p-3 font-medium">Fecha</th>
                <th className="text-left p-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center p-8 text-muted-foreground">No hay solicitudes</td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr
                    key={req.id}
                    className={`border-t cursor-pointer hover:bg-muted/30 ${!req.read ? 'font-medium bg-muted/10' : ''}`}
                    onClick={() => handleOpen(req)}
                  >
                    <td className="p-3">
                      {req.read ? (
                        <MailOpen className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Mail className="h-4 w-4 text-primary" />
                      )}
                    </td>
                    <td className="p-3">{req.name}</td>
                    <td className="p-3">{req.email}</td>
                    <td className="p-3">{req.phone}</td>
                    <td className="p-3">{req.province}</td>
                    <td className="p-3">{req.hectares?.toLocaleString()}</td>
                    <td className="p-3">{new Date(req.created_at).toLocaleDateString('es-AR')}</td>
                    <td className="p-3">
                      <Badge variant={req.read ? 'secondary' : 'default'}>
                        {req.read ? 'Leido' : 'Nuevo'}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>Solicitud de {selected.name}</DialogTitle>
                <DialogDescription>
                  Recibida el {new Date(selected.created_at).toLocaleString('es-AR')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p>{selected.email}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Telefono:</span>
                    <p>{selected.phone}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Provincia:</span>
                    <p>{selected.province}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Hectareas:</span>
                    <p>{selected.hectares?.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Actividad:</span>
                    <p>{selected.activity}</p>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Descripcion:</span>
                  <p className="mt-1 whitespace-pre-wrap">{selected.description}</p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
