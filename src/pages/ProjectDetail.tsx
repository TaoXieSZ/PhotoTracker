import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { message } from 'antd';
import { 
  ArrowLeftOutlined, 
  EditOutlined, 
  PlusOutlined, 
  ExportOutlined,
  DeleteOutlined,
  CalendarOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { projectApi, recordApi } from '../utils/api';
import type { Record } from '../types';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const projectId = parseInt(id || '0');

  // 获取项目详情
  const { data: project } = useQuery(
    ['project', projectId],
    async () => {
      const response = await projectApi.getProject(projectId);
      return response.data;
    },
    {
      enabled: !!projectId,
    }
  );

  // 获取项目记录
  const { data: records } = useQuery(
    ['records', projectId],
    async () => {
      const response = await recordApi.getRecordsByProject(projectId);
      return response.data;
    },
    {
      enabled: !!projectId,
    }
  );

  // 删除记录
  const deleteMutation = useMutation(
    (id: number) => recordApi.deleteRecord(id),
    {
      onSuccess: () => {
        message.success('Memory deleted 💔');
        queryClient.invalidateQueries(['records', projectId]);
      },
      onError: (error: Error) => {
        message.error(error.message || 'Delete failed');
      },
    }
  );

  const handleDeleteRecord = (record: Record, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Delete "${record.title}"? 💔\nThis memory will be gone forever.`)) {
      deleteMutation.mutate(record.id);
    }
  };

  const handleEditRecord = (record: Record) => {
    navigate(`/projects/${projectId}/records/${record.id}/edit`);
  };

  if (!project) {
    return (
      <div className="mac-loading-state">
        <div className="mac-spinner"></div>
        <p>加载中...</p>
      </div>
    );
  }

  return (
    <div className="mac-page">
      {/* 项目返回按钮 */}
      <div className="mac-breadcrumb">
        <button 
          className="mac-breadcrumb-btn"
          onClick={() => navigate('/projects')}
        >
          <ArrowLeftOutlined />
          Back to moments
        </button>
      </div>

      {/* 项目详情头部 */}
      <div className="mac-project-hero">
        <div className="mac-project-hero-cover">
          {project.cover_image ? (
            <img
              src={`/uploads/${project.cover_image}`}
              alt={project.name}
              className="mac-project-hero-cover-img"
            />
          ) : (
            <div className="mac-project-hero-cover-placeholder">
              <span className="mac-hero-placeholder-icon">✨</span>
            </div>
          )}
        </div>
        
        <div className="mac-project-hero-info">
          <h1 className="mac-project-hero-title">{project.name}</h1>
          {project.description && (
            <p className="mac-project-hero-description">{project.description}</p>
          )}
          <div className="mac-project-hero-meta">
            <span className="mac-hero-meta-item">
              <CalendarOutlined />
              Started {dayjs(project.start_date).format('MMM DD, YYYY')}
            </span>
            <span className="mac-hero-meta-item">
              {records?.length || 0} memories captured 📸
            </span>
          </div>
          
          <div className="mac-project-actions-bar">
            <button 
              className="mac-button mac-button-primary"
              onClick={() => navigate(`/projects/${projectId}/records/create`)}
            >
              <PlusOutlined />
              Add a memory
            </button>
            <button 
              className="mac-button mac-button-secondary"
              onClick={() => navigate(`/projects/${projectId}/edit`)}
            >
              <EditOutlined />
              Edit moment
            </button>
            <button 
              className="mac-button mac-button-secondary"
              onClick={() => navigate(`/projects/${projectId}/export`)}
            >
              <ExportOutlined />
              Create share
            </button>
          </div>
        </div>
      </div>

      {/* 记录时间线 */}
      <div className="mac-timeline-section">
        <h2 className="mac-section-title">Memory lane 💫</h2>
        
        {records && records.length > 0 ? (
          <div className="mac-timeline">
            {records.map((record: Record) => (
              <div 
                key={record.id} 
                className="mac-timeline-item"
                onClick={() => handleEditRecord(record)}
              >
                <div className="mac-timeline-dot"></div>
                <div className="mac-timeline-content">
                  <div className="mac-timeline-card">
                    <div className="mac-timeline-header">
                      <h3 className="mac-timeline-title">{record.title}</h3>
                      <div className="mac-timeline-actions">
                        <button
                          className="mac-timeline-action-btn"
                          onClick={(e) => { e.stopPropagation(); handleEditRecord(record); }}
                          title="Edit memory"
                        >
                          <EditOutlined />
                        </button>
                        <button
                          className="mac-timeline-action-btn mac-delete-btn"
                          onClick={(e) => handleDeleteRecord(record, e)}
                          title="Delete memory"
                        >
                          <DeleteOutlined />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mac-timeline-meta">
                      <span className="mac-timeline-date">
                        {dayjs(record.record_date).format('MMM DD, YYYY')}
                      </span>
                      <span className="mac-timeline-days">
                        Day {record.days_from_start}
                      </span>
                    </div>
                    
                    {record.content && (
                      <p className="mac-timeline-description">{record.content}</p>
                    )}
                    
                    {record.images && JSON.parse(record.images).length > 0 && (
                      <div 
                        className={`mac-timeline-images ${
                          JSON.parse(record.images).length === 1 ? 'single-image' :
                          JSON.parse(record.images).length === 2 ? 'two-images' :
                          JSON.parse(record.images).length > 4 ? 'many-images' : ''
                        }`}
                      >
                        {JSON.parse(record.images).map((image: string, index: number) => (
                          <img
                            key={index}
                            src={`/uploads/${image}`}
                            alt={`${record.title} - 图片 ${index + 1}`}
                            className="mac-timeline-image"
                            loading="lazy"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mac-empty-timeline">
            <div className="mac-empty-timeline-icon">💫</div>
            <h3>No memories yet</h3>
            <p>Start capturing the magic! ✨</p>
            <button 
              className="mac-button mac-button-primary"
              onClick={() => navigate(`/projects/${projectId}/records/create`)}
            >
              <PlusOutlined />
              Add your first memory
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail; 