import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { message } from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  ExportOutlined,
  CalendarOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { projectApi } from '../utils/api';
import type { Project } from '../types';

const ProjectList: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 获取项目列表
  const { data: projects, isLoading, error } = useQuery(
    'projects',
    async () => {
      const response = await projectApi.getProjects();
      return response.data;
    }
  );

  // 删除项目
  const deleteMutation = useMutation(
    (id: number) => projectApi.deleteProject(id),
    {
      onSuccess: () => {
        message.success('Project deleted successfully');
        queryClient.invalidateQueries('projects');
      },
      onError: (error: Error) => {
        message.error(error.message || 'Deletion failed');
      },
    }
  );

  const handleDelete = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Delete "${project.name}"? 💔\nThis can't be undone and will remove all memories inside.`)) {
      deleteMutation.mutate(project.id);
    }
  };

  const handleView = (project: Project) => {
    navigate(`/projects/${project.id}`);
  };

  const handleEdit = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/projects/${project.id}/edit`);
  };

  const handleExport = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/projects/${project.id}/export`);
  };

  const handleCreateNew = () => {
    navigate('/projects/create');
  };

  if (error) {
    return (
      <div className="mac-error-state">
        <div className="mac-error-icon">⚠️</div>
        <h3>Loading failed</h3>
        <p>{(error as Error).message}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mac-loading-state">
        <div className="mac-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="mac-page">
      {/* 页面头部 */}
      <div className="mac-page-header">
        <div className="mac-page-header-content">
          <div className="mac-page-title-section">
            <h1 className="mac-page-title">My moments</h1>
            <p className="mac-page-subtitle">Capture life's precious moments ✨</p>
          </div>
          <button className="mac-button mac-button-primary" onClick={handleCreateNew}>
            <PlusOutlined />
            Start a new moment
          </button>
        </div>
      </div>

      {/* 项目网格 */}
      {projects && projects.length > 0 ? (
        <div className="mac-projects-grid">
          {projects.map((project: Project) => (
            <div
              key={project.id}
              className="mac-project-card"
              onClick={() => handleView(project)}
            >
              {/* 项目封面 */}
              <div className="mac-project-cover">
                {project.cover_image ? (
                  <img
                    src={`/uploads/${project.cover_image}`}
                    alt={project.name}
                    className="mac-project-cover-img"
                  />
                ) : (
                  <div className="mac-project-cover-placeholder">
                    <span className="mac-placeholder-icon">✨</span>
                  </div>
                )}
                
                {/* 悬浮操作按钮 */}
                <div className="mac-project-actions">
                  <button
                    className="mac-action-btn mac-action-view"
                    onClick={(e) => { e.stopPropagation(); handleView(project); }}
                    title="查看项目"
                  >
                    <EyeOutlined />
                  </button>
                  <button
                    className="mac-action-btn mac-action-edit"
                    onClick={(e) => handleEdit(project, e)}
                    title="Edit moment"
                  >
                    <EditOutlined />
                  </button>
                  <button
                    className="mac-action-btn mac-action-export"
                    onClick={(e) => handleExport(project, e)}
                    title="Create share"
                  >
                    <ExportOutlined />
                  </button>
                  <button
                    className="mac-action-btn mac-action-delete"
                    onClick={(e) => handleDelete(project, e)}
                    title="Delete moment"
                  >
                    <DeleteOutlined />
                  </button>
                </div>
              </div>

              {/* 项目信息 */}
              <div className="mac-project-info">
                <h3 className="mac-project-title">{project.name}</h3>
                {project.description && (
                  <p className="mac-project-description">{project.description}</p>
                )}
                <div className="mac-project-meta">
                  <span className="mac-meta-item">
                    <CalendarOutlined />
                    Started {dayjs(project.start_date).format('MMM DD, YYYY')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mac-empty-state">
          <div className="mac-empty-icon">✨</div>
          <h3>No moments yet</h3>
          <p>Start capturing your first precious moment! 📸</p>
          <button className="mac-button mac-button-primary" onClick={handleCreateNew}>
            <PlusOutlined />
            Create your first moment
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectList; 