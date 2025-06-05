import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'react-query';
import { 
  Card, 
  Button, 
  Typography, 
  Space, 
  Radio, 
  Checkbox, 
  message,
  Spin,
  Image
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { projectApi, recordApi, exportApi } from '../utils/api';
import type { Record as MemoryRecord, ExportRequest } from '../types';

const { Title, Text } = Typography;

const ExportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState<number>(1);
  const [selectedRecords, setSelectedRecords] = useState<number[]>([]);
  const [generatedImage, setGeneratedImage] = useState<string>('');
  const [generating, setGenerating] = useState(false);
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

  // 获取模板列表
  const { data: templates } = useQuery(
    'templates',
    async () => {
      const response = await exportApi.getTemplates();
      return response.data;
    }
  );

  // 生成导出图片
  const generateMutation = useMutation(
    (data: ExportRequest) => exportApi.generateExport(data),
    {
      onSuccess: (response) => {
        setGeneratedImage(response.data.filename);
        message.success('Share created! ✨');
      },
      onError: (error: Error) => {
        message.error(error.message || 'Creation failed 😅');
      },
      onSettled: () => {
        setGenerating(false);
      },
    }
  );

  const handleGenerate = () => {
    if (selectedRecords.length === 0) {
      message.warning('Pick some memories first! 📸');
      return;
    }

    setGenerating(true);
    generateMutation.mutate({
      project_id: projectId,
      template_id: selectedTemplate,
      record_ids: selectedRecords,
    });
  };

  const toggleRecordSelection = (recordId: number) => {
    setSelectedRecords(prev => 
      prev.includes(recordId) 
        ? prev.filter(id => id !== recordId)
        : [...prev, recordId]
    );
  };

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = `/uploads/${generatedImage}`;
      link.download = generatedImage;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!project || !records || !templates) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  return (
    <div>
      <Card style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 24 }}>
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate(`/projects/${projectId}`)}
            >
              Back to moment
            </Button>
          </Space>
        </div>

        <Title level={2}>Create a share • {project.name}</Title>
        <Typography.Paragraph type="secondary">
          Pick a template and memories to create something beautiful to share! ✨
        </Typography.Paragraph>
      </Card>

      <div style={{ display: 'flex', gap: 24 }}>
        {/* 左侧配置区 */}
        <div style={{ flex: 1 }}>
          {/* 模板选择 */}
          <Card title="Choose a template 🎨" style={{ marginBottom: 24 }}>
            <Radio.Group 
              value={selectedTemplate} 
              onChange={(e) => setSelectedTemplate(e.target.value)}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                {templates.map((template) => (
                  <Radio key={template.id} value={template.id}>
                    <div>
                      <Text strong>{template.name}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {template.id === 1 && 'Classic timeline layout'}
                        {template.id === 2 && 'Grid collage layout'}
                        {template.id === 3 && 'Story mode layout'}
                      </Text>
                    </div>
                  </Radio>
                ))}
              </Space>
            </Radio.Group>
          </Card>

          {/* 记录选择 */}
          <Card title="Pick your memories 💫" style={{ marginBottom: 24 }}>
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {records?.map((record: MemoryRecord) => (
                <div
                  key={record.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: '1px solid #f0f0f0',
                    cursor: 'pointer',
                  }}
                  onClick={() => toggleRecordSelection(record.id)}
                >
                  <Checkbox 
                    checked={selectedRecords.includes(record.id)}
                    style={{ marginRight: 12 }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>{record.title}</div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      {dayjs(record.record_date).format('MMM DD, YYYY')} • Day {record.days_from_start}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <Button
                type="primary"
                size="large"
                onClick={handleGenerate}
                loading={generating}
                disabled={selectedRecords.length === 0}
              >
                {generating ? 'Creating magic...' : 'Create share ✨'}
              </Button>
            </div>
          </Card>
        </div>

        {/* 右侧预览区 */}
        <div style={{ width: 400 }}>
          <Card title="Preview 👀" style={{ position: 'sticky', top: 24 }}>
            {generatedImage ? (
              <div>
                <Image
                  src={`/uploads/${generatedImage}`}
                  style={{ width: '100%', borderRadius: 8 }}
                />
                <div style={{ marginTop: 16, textAlign: 'center' }}>
                  <Button
                    type="primary"
                    size="large"
                    onClick={handleDownload}
                    style={{ width: '100%' }}
                  >
                    Download & Share 📲
                  </Button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                Your beautiful share will appear here! ✨
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExportPage; 