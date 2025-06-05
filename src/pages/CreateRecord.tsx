import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from 'react-query';
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
  Image 
} from 'antd';
import { UploadOutlined, ArrowLeftOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { recordApi, uploadApi, projectApi } from '../utils/api';
import type { CreateRecordRequest } from '../types';

const { Title } = Typography;
const { TextArea } = Input;

const CreateRecord: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const projectId = parseInt(id || '0');

  // 获取项目详情（用于显示项目名称）
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

  // 创建记录
  const createMutation = useMutation(
    (data: CreateRecordRequest) => recordApi.createRecord(data),
    {
      onSuccess: () => {
        message.success('Memory saved! ✨');
        queryClient.invalidateQueries(['records', projectId]);
        navigate(`/projects/${projectId}`);
      },
      onError: (error: Error) => {
        message.error(error.message || 'Oops, something went wrong!');
      },
    }
  );

  const handleSubmit = async (values: any) => {
    const requestData: CreateRecordRequest = {
      project_id: projectId,
      title: values.title,
      content: values.content || '',
      images: images,
      record_date: values.record_date.format('YYYY-MM-DD'),
    };

    createMutation.mutate(requestData);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const fileList = new DataTransfer();
      fileList.items.add(file);
      const response = await uploadApi.uploadFiles(fileList.files);
      
      if (response.data.files.length > 0) {
        setImages(prev => [...prev, ...response.data.files]);
        message.success('Photo uploaded! 📸');
      }
    } catch (error) {
      message.error('Upload failed 😅');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
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
    multiple: true,
  };

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

        <Title level={2}>
          Add a memory
          {project && <span style={{ color: '#666', fontSize: '16px' }}> • {project.name}</span>}
        </Title>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            record_date: dayjs(),
          }}
        >
          <Form.Item
            name="title"
            label="What happened? ✨"
            rules={[{ required: true, message: 'Give this memory a title!' }]}
          >
            <Input placeholder="Like: First smile, Amazing workout, Perfect sunset..." />
          </Form.Item>

          <Form.Item
            name="content"
            label="Tell the story 💫"
          >
            <TextArea 
              rows={4} 
              placeholder="What made this moment special? How did it feel? Any details you want to remember..."
            />
          </Form.Item>

          <Form.Item
            name="record_date"
            label="When was this? 📅"
            rules={[{ required: true, message: 'Pick the date!' }]}
          >
            <DatePicker 
              style={{ width: '100%' }}
              placeholder="Choose when this happened"
            />
          </Form.Item>

          <Form.Item label="Add photos 📸">
            <div>
              <Upload {...uploadProps}>
                <Button 
                  icon={<UploadOutlined />} 
                  loading={uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload photos'}
                </Button>
              </Upload>
              
              {images.length > 0 && (
                <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  {images.map((image, index) => (
                    <div key={index} style={{ position: 'relative' }}>
                      <Image
                        src={`/uploads/${image}`}
                        alt={`Photo ${index + 1}`}
                        width={120}
                        height={120}
                        style={{ objectFit: 'cover', borderRadius: 8 }}
                      />
                      <Button
                        type="text"
                        icon={<DeleteOutlined />}
                        size="small"
                        style={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          background: 'rgba(0,0,0,0.5)',
                          color: 'white',
                          border: 'none',
                        }}
                        onClick={() => handleRemoveImage(index)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={createMutation.isLoading}
                size="large"
              >
                Save memory ✨
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

export default CreateRecord; 