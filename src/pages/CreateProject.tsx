import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'react-query';
import { 
  Card, 
  Form, 
  Input, 
  DatePicker, 
  Button, 
  Upload, 
  message, 
  Typography,
  Space 
} from 'antd';
import { UploadOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { projectApi, uploadApi } from '../utils/api';
import type { CreateProjectRequest } from '../types';

const { Title } = Typography;
const { TextArea } = Input;

const CreateProject: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [coverImage, setCoverImage] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  // 创建项目
  const createMutation = useMutation(
    (data: CreateProjectRequest) => projectApi.createProject(data),
    {
      onSuccess: (response) => {
        message.success('Moment created! ✨');
        navigate(`/projects/${response.data.id}`);
      },
      onError: (error: Error) => {
        message.error(error.message || 'Oops, something went wrong!');
      },
    }
  );

  const handleSubmit = async (values: any) => {
    const requestData: CreateProjectRequest = {
      name: values.name,
      description: values.description || '',
      start_date: values.start_date.format('YYYY-MM-DD'),
      cover_image: coverImage,
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
        setCoverImage(response.data.files[0]);
        message.success('封面图上传成功');
      }
    } catch (error) {
      message.error('上传失败');
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

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 24 }}>
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/projects')}
            >
              Back to moments
            </Button>
          </Space>
        </div>

        <Title level={2}>Create a new moment</Title>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            start_date: dayjs(),
          }}
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
                  {uploading ? 'Uploading...' : 'Add a cover photo 📸'}
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
                loading={createMutation.isLoading}
                size="large"
              >
                Create moment ✨
              </Button>
              <Button 
                onClick={() => navigate('/projects')}
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

export default CreateProject; 