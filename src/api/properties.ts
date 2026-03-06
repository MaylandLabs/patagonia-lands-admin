import api from './client'
import type { Property, PropertyFormData } from '@/types'

export async function getProperties(params?: { search?: string; province?: string }) {
  const { data } = await api.get<Property[]>('/properties', { params })
  return data
}

export async function getProperty(id: number) {
  const { data } = await api.get<Property>(`/properties/${id}`)
  return data
}

export async function createProperty(property: PropertyFormData) {
  const { data } = await api.post<Property>('/properties', property)
  return data
}

export async function updateProperty(id: number, property: Partial<PropertyFormData>) {
  const { data } = await api.put<Property>(`/properties/${id}`, property)
  return data
}

export async function deleteProperty(id: number) {
  await api.delete(`/properties/${id}`)
}

export async function togglePropertyField(id: number, field: 'visible' | 'featured', value: boolean) {
  const { data } = await api.patch<Property>(`/properties/${id}`, { [field]: value })
  return data
}

export async function uploadImages(propertyId: number, files: File[]) {
  const formData = new FormData()
  files.forEach((file) => formData.append('images', file))
  const { data } = await api.post<Property>(`/properties/${propertyId}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function deleteImage(propertyId: number, imageId: number) {
  await api.delete(`/properties/${propertyId}/images/${imageId}`)
}

export async function reorderImages(propertyId: number, imageIds: number[]) {
  await api.put(`/properties/${propertyId}/images/reorder`, { image_ids: imageIds })
}
