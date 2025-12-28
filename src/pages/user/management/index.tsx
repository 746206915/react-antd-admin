import { useState, useEffect, useRef } from 'react';
import moment from 'moment';
import type { FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Tabs, Form, message, Input, Space, Button, Select, Popconfirm, Upload, DatePicker } from 'antd'; // 从antd导入Breadcrumb
import { SaveOutlined, ArrowLeftOutlined, UploadOutlined, ReloadOutlined, EditOutlined } from '@ant-design/icons';
import { AppUserInfo } from '@/interface/appuser.interface';

import { GetAppUserInfo, SetAppUserInfo } from '@/api/user.api'; // 导入API

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
  const { userId } = useParams();
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
      EndTime: data.EndTime === 0 
      ? null // 无到期时间 → 赋值 null，对应 DatePicker 清空状态
      : moment(data.EndTime * 1000), // 有效时间戳 → 转为 moment 实例，适配 DatePicker 展示
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
      
      // await onSave(values); ????????????????????????????????????????????????????????????????????????????????????????????
      //需要修改 状态 描述 到期时间
      // 【核心修改】处理 EndTime：moment 实例 → 秒级时间戳
    let endTimeParam = 0; // 默认为 0，对应「无到期时间」（和原有业务逻辑一致）
    if (values.EndTime) {
      // 1. moment.valueOf() 返回毫秒级时间戳
      // 2. 除以 1000 并向下取整，转为秒级时间戳，和其他时间字段（CreatTime/ActiveTime）保持一致
      endTimeParam = Math.floor(values.EndTime.valueOf() / 1000);
    }

      await SetAppUserInfo({id: Number(userId), status: values.Status, description: values.Description, end_time: endTimeParam});
    } catch (error) {
      message.error('表单验证失败，请检查必填项');
      console.error(error);
    }
  };

return (
  <div>
    {/* 第一部分：只读信息展示（移除 Form.Item，仅用纯 Input 展示，不参与表单） */}
    <Space direction="vertical" size="large" style={{ marginBottom: 24, width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <label style={{ width: 120, fontWeight: 500 }}>制卡/授权人ID：</label>
        <Input value={data.CreatorID} readOnly style={{ flex: 1, maxWidth: 400 }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <label style={{ width: 120, fontWeight: 500 }}>用户种类：</label>
        <Input value={data.UserType === 'CardKey' ? '卡密' : '序列号'} readOnly style={{ flex: 1, maxWidth: 400 }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <label style={{ width: 120, fontWeight: 500 }}>卡密：</label>
        <Input value={data.Cardkey} readOnly style={{ flex: 1, maxWidth: 400 }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <label style={{ width: 120, fontWeight: 500 }}>序列号：</label>
        <Input value={data.Serial} readOnly style={{ flex: 1, maxWidth: 400 }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <label style={{ width: 120, fontWeight: 500 }}>创建时间：</label>
        <Input value={new Date(data.CreatTime * 1000).toLocaleString('zh-CN')} readOnly style={{ flex: 1, maxWidth: 400 }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <label style={{ width: 120, fontWeight: 500 }}>时间值：</label>
        <Input value={formatTimeDuration(data.TimeInterval)} readOnly style={{ flex: 1, maxWidth: 400 }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <label style={{ width: 120, fontWeight: 500 }}>激活时间：</label>
        <Input value={data.ActiveTime === 0 ? '无' : new Date(data.ActiveTime * 1000).toLocaleString('zh-CN')} readOnly style={{ flex: 1, maxWidth: 400 }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <label style={{ width: 120, fontWeight: 500 }}>登录时间：</label>
        <Input value={data.LoginTime === 0 ? '无' : new Date(data.LoginTime * 1000).toLocaleString('zh-CN')} readOnly style={{ flex: 1, maxWidth: 400 }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <label style={{ width: 120, fontWeight: 500 }}>登录IP：</label>
        <Input value={data.LoginIp} readOnly style={{ flex: 1, maxWidth: 400 }} />
      </div>
    </Space>

    {/* 第二部分：可编辑表单（仅保留需要修改的字段，无只读字段干扰） */}
    <Form
      form={form}
      layout="vertical"
      // 无需类型定义，仅保留核心配置
    >
      <Form.Item
        name="Status"
        label="用户状态"
        rules={[{ required: true, message: '请选择状态' }]}
      >
        <Select
          placeholder="请选择用户状态"
          options={userStatusOptions}
          style={{ width: '100%', maxWidth: 400 }}
        />
      </Form.Item>

      <Form.Item
        name="Description"
        label="用户描述"
      >
        <Input.TextArea rows={4} placeholder="请输入用户描述" style={{ maxWidth: 400 }} />
      </Form.Item>

      <Form.Item
        name="EndTime"
        label="到期时间"
      >
        <DatePicker
          showTime
          format="YYYY-MM-DD HH:mm:ss"
          placeholder="请选择到期时间（无则清空）"
          style={{ width: '100%', maxWidth: 400 }}
          allowClear
          // 显式触发表单值更新，无需类型定义
          onChange={(date) => {
            // 直接同步选中值到 form 实例，无类型校验
            form.setFieldsValue({ EndTime: date });
          }}
        />
      </Form.Item>

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
    // if (!userId) return;
    // try {
    //   setLoading(true);
    //   // 调用后端更新接口，仅提交修改的字段
    //   console.error(values);
    //   const updateData: SetAppInfoParams = {
    //     ID: Number(userId),
    //     Description: values.Description!, // 非空断言（表单验证已确保有值）
    //     Notice: values.Notice!,
    //     Status: values.Status!,
    //   };
    //   console.error(updateData);
    //   await setAppInfo(updateData);
    //   message.success('保存成功！');
    //   // 更新本地数据（保持页面状态同步）
    //   setAppData(prev => prev ? { ...prev, ...values } : null);
    // } catch (error) {
    //   message.error('保存失败：' + (error as Error).message);
    //   console.error(error);
    // } finally {
    //   setLoading(false);
    // }
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