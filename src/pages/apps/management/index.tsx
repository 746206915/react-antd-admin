// src/pages/apps/management/index.tsx
import { useState, useEffect, useRef } from 'react';
import type { FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Tabs, Form, message, Input, Space, Button, Select, Popconfirm, Upload } from 'antd'; // 从antd导入Breadcrumb
import { SaveOutlined, ArrowLeftOutlined, UploadOutlined, ReloadOutlined, EditOutlined } from '@ant-design/icons';
import { AppInfo, SetAppInfoParams } from '@/interface/app.interface';
import { GenerateAppRSAKeys, getAppInfo, setAppInfo, SetAppConfig, DelApp } from '@/api/app.api'; // 导入API
import type { UploadFile } from 'antd/es/upload/interface';

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

  const handleDelApp = async () => {
    try {
      const res = await DelApp({ id: data.ID });
      if(res.success){
        message.success('删除成功！');
      }else{
        message.warning('删除失败！');
      }
      navigate('/apps')
    } catch (error) {
      message.error('删除错误');
      console.error(error);
      navigate('/apps')
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
            <Popconfirm
            title="确定删除吗?"
            onConfirm={handleDelApp}
            okText="确定"
            cancelText="取消"
          >
            <Button danger>
              删除应用
            </Button>
          </Popconfirm>
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
            <Button danger>
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
const AppConfigview: FC<{ data: AppInfo }> = ({ data }) => {
  const navigate = useNavigate();
  // 初始化加载已有配置
  const [jsonText, setJsonText] = useState(data.Config || '');
  const [loading, setLoading] = useState(false);
  // 原生文件选择器DOM引用
  const fileInputRef = useRef<HTMLInputElement>(null);

  // JSON格式化/校验工具函数
  const formatJSON = (str: string) => {
    if (!str) return '';
    try {
      return JSON.stringify(JSON.parse(str), null, 2);
    } catch (error) {
      message.error('JSON 格式错误，请检查');
      return str;
    }
  };

  // 点击按钮触发文件选择器
  const handleClickSelectFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // 触发原生文件选择框
    }
  };

  // 处理文件选择后的读取逻辑
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 校验文件类型（仅允许JSON）
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      message.error('仅支持上传 .json 格式文件！');
      e.target.value = ''; // 清空选择，避免重复选同一文件不触发change
      return;
    }

    setLoading(true);
    try {
      // 读取文件文本内容（原生File API）
      const text = await file.text();
      if (!text) {
        message.warning('文件内容为空');
        return;
      }
      // 格式化并展示JSON
      setJsonText(formatJSON(text));
      message.success(`成功读取文件：${file.name}`);
    } catch (error) {
      message.error('文件解析失败：' + (error as Error).message);
    } finally {
      setLoading(false);
      e.target.value = ''; // 清空选择，允许重复选同一文件
    }
  };

  // 格式化JSON
  const handleFormatJSON = () => {
    setJsonText(formatJSON(jsonText));
  };

  // 保存JSON配置
  const handleSaveJSON = async() => {
    if (!jsonText) {
      message.warning('暂无JSON内容可保存');
      return;
    }
    // 替换为你的保存接口调用
    const res = await SetAppConfig({ id: data.ID, config: jsonText });
    if(res.success){
      message.success('JSON配置保存成功！');
    }else{
      message.success('JSON配置保存失败:' + res.message);
    }
    
  };

  return (
    <div style={{ padding: '8px 0' }}>
      {/* 隐藏的原生文件选择器 */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json" // 仅允许选择JSON文件
        onChange={handleFileChange}
        style={{ display: 'none' }} // 隐藏原生选择框
      />

      {/* JSON编辑区域 */}
      <Input.TextArea
        value={jsonText}
        onChange={(e) => setJsonText(e.target.value)}
        rows={20}
        placeholder="上传JSON文件或手动输入配置..."
        style={{
          marginBottom: '16px',
        }}
      />

      {/* 操作按钮组 */}
      <Space size="middle" wrap>
        {/* 选择文件按钮（触发原生选择器） */}
        <Button
          icon={<UploadOutlined />}
          type="primary"
          onClick={handleClickSelectFile}
          loading={loading}
        >
          选择JSON文件
        </Button>

        {/* 格式化按钮 */}
        <Button
          icon={<ReloadOutlined />}
          onClick={handleFormatJSON}
          disabled={!jsonText || loading}
        >
          格式化JSON
        </Button>

        {/* 保存按钮 */}
        <Button
          icon={<EditOutlined />}
          onClick={handleSaveJSON}
          disabled={!jsonText || loading}
        >
          保存JSON配置
        </Button>

        <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/apps')}
            >
              返回列表
            </Button>
      </Space>
    </div>
  );
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

          <Tabs.TabPane tab="参数设置" key="configsettings">
            <AppConfigview data={appData}/>
          </Tabs.TabPane>
          
        </Tabs>
      </Card>
    </div>
  );
};

export default AppManagementPage;