// src/pages/apps/management/index.tsx
import React from 'react';
import type { FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Tabs, Form, message, Input, Space, Button } from 'antd'; // 从antd导入Breadcrumb
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';

// 应用设置子页面
// 应用设置表单类型定义
interface AppSettingsFormValues {
  name: string;
  description: string;
  // 可根据实际需求添加更多字段
}

// 应用设置子页面（带表单）
const AppSettings: FC<{ appId: string }> = ({ appId }) => {
  const [form] = Form.useForm<AppSettingsFormValues>();
  const navigate = useNavigate();

  // 模拟初始数据加载
  const loadAppData = async () => {
    // 实际项目中替换为API请求
    form.setFieldsValue({
      name: `应用${appId}`,
      description: `这是应用${appId}的描述信息`
    });
  };

  // 组件挂载时加载数据
  React.useEffect(() => {
    loadAppData();
  }, [appId]);

  // 表单提交处理
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      // 实际项目中替换为API请求
      console.log('提交应用设置:', { appId, ...values });
      message.success('应用设置修改成功');
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <Form<AppSettingsFormValues>
        form={form}
        layout="vertical"
        initialValues={{ name: '', description: '' }}
      >
        <Form.Item
          name="name"
          label="应用名称"
          rules={[{ required: true, message: '请输入应用名称' }]}
        >
          <Input placeholder="请输入应用名称" />
        </Form.Item>

        <Form.Item
          name="description"
          label="应用描述"
          rules={[{ required: true, message: '请输入应用描述' }]}
        >
          <Input.TextArea rows={4} placeholder="请输入应用描述" />
        </Form.Item>

        {/* 可根据需要添加更多表单字段 */}

        <Form.Item>
          <Space>
            <Button 
              type="primary" 
              icon={<SaveOutlined />} 
              onClick={handleSubmit}
            >
              保存设置
            </Button>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/apps')}
            >
              返回列表
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

// 应用数据子页面
const AppData: FC<{ appId: string }> = ({ appId }) => {
  return <div>应用 {appId} 的数据统计</div>;
};

// 应用成员子页面
const AppMembers: FC<{ appId: string }> = ({ appId }) => {
  return <div>应用 {appId} 的成员管理</div>;
};

const AppManagementPage: FC = () => {
  // 明确指定useParams的返回类型
  const { appId } = useParams();
//   const params = useParams<{ appId: string }>();
//   const appId = params?.appId;
  
  if (!appId) return null;

  return (
    <div style={{ padding: '24px' }}>

      <Card title={`应用ID: ${appId} `}>
        <Tabs defaultActiveKey="settings">
          <Tabs.TabPane tab="基本设置" key="settings">
            <AppSettings appId={appId} />
          </Tabs.TabPane>
          <Tabs.TabPane tab="数据统计" key="data">
            <AppData appId={appId} />
          </Tabs.TabPane>
          <Tabs.TabPane tab="成员管理" key="members">
            <AppMembers appId={appId} />
          </Tabs.TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default AppManagementPage;