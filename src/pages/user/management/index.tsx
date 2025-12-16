import { useState, useEffect, useRef } from 'react';
import type { FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Tabs, Form, message, Input, Space, Button, Select, Popconfirm, Upload } from 'antd'; // 从antd导入Breadcrumb
import { SaveOutlined, ArrowLeftOutlined, UploadOutlined, ReloadOutlined, EditOutlined } from '@ant-design/icons';
import { AppUserInfo } from '@/interface/appuser.interface';

import { GetAppUserInfo } from '@/api/user.api'; // 导入API

const userStatusOptions = [
  { label: '未激活', value: 'InActive' },
  { label: '激活', value: 'Active' },
  { label: '冻结', value: 'Freeze' },
];

const formatTimeDuration = (duration: number): string => {
  // 1. 处理空值/0值
  if (!duration || duration === 0) return '0天0小时0分';

  // 2. 统一转为毫秒级时间差（兼容秒级：长度≤12位则×1000）
  const ms = duration.toString().length > 12 ? duration : duration * 1000;
  const diff = Math.abs(ms); // 取绝对值，仅保留时长

  // 3. 时间单位换算（毫秒）
  const oneMinute = 60 * 1000;
  const oneHour = 60 * oneMinute;
  const oneDay = 24 * oneHour;

  // 4. 拆解天、小时、分钟（向下取整，忽略秒数）
  const days = Math.floor(diff / oneDay);
  const hours = Math.floor((diff % oneDay) / oneHour);
  const minutes = Math.floor((diff % oneHour) / oneMinute);

  // 5. 拼接结果（智能省略0值）
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}天`);
  if (hours > 0 || (days > 0 && minutes > 0)) parts.push(`${hours}小时`);
  parts.push(`${minutes}分`);

  return parts.join('') || '0天0小时0分';
};

const UserInfo: FC<{ 
  data: AppUserInfo;
  onSave: (values: Partial<AppUserInfo>) => Promise<void>;
}> = ({ data, onSave }) => {
  const { userid } = useParams();
  const navigate = useNavigate()
  const [form] = Form.useForm();

  // 初始化表单数据（映射AppDetail字段）
  useEffect(() => {
    form.setFieldsValue({
      CreatorID: data.CreatorID,
      Usertype: data.UserType === 'CardKey' ? '卡密' : '序列号',
      Cardkey: data.Cardkey,
      Serial: data.Serial,
      Description: data.Description,
      Status: data.Status,
      CreatTime: new Date(data.CreatTime * 1000).toLocaleString('zh-CN'),
      TimeInterval: formatTimeDuration(data.TimeInterval),
      ActiveTime: data.ActiveTime  === 0 ? '无' : new Date(data.ActiveTime * 1000).toLocaleString('zh-CN'),
      EndTime: data.EndTime  === 0 ? '无' : new Date(data.EndTime * 1000).toLocaleString('zh-CN'),
      LoginTime: data.LoginTime === 0 ? '无' : new Date(data.LoginTime * 1000).toLocaleString('zh-CN'),
      LoginIp: data.LoginIp,
    });
  }, [data, form]);

  // 处理表单提交（核心修复：包裹函数，通过Form的onFinish触发）
  const handleSubmit = async () => {
    try {
      // 先验证并获取表单值
      const values = await form.validateFields();
      // 调用父组件的保存方法
      
      await onSave(values);
    } catch (error) {
      message.error('表单验证失败，请检查必填项');
      console.error(error);
    }
  };

  return (
    <div >
      <Form
        form={form}
        layout="vertical"
        // initialValues={{ name: '', description: '' }}
      >
        <Form.Item
          name="CreatorID"
          label="制卡/授权人ID"
        >
          <Input
            readOnly
          />
        </Form.Item>
        <Form.Item
          name="Usertype"
          label="用户种类"
        >
          <Input
            readOnly
          />
        </Form.Item>
        <Form.Item
          name="Cardkey"
          label="卡密"
        >
          <Input
            readOnly
          />
        </Form.Item>
        <Form.Item
          name="Serial"
          label="序列号"
        >
          <Input
            readOnly
          />
        </Form.Item>
        <Form.Item
          name="Status"
          label="用户状态"
          rules={[{ required: true, message: '请选择状态' }]} // 提示文案适配选择场景
        >
          <Select
            placeholder="请选择用户状态" // 占位符适配选择场景
            options={userStatusOptions}     // 配置下拉选项
            // style={{ width: '100%' }}    // 保持和Input一致的宽度
          />
        </Form.Item>

        <Form.Item
          name="Description"
          label="用户描述"
          rules={[{ required: true, message: '请输入用户描述' }]}
        >
          <Input.TextArea rows={4} placeholder="请输入用户描述" />
        </Form.Item>

      <Form.Item
          name="CreatTime"
          label="创建时间"
        >
          <Input
            readOnly
          />
        </Form.Item>

        <Form.Item
          name="TimeInterval"
          label="时间值"
        >
          <Input
            readOnly
          />
        </Form.Item>

        <Form.Item
          name="ActiveTime"
          label="激活时间"
        >
          <Input
            readOnly
          />
        </Form.Item>

        <Form.Item
          name="EndTime"
          label="到期时间"
        >
          <Input
            readOnly
          />
        </Form.Item>

        <Form.Item
          name="LoginTime"
          label="登录时间"
        >
          <Input
            readOnly
          />
        </Form.Item>

        <Form.Item
          name="LoginIp"
          label="登录IP"
        >
          <Input
            readOnly
          />
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

const AppUserManagementPage: FC = () => {
  const { userId } = useParams();
  const [loading, setLoading] = useState(true);
  const [appUserData, setAppUserData] = useState<AppUserInfo | null>(null);

  // 抽离数据获取函数（用于刷新）
  const fetchUserDetail = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await GetAppUserInfo({ userid: Number(userId) });
      setAppUserData(res.result);
    } catch (error) {
      message.error('数据加载失败：' + (error as Error).message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 初始化加载数据
  useEffect(() => {
    fetchUserDetail();
  }, [userId]);

  // 处理设置保存（提交修改后的字段）
  const handleSaveSettings = async (values: Partial<AppUserInfo>) => {
    if (!userId) return;
    try {
      setLoading(true);
      // 调用后端更新接口，仅提交修改的字段
      console.error(values);
      const updateData: SetAppInfoParams = {
        ID: Number(userId),
        Description: values.Description!, // 非空断言（表单验证已确保有值）
        Notice: values.Notice!,
        Status: values.Status!,
      };
      console.error(updateData);
      await setAppInfo(updateData);
      message.success('保存成功！');
      // 更新本地数据（保持页面状态同步）
      setAppData(prev => prev ? { ...prev, ...values } : null);
    } catch (error) {
      message.error('保存失败：' + (error as Error).message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 加载中/无数据处理
  if (!userId || loading) {
    return <div style={{ padding: '24px' }}>加载中...</div>;
  }
  if (!appUserData) {
    return <div style={{ padding: '24px' }}>用户数据不存在</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card title={`用户( ${appUserData.ID} )管理`} loading={loading}>
        <UserInfo data={appUserData} onSave={handleSaveSettings} />
      </Card>
    </div>
  );
};

export default AppUserManagementPage;