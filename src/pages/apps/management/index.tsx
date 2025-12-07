// src/pages/apps/management/index.tsx
import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Tabs, Form, message, Input, Space, Button, Select, Popconfirm } from 'antd'; // 从antd导入Breadcrumb
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { AppInfo, SetAppInfoParams } from '@/interface/app.interface';
import { GenerateAppRSAKeys, getAppInfo, setAppInfo } from '@/api/app.api'; // 导入API
import { log } from 'console';


const appStatusOptions = [
  { label: '正常', value: 'Normal' },
  { label: '停止', value: 'Stop' },
];

// 应用设置子页面（带表单）
const AppSettings: FC<{ 
  data: AppInfo; 
  onSave: (values: Partial<AppInfo>) => Promise<void>;
}> = ({ data, onSave }) => {
  const navigate = useNavigate()
  const [form] = Form.useForm();

  // 初始化表单数据（映射AppDetail字段）
  useEffect(() => {
    form.setFieldsValue({
      Name: data.Name,
      Description: data.Description,
      Notice: data.Notice,
      Status: data.Status,
      // rsakey: data.rsakey,
      // config: data.config,
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
          name="Status"
          label="应用状态"
          rules={[{ required: true, message: '请选择状态' }]} // 提示文案适配选择场景
        >
          <Select
            placeholder="请选择应用状态" // 占位符适配选择场景
            options={appStatusOptions}     // 配置下拉选项
            // style={{ width: '100%' }}    // 保持和Input一致的宽度
          />
        </Form.Item>

        <Form.Item
          name="Description"
          label="应用描述"
          rules={[{ required: true, message: '请输入应用描述' }]}
        >
          <Input.TextArea rows={4} placeholder="请输入应用描述" />
        </Form.Item>

        <Form.Item
          name="Notice"
          label="应用公告"
          rules={[{ required: true, message: '请输入应用公告' }]}
        >
          <Input.TextArea rows={4} placeholder="请输入应用公告" />
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

// 密钥设置子页面
const AppRsaKeyview: FC<{ 
  data: AppInfo; 
  onRefresh: () => Promise<void>; // 新增刷新函数props
}> = ({ data, onRefresh }) => {
  const navigate = useNavigate();
  const [regenerating, setRegenerating] = useState(false); // 生成中loading

  // 复制密钥逻辑
  const handleCopy = () => {
    if (!data?.RsaKey) {
      message.warning('暂无密钥可复制');
      return;
    }
    navigator.clipboard.writeText(data.RsaKey)
      .then(() => message.success('密钥复制成功！'))
      .catch(() => message.error('密钥复制失败，请手动复制'));
  };

  // 重新生成密钥逻辑（修复刷新问题）
  const handleRegenerate = async () => {
    if (regenerating) return; // 防止重复点击
    try {
      setRegenerating(true);
      const res = await GenerateAppRSAKeys({ id: data.ID });
      if (res.success) {
        message.success('密钥重新生成成功！');
        await onRefresh(); // 生成成功后刷新数据
      } else {
        message.error('密钥生成失败'); // 修正：错误提示用error
      }
    } catch (error) {
      message.error('密钥生成失败：' + (error as Error).message);
    } finally {
      setRegenerating(false); // 重置loading状态
    }
  };
  return (<div>
    <Input.TextArea
                value={data?.RsaKey || ''}
                readOnly
                rows={10}
                className="key-box"
              />
              
    <Form.Item style={{ marginTop: '32px' }}> {/* 关键：顶部间距 */}
          <Space>
            <Button
                type="primary"
                block
                disabled={!data}
                onClick={handleCopy}
              >
                复制密钥
              </Button>

            <Popconfirm
            title="确定重新生成吗?"
            onConfirm={handleRegenerate}
            okText="确定"
            cancelText="取消"
          >
            <Button type="default" size="large" danger>
              重新生成密钥
            </Button>
          </Popconfirm>

            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/apps')}
            >
              返回列表
            </Button>
          </Space>
        </Form.Item>
        
  </div>);
};

// 应用数据子页面
const AppOverview: FC<{ data: AppInfo }> = ({ data }) => {
  // 格式化配置数据（JSON字符串转对象，便于展示）
  const getFormattedConfig = () => {
    try {
      return JSON.stringify(JSON.parse(data.Config || '{}'), null, 2);
    } catch {
      return data.Config || '配置格式异常';
    }
  };
  return <div>应用 {data.Name} 的数据统计</div>;
};



const AppManagementPage: FC = () => {
  const { appId } = useParams();
  const [loading, setLoading] = useState(true);
  const [appData, setAppData] = useState<AppInfo | null>(null);

  // 抽离数据获取函数（用于刷新）
  const fetchAppDetail = async () => {
    if (!appId) return;
    try {
      setLoading(true);
      const res = await getAppInfo({ id: Number(appId) });
      setAppData(res.result);
    } catch (error) {
      message.error('数据加载失败：' + (error as Error).message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 初始化加载数据
  useEffect(() => {
    fetchAppDetail();
  }, [appId]);

  // 处理设置保存（提交修改后的字段）
  const handleSaveSettings = async (values: Partial<AppInfo>) => {
    if (!appId) return;
    try {
      setLoading(true);
      // 调用后端更新接口，仅提交修改的字段
      console.error(values);
      const updateData: SetAppInfoParams = {
        ID: Number(appId),
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
  if (!appId || loading) {
    return <div style={{ padding: '24px' }}>加载中...</div>;
  }
  if (!appData) {
    return <div style={{ padding: '24px' }}>应用数据不存在</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card title={`应用( ${appData.Name} )管理`} loading={loading}>
        <Tabs defaultActiveKey="settings">
          {/* 基本设置Tab */}
          <Tabs.TabPane tab="基本设置" key="settings">
            <AppSettings data={appData} onSave={handleSaveSettings} />
          </Tabs.TabPane>
          
          {/* 数据概览Tab（只读展示） */}
          <Tabs.TabPane tab="密钥设置" key="rsakeysettings">
            <AppRsaKeyview data={appData} onRefresh={fetchAppDetail} />
          </Tabs.TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default AppManagementPage;