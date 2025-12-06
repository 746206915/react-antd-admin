// src/pages/apps/index.tsx
import type { FC } from 'react';
import { Card, List, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { PlusOutlined, SettingOutlined } from '@ant-design/icons';

// 应用数据类型定义
interface AppItem {
  id: string;
  name: string;
  description: string;
  user_number: number;
}

// 模拟应用列表数据
const mockAppList: AppItem[] = [
  {
    id: '1',
    name: '用户管理系统',
    description: '用于管理系统用户及权限',
    user_number: 38
  },
  {
    id: '2',
    name: '数据分析平台',
    description: '实时分析业务数据',
    user_number: 467
  },
];

const AppsListPage: FC = () => {
  const navigate = useNavigate();

  // 进入应用管理页面
  const handleEnterApp = (appId: string) => {
    navigate(`/apps/${appId}/management`);
  };

  return (
    
    <div style={{ padding: '24px' }}>
      <Card
      className="page-header"
      title="应用列表"
      extra={[
        <Button key="add" type="primary" icon={<PlusOutlined />}>
          新建应用
        </Button>,
      ]}
    >
      <List<AppItem>
        grid={{ gutter: 16, column: 1, xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 4 }}
        dataSource={mockAppList}
        renderItem={(item) => (
          <List.Item>
            <Card 
              hoverable
              actions={[
                <Button 
                  type="text" 
                  icon={<SettingOutlined />}
                  onClick={() => handleEnterApp(item.id)}
                >
                  管理应用
                </Button>
              ]}
            >
              <Card.Meta 
                title={item.name}
                description={
                  <>
                    <p>{item.description}</p>
                    <p style={{ marginTop: '8px', color: '#666' }}>用户数量: {item.user_number}</p>
                  </>
                }
              />
            </Card>
          </List.Item>
        )}
      />
    </Card>

      
    </div>
  );
};

export default AppsListPage;