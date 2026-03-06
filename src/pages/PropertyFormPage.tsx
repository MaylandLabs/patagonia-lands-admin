import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm, useFieldArray, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProperty, createProperty, updateProperty, uploadImages, deleteImage, reorderImages } from '@/api/properties'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { useToast } from '@/components/ui/toast'
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Plus, Trash2, GripVertical, Upload, X, ArrowLeft } from 'lucide-react'
import type { PropertyImage } from '@/types'

const PROVINCES = ['Santa Cruz', 'Tierra del Fuego', 'Chubut', 'Rio Negro', 'Neuquen']

const schema = z.object({
  title_es: z.string().min(1, 'Requerido'),
  title_en: z.string().optional().default(''),
  title_pt: z.string().optional().default(''),
  description_es: z.string().optional().default(''),
  description_en: z.string().optional().default(''),
  description_pt: z.string().optional().default(''),
  full_description_es: z.string().optional().default(''),
  full_description_en: z.string().optional().default(''),
  full_description_pt: z.string().optional().default(''),
  price: z.coerce.number().min(0),
  hectares: z.coerce.number().min(0),
  province: z.string().min(1, 'Requerido'),
  zone: z.string().optional().default(''),
  location: z.string().optional().default(''),
  activity_es: z.string().optional().default(''),
  activity_en: z.string().optional().default(''),
  activity_pt: z.string().optional().default(''),
  status_es: z.string().optional().default(''),
  status_en: z.string().optional().default(''),
  status_pt: z.string().optional().default(''),
  google_maps_url: z.string().optional().default(''),
  whatsapp_message_es: z.string().optional().default(''),
  whatsapp_message_en: z.string().optional().default(''),
  whatsapp_message_pt: z.string().optional().default(''),
  visible: z.boolean().default(false),
  featured: z.boolean().default(false),
  characteristics: z.array(z.object({
    label_es: z.string(),
    label_en: z.string(),
    label_pt: z.string(),
    value: z.string(),
  })).default([]),
  features: z.array(z.object({
    text_es: z.string(),
    text_en: z.string(),
    text_pt: z.string(),
  })).default([]),
})

type FormData = z.infer<typeof schema>

function SortableImage({ image, onDelete }: { image: PropertyImage; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: image.id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <div ref={setNodeRef} style={style} className="relative group border rounded-md overflow-hidden w-32 h-32">
      <img src={image.url} alt="" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <button {...attributes} {...listeners} className="text-white cursor-grab"><GripVertical className="h-5 w-5" /></button>
        <button onClick={onDelete} className="text-white"><X className="h-5 w-5" /></button>
      </div>
    </div>
  )
}

