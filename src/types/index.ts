export interface Property {
  id: number
  title_es: string
  title_en: string
  description_es: string
  description_en: string
  full_description_es: string
  full_description_en: string
  price: string
  hectares: number
  province: string
  zone: string
  location: string
  activity_es: string
  activity_en: string
  status_es: string
  status_en: string
  visible: boolean
  featured: boolean
  whatsapp_message_es: string
  whatsapp_message_en: string
  lat: number | null
  lon: number | null
  characteristics: Characteristic[]
  features: Feature[]
  images: PropertyImage[]
  created_at: string
  updated_at: string
}

export interface Characteristic {
  id?: number
  label_es: string
  label_en: string
  value: string
}

export interface Feature {
  id?: number
  text_es: string
  text_en: string
}

export interface PropertyImage {
  id: number
  url: string
  position: number
}

export interface PublishRequest {
  id: number
  name: string
  email: string
  phone: string
  province: string
  hectares: number
  activity: string
  description: string
  read: boolean
  created_at: string
}

export interface DashboardStats {
  total_properties: number
  visible_properties: number
  unread_requests: number
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
}

export type PropertyFormData = Omit<Property, 'id' | 'images' | 'created_at' | 'updated_at'>
