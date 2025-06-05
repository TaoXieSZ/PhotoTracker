import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Card, 
  Form, 
  Input, 
  DatePicker, 
  Button, 
  Upload, 
  message, 
  Typography,
  Space,
  Spin 
} from 'antd';
import { UploadOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { projectApi, uploadApi } from '../utils/api';
import type { UpdateProjectRequest } from '../types';

const { Title } = Typography;
const { TextArea } = Input;

const EditProject: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [coverImage, setCoverImage] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const projectId = parseInt(id || '0');

  // 获取项目详情
  const { data: project, isLoading } = useQuery(
    ['project', projectId],
    async () => {
      const response = await projectApi.getProject(projectId);
      return response.data;
    },
    {
      enabled: !!projectId,
      onError: (error: Error) => {
        message.error(error.message);
        navigate('/projects');
      },
    }
  );

  // 更新项目
  const updateMutation = useMutation(
    (data: UpdateProjectRequest) => projectApi.updateProject(projectId, data),
    {
      onSuccess: () => {
        message.success('Moment updated! ✨');
        queryClient.invalidateQueries(['project', projectId]);
        navigate(`/projects/${projectId}`);
      },
      onError: (error: Error) => {
        message.error(error.message || 'Update failed 😅');
      },
    }
  );

  useEffect(() => {
    if (project) {
      form.setFieldsValue({
        name: project.name,
        description: project.description,
        start_date: dayjs(project.start_date),
      });
      setCoverImage(project.cover_image || '');
    }
  }, [project, form]);

  const handleSubmit = async (values: any) => {
    const requestData: UpdateProjectRequest = {
      name: values.name,
      description: values.description || '',
      start_date: values.start_date.format('YYYY-MM-DD'),
      cover_image: coverImage,
    };

    updateMutation.mutate(requestData);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const fileList = new DataTransfer();
      fileList.items.add(file);
      const response = await uploadApi.uploadFiles(fileList.files);
      
      if (response.data.files.length > 0) {
        setCoverImage(response.data.files[0]);
        message.success('Cover updated! 📸');
      }
    } catch (error) {
      message.error('Upload failed 😅');
    } finally {
      setUploading(false);
    }
  };

  const uploadProps = {
    beforeUpload: (file: File) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('只能上传图片文件');
        return false;
      }
      
      const isLt5M = file.size / 1024 / 1024 < 10;
      if (!isLt5M) {
        message.error('图片大小不能超过5MB');
        return false;
      }

      handleUpload(file);
      return false;
    },
    showUploadList: false,
  };

  if (isLoading) {
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
      <Card>
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

        <Title level={2}>Edit moment</Title>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="What's this moment about?"
            rules={[{ required: true, message: 'Give your moment a name! ✨' }]}
          >
            <Input placeholder="Like: Baby's first steps, Morning workouts, Travel vibes..." />
          </Form.Item>

          <Form.Item
            name="description"
            label="Tell us more (optional)"
          >
            <TextArea 
              rows={3} 
              placeholder="What makes this moment special? Any backstory? 💫"
            />
          </Form.Item>

          <Form.Item
            name="start_date"
            label="When did it all begin?"
            rules={[{ required: true, message: 'Pick the start date! 📅' }]}
          >
            <DatePicker 
              style={{ width: '100%' }}
              placeholder="Choose when this moment started"
            />
          </Form.Item>

          <Form.Item label="Cover photo (optional)">
            <div>
              <Upload {...uploadProps}>
                <Button 
                  icon={<UploadOutlined />} 
                  loading={uploading}
                >
                  {uploading ? 'Uploading...' : 'Change cover photo 📸'}
                </Button>
              </Upload>
              
              {coverImage && (
                <div style={{ marginTop: 12 }}>
                  <img
                    src={`/uploads/${coverImage}`}
                    alt="Cover photo"
                    style={{
                      width: 200,
                      height: 150,
                      objectFit: 'cover',
                      borderRadius: 8,
                      border: '1px solid #d9d9d9',
                    }}
                  />
                </div>
              )}
            </div>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={updateMutation.isLoading}
                size="large"
              >
                Save changes ✨
              </Button>
              <Button 
                onClick={() => navigate(`/projects/${projectId}`)}
                size="large"
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default EditProject; 