export default function PropertyFormPage() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [images, setImages] = useState<PropertyImage[]>([])

  const { data: property } = useQuery({
    queryKey: ['property', id],
    queryFn: () => getProperty(Number(id)),
    enabled: isEdit,
  })

  const { register, handleSubmit, control, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as never,
    defaultValues: {
      visible: false,
      featured: false,
      characteristics: [],
      features: [],
    },
  })

  const { fields: charFields, append: appendChar, remove: removeChar } = useFieldArray({ control, name: 'characteristics' })
  const { fields: featFields, append: appendFeat, remove: removeFeat } = useFieldArray({ control, name: 'features' })

  useEffect(() => {
    if (property) {
      reset({
        title_es: property.title_es,
        title_en: property.title_en,
        title_pt: property.title_pt,
        description_es: property.description_es,
        description_en: property.description_en,
        description_pt: property.description_pt,
        full_description_es: property.full_description_es,
        full_description_en: property.full_description_en,
        full_description_pt: property.full_description_pt,
        price: property.price,
        hectares: property.hectares,
        province: property.province,
        zone: property.zone,
        location: property.location,
        activity_es: property.activity_es,
        activity_en: property.activity_en,
        activity_pt: property.activity_pt,
        status_es: property.status_es,
        status_en: property.status_en,
        status_pt: property.status_pt,
        google_maps_url: property.google_maps_url,
        whatsapp_message_es: property.whatsapp_message_es,
        whatsapp_message_en: property.whatsapp_message_en,
        whatsapp_message_pt: property.whatsapp_message_pt,
        visible: property.visible,
        featured: property.featured,
        characteristics: property.characteristics ?? [],
        features: property.features ?? [],
      })
      setImages(property.images ?? [])
    }
  }, [property, reset])

  const saveMutation = useMutation({
    mutationFn: (data: FormData) =>
      isEdit ? updateProperty(Number(id), data) : createProperty(data as FormData & { images: never[] }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      toast({ title: isEdit ? 'Propiedad actualizada' : 'Propiedad creada' })
      if (!isEdit && result?.id) navigate(`/propiedades/${result.id}/editar`)
    },
    onError: () => toast({ title: 'Error al guardar', variant: 'destructive' }),
  })

  const onSubmit: SubmitHandler<FormData> = (data) => saveMutation.mutate(data)

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length || !id) return
    try {
      const result = await uploadImages(Number(id), Array.from(e.target.files))
      setImages(result.images ?? [])
      toast({ title: 'Imagenes subidas' })
    } catch {
      toast({ title: 'Error al subir imagenes', variant: 'destructive' })
    }
    e.target.value = ''
  }, [id, toast])

  const handleDeleteImage = useCallback(async (imageId: number) => {
    if (!id) return
    try {
      await deleteImage(Number(id), imageId)
      setImages((prev) => prev.filter((img) => img.id !== imageId))
      toast({ title: 'Imagen eliminada' })
    } catch {
      toast({ title: 'Error al eliminar imagen', variant: 'destructive' })
    }
  }, [id, toast])

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id || !id) return
    const oldIndex = images.findIndex((img) => img.id === active.id)
    const newIndex = images.findIndex((img) => img.id === over.id)
    const newImages = arrayMove(images, oldIndex, newIndex)
    setImages(newImages)
    try {
      await reorderImages(Number(id), newImages.map((img) => img.id))
    } catch {
      toast({ title: 'Error al reordenar', variant: 'destructive' })
    }
  }, [images, id, toast])

  const provinceValue = watch('province')

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/propiedades')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">{isEdit ? 'Editar propiedad' : 'Nueva propiedad'}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl">
        {/* Titulos */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Titulos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Titulo (ES) *</Label>
              <Input {...register('title_es')} />
              {errors.title_es && <p className="text-xs text-destructive">{errors.title_es.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Titulo (EN)</Label>
              <Input {...register('title_en')} />
            </div>
            <div className="space-y-2">
              <Label>Titulo (PT)</Label>
              <Input {...register('title_pt')} />
            </div>
          </div>
        </section>

        {/* Descripciones cortas */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Descripciones cortas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['es', 'en', 'pt'] as const).map((lang) => (
              <div key={lang} className="space-y-2">
                <Label>Descripcion ({lang.toUpperCase()})</Label>
                <Textarea {...register(`description_${lang}`)} rows={3} />
              </div>
            ))}
          </div>
        </section>

        {/* Descripciones completas */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Descripciones completas</h2>
          <div className="space-y-4">
            {(['es', 'en', 'pt'] as const).map((lang) => (
              <div key={lang} className="space-y-2">
                <Label>Descripcion completa ({lang.toUpperCase()})</Label>
                <Textarea {...register(`full_description_${lang}`)} rows={5} />
              </div>
            ))}
          </div>
        </section>

        {/* Datos principales */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Datos principales</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Precio (USD) *</Label>
              <Input type="number" {...register('price')} />
              {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Hectareas *</Label>
              <Input type="number" {...register('hectares')} />
              {errors.hectares && <p className="text-xs text-destructive">{errors.hectares.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Provincia *</Label>
              <Select value={provinceValue} onValueChange={(v) => setValue('province', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {PROVINCES.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.province && <p className="text-xs text-destructive">{errors.province.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Zona</Label>
              <Input {...register('zone')} />
            </div>
            <div className="space-y-2">
              <Label>Ubicacion</Label>
              <Input {...register('location')} />
            </div>
            <div className="space-y-2">
              <Label>Google Maps URL</Label>
              <Input {...register('google_maps_url')} />
            </div>
          </div>
        </section>

        {/* Actividad y estado */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Actividad y estado</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['es', 'en', 'pt'] as const).map((lang) => (
              <div key={`act-${lang}`} className="space-y-2">
                <Label>Actividad ({lang.toUpperCase()})</Label>
                <Input {...register(`activity_${lang}`)} />
              </div>
            ))}
            {(['es', 'en', 'pt'] as const).map((lang) => (
              <div key={`st-${lang}`} className="space-y-2">
                <Label>Estado ({lang.toUpperCase()})</Label>
                <Input {...register(`status_${lang}`)} />
              </div>
            ))}
          </div>
        </section>

        {/* Mensajes WhatsApp */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Mensajes de WhatsApp</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['es', 'en', 'pt'] as const).map((lang) => (
              <div key={lang} className="space-y-2">
                <Label>Mensaje ({lang.toUpperCase()})</Label>
                <Textarea {...register(`whatsapp_message_${lang}`)} rows={3} />
              </div>
            ))}
          </div>
        </section>

        {/* Caracteristicas */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="text-lg font-semibold">Caracteristicas</h2>
            <Button type="button" variant="outline" size="sm" onClick={() => appendChar({ label_es: '', label_en: '', label_pt: '', value: '' })}>
              <Plus className="h-4 w-4 mr-1" /> Agregar
            </Button>
          </div>
          {charFields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-5 gap-3 items-end">
              <div className="space-y-1">
                <Label className="text-xs">Label ES</Label>
                <Input {...register(`characteristics.${index}.label_es`)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Label EN</Label>
                <Input {...register(`characteristics.${index}.label_en`)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Label PT</Label>
                <Input {...register(`characteristics.${index}.label_pt`)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Valor</Label>
                <Input {...register(`characteristics.${index}.value`)} />
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => removeChar(index)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </section>

        {/* Features */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="text-lg font-semibold">Features</h2>
            <Button type="button" variant="outline" size="sm" onClick={() => appendFeat({ text_es: '', text_en: '', text_pt: '' })}>
              <Plus className="h-4 w-4 mr-1" /> Agregar
            </Button>
          </div>
          {featFields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-4 gap-3 items-end">
              <div className="space-y-1">
                <Label className="text-xs">Texto ES</Label>
                <Input {...register(`features.${index}.text_es`)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Texto EN</Label>
                <Input {...register(`features.${index}.text_en`)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Texto PT</Label>
                <Input {...register(`features.${index}.text_pt`)} />
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => removeFeat(index)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </section>

        {/* Imagenes (solo en edicion) */}
        {isEdit && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">Imagenes</h2>
            <div className="flex flex-wrap gap-3">
              <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={images.map((img) => img.id)} strategy={rectSortingStrategy}>
                  {images.map((img) => (
                    <SortableImage key={img.id} image={img} onDelete={() => handleDeleteImage(img.id)} />
                  ))}
                </SortableContext>
              </DndContext>
              <label className="w-32 h-32 border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                <span className="text-xs text-muted-foreground">Subir</span>
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
          </section>
        )}

        {/* Toggles */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Visibilidad</h2>
          <div className="flex gap-8">
            <div className="flex items-center gap-3">
              <Switch checked={watch('visible')} onCheckedChange={(v) => setValue('visible', v)} />
              <Label>Visible</Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={watch('featured')} onCheckedChange={(v) => setValue('featured', v)} />
              <Label>Destacada</Label>
            </div>
          </div>
        </section>

        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Guardando...' : 'Guardar'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/propiedades')}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}
