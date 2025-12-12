import { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber, Button, message } from 'antd';
import type { FormInstance } from 'antd/es/form';

// 定义表单值类型
interface CreateAppUserFormValues {
  userkey: string;
  len: number;
  count: number;
  days: number;
  hours: number;
}

// 组件属性类型
interface CreateAppUserModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: CreateAppUserFormValues) => void;
  loading: boolean;
}

const CreateAppUserModal = ({ visible, onCancel, onSubmit, loading }: CreateAppUserModalProps) => {
  // 1. 创建原生表单实例（AntD 官方方式）
  const [form]: [FormInstance<CreateAppUserFormValues>] = Form.useForm();

  // 2. 仅组件首次挂载时初始化表单值（不重复重置）
  useEffect(() => {
    form.setFieldsValue({
      userkey: '',
      len: 8,
      count: 1,
      days: 0,
      hours: 0,
    });
  }, [form]);

  // 3. 处理表单提交
  const handleSubmit = async () => {
    try {
      // 校验并获取表单值
      const values = await form.validateFields();
      // 调用父组件提交回调
      onSubmit(values);
      // 提交成功后重置表单（可选，根据需求决定是否保留）
      // form.resetFields();
      message.success('提交成功');
    } catch (error) {
      message.error('请完成必填项填写或修正错误');
      console.error('表单校验失败:', error);
    }
  };

  // 4. 处理弹窗关闭（重置表单/仅关闭，根据需求选）
  const handleModalClose = () => {
    // 关闭时可选重置表单（如果需要每次打开都是初始值）
    // form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="新增用户"
      open={visible}
      onCancel={handleModalClose}
      onOk={handleSubmit}
      confirmLoading={loading}
      destroyOnClose={false} // 关闭不销毁，保留输入状态（需重置则设为true）
      maskClosable={false} // 点击遮罩不关闭
    >
      {/* AntD 原生 Form，绑定表单实例 */}
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          userkey: '',
          len: 8,
          count: 1,
          days: 0,
          hours: 0,
        }} // 原生initialValues，双重保障初始值
      >

        {/* 长度 */}
        <Form.Item<CreateAppUserFormValues>
          name="len"
          label="卡密长度"
        //   rules={[{ min: 0, max: 365, message: '天数需在 0-365 之间' }]}
        >
          <InputNumber
            min={8}
            max={16}
            placeholder="输入卡密长度"
            style={{ width: '100%' }}
          />
        </Form.Item>

        {/* 数量 */}
        <Form.Item<CreateAppUserFormValues>
          name="count"
          label="生成卡密数量"
        //   rules={[{ min: 0, max: 365, message: '天数需在 0-365 之间' }]}
        >
          <InputNumber
            min={1}
            placeholder="输入卡密数量"
            style={{ width: '100%' }}
          />
        </Form.Item>

        {/* 天数 */}
        <Form.Item<CreateAppUserFormValues>
          name="days"
          label="天数"
        //   rules={[{ min: 0, max: 365, message: '天数需在 0-365 之间' }]}
        >
          <InputNumber
            min={0}
            max={365}
            placeholder="输入天数"
            style={{ width: '100%' }}
          />
        </Form.Item>

        {/* 小时 */}
        <Form.Item<CreateAppUserFormValues>
          name="hours"
          label="小时"
        //   rules={[{ min: 0, max: 23, message: '小时需在 0-23 之间' }]}
        >
          <InputNumber
            min={0}
            max={23}
            placeholder="输入小时"
            style={{ width: '100%' }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateAppUserModal;