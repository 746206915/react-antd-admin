// src/pages/account/index.tsx
import type { FC } from 'react';
import { Card, Typography } from 'antd';
import { LocaleFormatter } from '@/locales';

const { Title, Paragraph } = Typography;

const PersonalCenterPage: FC = () => {
  return (
    <Card className="personal-center-container">
      <Title level={2}>
        <LocaleFormatter id="title.personalCenter" />
      </Title>
      <Paragraph>
        <LocaleFormatter id="app.personal.center.description" />
      </Paragraph>
      {/* 这里可以添加个人中心的具体内容 */}
    </Card>
  );
};

export default PersonalCenterPage;