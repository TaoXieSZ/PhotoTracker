import React, { useState, useEffect } from 'react';
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
  Image,
  Spin 
} from 'antd';
import { UploadOutlined, ArrowLeftOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { recordApi, uploadApi, projectApi } from '../utils/api';
import type { UpdateRecordRequest } from '../types';

const { Title } = Typography;
const { TextArea } = Input;

const EditRecord: React.FC = () => {
  const { projectId, recordId } = useParams<{ projectId: string; recordId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const projectIdNum = parseInt(projectId || '0');
  const recordIdNum = parseInt(recordId || '0');

  // 获取项目详情
  const { data: project } = useQuery(
    ['project', projectIdNum],
    async () => {
      const response = await projectApi.getProject(projectIdNum);
      return response.data;
    },
    {
      enabled: !!projectIdNum,
    }
  );

  // 获取记录详情
  const { data: record, isLoading } = useQuery(
    ['record', recordIdNum],
    async () => {
      const allRecords = await recordApi.getRecordsByProject(projectIdNum);
      const record = allRecords.data.find(r => r.id === recordIdNum);
      if (!record) throw new Error('记录不存在');
      return record;
    },
    {
      enabled: !!recordIdNum && !!projectIdNum,
      onError: (error: Error) => {
        message.error(error.message);
        navigate(`/projects/${projectIdNum}`);
      },
    }
  );

  // 更新记录
  const updateMutation = useMutation(
    (data: UpdateRecordRequest) => recordApi.updateRecord(recordIdNum, data),
    {
      onSuccess: () => {
        message.success('Memory updated! ✨');
        queryClient.invalidateQueries(['records', projectIdNum]);
        navigate(`/projects/${projectIdNum}`);
      },
      onError: (error: Error) => {
        message.error(error.message || 'Update failed 😅');
      },
    }
  );

  useEffect(() => {
    if (record) {
      form.setFieldsValue({
        title: record.title,
        content: record.content,
        record_date: dayjs(record.record_date),
      });
      
      // 解析图片列表
      try {
        const imageList = record.images ? JSON.parse(record.images) : [];
        setImages(imageList);
      } catch (error) {
        setImages([]);
      }
    }
  }, [record, form]);

  const handleSubmit = async (values: any) => {
    const requestData: UpdateRecordRequest = {
      title: values.title,
      content: values.content || '',
      images: images,
      record_date: values.record_date.format('YYYY-MM-DD'),
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
              onClick={() => navigate(`/projects/${projectIdNum}`)}
            >
              Back to moment
            </Button>
          </Space>
        </div>

        <Title level={2}>
          Edit memory
          {project && <span style={{ color: '#666', fontSize: '16px' }}> • {project.name}</span>}
        </Title>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
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

          <Form.Item label="Manage photos 📸">
            <div>
              <Upload {...uploadProps}>
                <Button 
                  icon={<UploadOutlined />} 
                  loading={uploading}
                >
                  {uploading ? 'Uploading...' : 'Add more photos'}
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
                loading={updateMutation.isLoading}
                size="large"
              >
                Save changes ✨
              </Button>
              <Button 
                onClick={() => navigate(`/projects/${projectIdNum}`)}
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

export default EditRecord; 