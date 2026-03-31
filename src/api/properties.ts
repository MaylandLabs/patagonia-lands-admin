import api from './client'
import type { Property, PropertyFormData } from '@/types'

interface PaginatedResponse<T> {
  data: T[]
  pagination: { total: number; page: number; limit: number; pages: number }
}

export async function getProperties(params?: { search?: string; province?: string; page?: number; limit?: number; visible?: boolean }) {
  const { data } = await api.get<PaginatedResponse<Property>>('/properties/admin/list', { params })
  return data
}

export async function getProperty(id: number) {
  const { data } = await api.get<Property>(`/properties/${id}`)
  return data
}

export async function createProperty(property: PropertyFormData) {
  const { data } = await api.post<Property>('/properties/admin', property)
  return data
}

export async function updateProperty(id: number, property: Partial<PropertyFormData>) {
  const { data } = await api.put<Property>(`/properties/admin/${id}`, property)
  return data
}

export async function deleteProperty(id: number) {
  await api.delete(`/properties/admin/${id}`)
}

export async function toggleVisibility(id: number) {
  const { data } = await api.patch(`/properties/admin/${id}/visibility`)
  return data
}

export async function toggleFeatured(id: number) {
  const { data } = await api.patch(`/properties/admin/${id}/featured`)
  return data
}

export async function uploadImages(propertyId: number, files: File[]) {
  const formData = new FormData()
  files.forEach((file) => formData.append('images', file))
  const { data } = await api.post(`/properties/admin/${propertyId}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function deleteImage(propertyId: number, imageId: number) {
  await api.delete(`/properties/admin/${propertyId}/images/${imageId}`)
}

export async function reorderImages(propertyId: number, order: { id: number; position: number }[]) {
  await api.put(`/properties/admin/${propertyId}/images/reorder`, { order })
}
