// src/pages/apps/management/index.tsx
import type { FC } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Tabs } from 'antd'; // 从antd导入Breadcrumb

// 应用设置子页面
const AppSettings: FC<{ appId: string }> = ({ appId }) => {
  return <div>应用 {appId} 的设置内容</div>;
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

      <Card title={`应用 ${appId} 管理`}>
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