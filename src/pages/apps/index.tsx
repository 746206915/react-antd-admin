import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { Card, List, Button, message, Spin, Badge, Space, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { PlusOutlined, SettingOutlined } from '@ant-design/icons';

import AddAppModal from '@/pages/components/app/AddAppModal';
import { getAppList, addApp } from '@/api/app.api'; // 导入API
import type { AppItem } from '@/interface/app.interface'; // 导入类型定义


import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';

// 简单状态样式映射（避免类型复杂）
const getStatusConfig = (status: string) => {
  switch (status) {
    case 'Normal':
      return { color: '#52c41a', text: '正常', icon: <CheckCircleOutlined /> };
    case 'Stop':
      return { color: '#f5222d', text: '禁用', icon: <CloseCircleOutlined /> };
    default:
      return { color: '#888', text: status, icon: null };
  }
};

const AppsListPage: FC = () => {
  const navigate = useNavigate();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [appList, setAppList] = useState<AppItem[]>([]); // 存储应用列表数据
  const [isLoading, setIsLoading] = useState(true); // 列表加载状态
  const [isCreating, setIsCreating] = useState(false); // 创建应用状态
  const [loadError, setLoadError] = useState(false); // 加载错误状态

  // 获取应用列表数据
  const fetchAppList = async () => {
    try {
      setIsLoading(true);
      setLoadError(false);
      const response = await getAppList();
      setAppList(response.result || []); // 假设接口返回格式为 { result: AppItem[] }
    } catch (error) {
      setLoadError(true);
      console.error('Failed to fetch app list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 初始化加载列表
  useEffect(() => {
    fetchAppList();
  }, []);

  // 进入应用管理页面
  const handleEnterApp = (appId: string) => {
    navigate(`/apps/${appId}/management`);
  };

  const handleEnterAppUsers = (appId: string) => {
    navigate(`/apps/${appId}/users`);
  };

  // 打开新建应用模态框
  const handleOpenModal = () => {
    setModalVisible(true);
  };

  // 关闭新建应用模态框
  const handleCloseModal = () => {
    setModalVisible(false);
  };

  // 提交新建应用表单
  const handleSubmitApp = async (values: { name: string }) => {
    try {
      setIsCreating(true);
      await addApp({ name: values.name });
      message.success("应用创建成功");
      handleCloseModal();
      fetchAppList(); // 重新获取列表数据
    } catch (error) {
      message.error("应用创建失败");
      console.error('Failed to create app:', error);
    } finally {
      setIsCreating(false);
    }
  };

  // 错误处理
  if (loadError) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <p>
          应用列表加载失败
        </p>
        <Button 
          onClick={fetchAppList} 
          style={{ marginTop: 16 }}
        >
          重试
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card
        className="page-header"
        title="应用列表"
        extra={[
          <Button 
            key="add" 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleOpenModal}
            disabled={isCreating}
          >
            新建应用
          </Button>,
        ]}
      >
        <Spin spinning={isLoading || isCreating}>
          <List<AppItem>
            grid={{ 
              gutter: 16, 
              column: 1, 
              xs: 1, 
              sm: 2, 
              md: 3, 
              lg: 3, 
              xl: 4, 
              xxl: 4 
            }}
            dataSource={appList}
            renderItem={(item) => (
              <List.Item key={item.ID}>
                <Card 
                  hoverable
                  actions={[
                    <div>
                    <Button 
                      type="text" 
                      icon={<SettingOutlined />}
                      onClick={() => handleEnterApp(item.ID)}
                    >
                      管理应用
                    </Button>
                    <Button 
                      type="text" 
                      icon={<SettingOutlined />}
                      onClick={() => handleEnterAppUsers(item.ID)}
                    >
                      用户列表
                    </Button>
            </div>
                  ]}
                >
                  <Card.Meta 
  title={
    <Typography.Title level={5} style={{ margin: 0 }}>
      应用名: {item.Name}
    </Typography.Title>
  }
  description={
    <Space direction="vertical" size="small" style={{ width: '100%' }}>
      {/* ID 信息 - 使用 Typography.Text 保持与项目中文本样式一致 */}
      <Typography.Text>
        ID: <Typography.Text strong>{item.ID}</Typography.Text>
      </Typography.Text>

      {/* 描述信息 - 条件渲染 */}
      <Typography.Text>
          描述: <Typography.Text type="secondary">{item.Description}</Typography.Text>
        </Typography.Text>

      {/* 状态信息 - 与 overview.tsx 中 Badge 使用方式统一 */}
      <Space align="center">
        <Typography.Text type="secondary">应用状态:</Typography.Text>
        <Badge 
          color={getStatusConfig(item.Status).color}
          text={
            <Space size="small" align="center">
              {getStatusConfig(item.Status).icon}
              <span>{getStatusConfig(item.Status).text}</span>
            </Space>
          }
        />
      </Space>
    </Space>
  }
/>
                </Card>
              </List.Item>
            )}
            locale={{
              emptyText: "应用列表为空"
            }}
          />
        </Spin>
      </Card>

      {/* 新建应用模态框 */}
      <AddAppModal
        visible={modalVisible}
        onCancel={handleCloseModal}
        onSubmit={handleSubmitApp}
        loading={isCreating}
      />
    </div>
  );
};

export default AppsListPage;