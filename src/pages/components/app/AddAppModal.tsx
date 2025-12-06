// src/components/app/CreateAppModal.tsx
import { useState } from 'react';
import MyModal from '@/components/core/modal';
import MyForm from '@/components/core/form';
import { LocaleFormatter } from '@/locales';

interface CreateAppFormValues {
  name: string;
}

// 定义组件属性类型
interface CreateAppModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: CreateAppFormValues) => void;
  loading: boolean;
}
const CreateAppModal = ({ visible, onCancel, onSubmit }: CreateAppModalProps) => {

  // 处理模态框关闭/提交逻辑
  const handleClose = async (formData?: CreateAppFormValues) => {
    // 如果有表单数据，说明是提交操作
    if (formData) {
      onSubmit(formData);
    } else {
      // 没有表单数据，说明是单纯关闭（取消）
      onCancel();
    }
  };

  return (
    <MyModal<CreateAppFormValues>
      title={<LocaleFormatter id="app.create.title" />}
      visible={visible}
      onClose={handleClose}  // 核心修正：使用onClose统一处理关闭和提交
      form={{ name: '' }}    // 表单初始值（符合CreateAppFormValues类型）
      destroyOnClose
    >
      <MyForm.Item
        name="name"
        label={<LocaleFormatter id="app.create.name" />}
        rules={[{ required: true, message: <LocaleFormatter id="app.create.nameRequired" /> }]}
        type="input"
      />
      {/* <MyForm.Item
        name="description"
        label={<LocaleFormatter id="app.create.description" />}
        type="textarea"
        innerProps={{ rows: 4 }}
      />
      <MyForm.Item
        name="type"
        label={<LocaleFormatter id="app.create.type" />}
        type="select"
        options={[
          { label: 'Web应用', value: 'web' },
          { label: '移动应用', value: 'mobile' },
          { label: '桌面应用', value: 'desktop' },
        ]}
        rules={[{ required: true, message: <LocaleFormatter id="app.create.typeRequired" /> }]}
      /> */}
    </MyModal>
  );
};

export default CreateAppModal;