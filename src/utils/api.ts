import axios from 'axios';
import type {
  Project,
  Record,
  Template,
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateRecordRequest,
  UpdateRecordRequest,
  ExportRequest,
  ApiResponse,
  UploadResponse,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.error || error.message || '请求失败';
    return Promise.reject(new Error(message));
  }
);

// 项目相关API
export const projectApi = {
  // 获取所有项目
  getProjects: (): Promise<ApiResponse<Project[]>> =>
    api.get('/projects'),

  // 获取单个项目
  getProject: (id: number): Promise<ApiResponse<Project>> =>
    api.get(`/projects/${id}`),

  // 创建项目
  createProject: (data: CreateProjectRequest): Promise<ApiResponse<Project>> =>
    api.post('/projects', data),

  // 更新项目
  updateProject: (id: number, data: UpdateProjectRequest): Promise<ApiResponse<Project>> =>
    api.put(`/projects/${id}`, data),

  // 删除项目
  deleteProject: (id: number): Promise<void> =>
    api.delete(`/projects/${id}`),
};

// 记录相关API
export const recordApi = {
  // 获取项目的记录
  getRecordsByProject: (projectId: number): Promise<ApiResponse<Record[]>> =>
    api.get(`/records/project/${projectId}`),

  // 创建记录
  createRecord: (data: CreateRecordRequest): Promise<ApiResponse<Record>> =>
    api.post('/records', data),

  // 更新记录
  updateRecord: (id: number, data: UpdateRecordRequest): Promise<ApiResponse<Record>> =>
    api.put(`/records/${id}`, data),

  // 删除记录
  deleteRecord: (id: number): Promise<void> =>
    api.delete(`/records/${id}`),
};

// 文件上传API
export const uploadApi = {
  // 上传文件
  uploadFiles: (files: FileList): Promise<ApiResponse<UploadResponse>> => {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });
    
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// 模板和导出相关API
export const exportApi = {
  // 获取模板列表
  getTemplates: (): Promise<ApiResponse<Template[]>> =>
    api.get('/export/templates'),

  // 生成导出图片
  generateExport: (data: ExportRequest): Promise<ApiResponse<{ filename: string; url: string }>> =>
    api.post('/export/generate', data),
};

export default api; 