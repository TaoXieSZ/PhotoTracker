export interface Project {
  id: number;
  name: string;
  description: string;
  start_date: string;
  cover_image: string;
  created_at: string;
  updated_at: string;
}

export interface Record {
  id: number;
  project_id: number;
  title: string;
  content: string;
  images: string;
  record_date: string;
  days_from_start: number;
  created_at: string;
}

export interface Template {
  id: number;
  name: string;
  layout: string;
  style: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  start_date: string;
  cover_image?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  start_date?: string;
  cover_image?: string;
}

export interface CreateRecordRequest {
  project_id: number;
  title: string;
  content?: string;
  images?: string[];
  record_date: string;
}

export interface UpdateRecordRequest {
  title?: string;
  content?: string;
  images?: string[];
  record_date?: string;
}

export interface ExportRequest {
  project_id: number;
  template_id: number;
  record_ids: number[];
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface UploadResponse {
  files: string[];
} 