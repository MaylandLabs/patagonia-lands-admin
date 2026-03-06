import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getProperties, deleteProperty, togglePropertyField } from '@/api/properties'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toast'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'

const PROVINCES = ['Santa Cruz', 'Tierra del Fuego', 'Chubut', 'Rio Negro', 'Neuquen']

export default function PropertiesListPage() {
  const [search, setSearch] = useState('')
  const [province, setProvince] = useState<string>('')
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['properties', search, province],
    queryFn: () => getProperties({ search: search || undefined, province: province || undefined }),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      toast({ title: 'Propiedad eliminada' })
      setDeleteId(null)
    },
    onError: () => toast({ title: 'Error al eliminar', variant: 'destructive' }),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, field, value }: { id: number; field: 'visible' | 'featured'; value: boolean }) =>
      togglePropertyField(id, field, value),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['properties'] }),
    onError: () => toast({ title: 'Error al actualizar', variant: 'destructive' }),
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Propiedades</h1>
        <Link to="/propiedades/nueva">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Propiedad
          </Button>
        </Link>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por titulo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={province} onValueChange={setProvince}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Todas las provincias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las provincias</SelectItem>
            {PROVINCES.map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Cargando...</p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Titulo</th>
                <th className="text-left p-3 font-medium">Provincia</th>
                <th className="text-left p-3 font-medium">Hectareas</th>
                <th className="text-left p-3 font-medium">Precio</th>
                <th className="text-center p-3 font-medium">Visible</th>
                <th className="text-center p-3 font-medium">Destacada</th>
                <th className="text-right p-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {properties.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-muted-foreground">No se encontraron propiedades</td>
                </tr>
              ) : (
                properties.map((p) => (
                  <tr key={p.id} className="border-t hover:bg-muted/30">
                    <td className="p-3 font-medium">{p.title_es}</td>
                    <td className="p-3">{p.province}</td>
                    <td className="p-3">{p.hectares?.toLocaleString()}</td>
                    <td className="p-3">USD {p.price?.toLocaleString()}</td>
                    <td className="p-3 text-center">
                      <Switch
                        checked={p.visible}
                        onCheckedChange={(v) => toggleMutation.mutate({ id: p.id, field: 'visible', value: v })}
                      />
                    </td>
                    <td className="p-3 text-center">
                      <Switch
                        checked={p.featured}
                        onCheckedChange={(v) => toggleMutation.mutate({ id: p.id, field: 'featured', value: v })}
                      />
                    </td>
                    <td className="p-3 text-right space-x-1">
                      <Link to={`/propiedades/${p.id}/editar`}>
                        <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                      </Link>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(p.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar propiedad</DialogTitle>
            <DialogDescription>Esta accion no se puede deshacer. Se eliminara la propiedad permanentemente.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => deleteId && deleteMutation.mutate(deleteId)}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
