import type { FC, ChangeEvent } from 'react';
import { useState, useEffect, useMemo } from 'react';
import { 
  Table, Input, Space, Button, Tag, 
  Card, Form, Row, Col, Pagination, message
} from 'antd';
import { useParams } from 'react-router-dom';
import type { TableRowSelection } from 'antd/es/table/interface';

import MyButton from '@/components/basic/button';
import type { AppUserList } from '@/interface/appuser.interface';
import { GetAppUserList } from '@/api/app.api';
import AddAppCardKeyModal from '@/pages/components/app/AddAppCardKeyModal';
import AddAppSerialModal from '@/pages/components/app/AddAppSerialModal';
import { AddAppUser, DeleteAppUser } from '@/api/user.api'


const generateRandomString = (length: number = 8): string => {
  // 校验参数合法性
  if (!Number.isInteger(length) || length <= 0) {
    throw new Error('长度必须是大于0的整数');
  }

  // 字符池：0-9 + A-Z
  const charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  const charsetLength = charset.length;

  // 高效生成随机字符串（避免多次字符串拼接）
  const arr = new Array(length);
  for (let i = 0; i < length; i++) {
    // 使用 crypto.getRandomValues 提升随机性（优于 Math.random）
    const randomIndex = crypto.getRandomValues(new Uint32Array(1))[0] % charsetLength;
    arr[i] = charset[randomIndex];
  }

  return arr.join('');
};

type UserStatus = 'InActive' | 'Active' | 'Freeze';


const UserListPage: FC = () => {
  const { appId } = useParams();
  
  // 状态管理
  // 1. 新增：模态框类型状态（区分卡密/序列号）
  const [modalType, setModalType] = useState<'cardKey' | 'serial'>('cardKey');
  const [modalVisible, setModalVisible] = useState(false); //模态框
  const [isAdding, setIsAdding] = useState(false); // 创建应用状态
  const [loading, setLoading] = useState<boolean>(false); // 加载状态
  const [allData, setAllData] = useState<AppUserList[]>([]); // 缓存全量数据
  const [searchParams, setSearchParams] = useState({ // 搜索参数
    keyword: '',
  });
  const [pagination, setPagination] = useState({ // 分页参数（仅前端用）
    current: 1,
    pageSize: 10,
  });
  // 选中行管理（Table 原生选择功能）
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // 核心：首次拉取全部数据
  const fetchAllData = async () => {
    if (!appId) return;
    
    setLoading(true);
    try {
      const res = await GetAppUserList({ id: Number(appId) });
      setAllData(res.result || []);
    } catch (error) {
      message.error('获取列表失败，请重试');
      console.error('列表请求失败：', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始化拉取数据
  useEffect(() => {
    fetchAllData();
  }, [appId]);

  // 前端过滤 + 分页
  const [filteredData, total] = useMemo(() => {
    // 1. 搜索过滤
    let result = [...allData];
    if (searchParams.keyword) {
      const keyword = searchParams.keyword.trim().toLowerCase();
      result = result.filter(item => 
        (item.Cardkey?.toLowerCase().includes(keyword) || 
         item.Serial?.toLowerCase().includes(keyword) || 
         item.Description?.toLowerCase().includes(keyword) ||
         item.Usertype?.toLowerCase().includes(keyword))
      );
    }

    // 2. 分页切片
    const start = (pagination.current - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    const paginatedData = result.slice(start, end);

    return [paginatedData, result.length];
  }, [allData, searchParams, pagination]);

  // Table 原生行选择配置（核心）
  const rowSelection: TableRowSelection<AppUserList> = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
    // 可选：配置选择项样式/行为
    type: 'checkbox',
    // 可选：自定义选择框渲染
    // columnWidth: 80,
    // 可选：禁止某些行被选择
    // getCheckboxProps: (record) => ({
    //   disabled: record.Status === 'Active', // 激活状态禁止删除
    // }),
  };

  // 搜索提交
  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 });
    setSelectedRowKeys([]); // 搜索时清空选中状态
  };

  // 搜索框变化
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchParams({ keyword: e.target.value });
  };

  // 分页变化
  const handlePaginationChange = (current: number, pageSize: number) => {
    setPagination({ current, pageSize });
  };

  // 单行删除
  const handleDelete = async (id: number) => {
    try {
      const res = await DeleteAppUser({appid: Number(appId), userid: id});
      if (res.success){
        message.success('删除成功');
        setAllData(prev => prev.filter(item => item.ID !== id));
      }else{
        message.warning(res.message);
      }
      setSelectedRowKeys(prev => prev.filter(key => key !== id));
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的记录');
      return;
    }

    try {
      // 调用批量删除接口
      // await BatchDeleteAppUser(selectedRowKeys);
      message.success(`成功删除 ${selectedRowKeys.length} 条记录`);
      
      // 更新前端数据
      setAllData(prev => prev.filter(item => !selectedRowKeys.includes(item.ID)));
      setSelectedRowKeys([]); // 清空选中
    } catch (error) {
      message.error('批量删除失败，请重试');
      console.error('批量删除失败：', error);
    }
  };

  // 2. 修改：打开模态框的方法，接收类型参数
  const handleOpenModal = (type: 'cardKey' | 'serial') => {
    setModalType(type); // 先设置类型
    setModalVisible(true); // 再打开模态框
  };
  
    // 关闭新增用户模态框
    const handleCloseModal = () => {
      setModalVisible(false);
    };
  
    // 提交新增用户表单
    const handleSubmitAddAppUser = async (values: { 
      userkey: string,
      // usertype: string,
      len: number,
      count: number,
      days: number,
      hours: number,
     }) => {
      // const usertype = modalType === 'cardKey' ? 'CardKey' : 'Serial';
      const time_interval = values.days * 86400 + values.hours * 3600;
      if(time_interval === 0){
        message.error("时间不能为0");
        return;
      }
      try {
        setIsAdding(true);
        if (modalType === 'cardKey') {
          // 卡密专属逻辑
          for (let i = 0; i < values.count; i++) {
            const cardkey = generateRandomString(values.len);
            await AddAppUser({
              appid: Number(appId),
              userkey: cardkey,
              usertype: 'CardKey',
              time_interval: time_interval,
            });
          }
        } else {
          // 序列号专属逻辑
          await AddAppUser({
            appid: Number(appId),
            userkey: values.userkey,
            usertype: 'Serial',
            time_interval: time_interval,
          });
        }
        message.success("添加成功");
        handleCloseModal();
        fetchAllData(); // 重新获取列表数据
      } catch (error) {
        message.error("添加失败");
        console.error('Failed to add appuser:', error);
      } finally {
        setIsAdding(false);
      }
    };

  // 表格列配置
  const tableColumns = [
    { title: 'ID', dataIndex: 'ID', key: 'ID' },
    { 
      title: '种类', 
      dataIndex: 'Usertype', 
      key: 'Usertype',
      render: (types: string) => types === 'CardKey' ? '卡密' : '序列号'
    },
    { title: '卡密', dataIndex: 'Cardkey', key: 'Cardkey' },
    { title: '序列号', dataIndex: 'Serial', key: 'Serial' },
    { title: '描述', dataIndex: 'Description', key: 'Description' },
    { 
      title: '状态', 
      dataIndex: 'Status', 
      key: 'Status',
      render: (status: UserStatus) => {
        const colorMap = { Active: 'green', InActive: 'red', Freeze: 'orange' };
        const labelMap = { Active: '激活', InActive: '未激活', Freeze: '冻结' };
        return <Tag color={colorMap[status]}>{labelMap[status]}</Tag>;
      }
    },
    { 
      title: '到期时间', 
      dataIndex: 'Endtime', 
      key: 'Endtime',
      render: (timestamp: number) => timestamp 
        ? new Date(timestamp).toLocaleString('zh-CN') 
        : '无'
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: AppUserList) => (
        <Space size="middle">
          <MyButton 
            type="text" 
            danger 
            onClick={() => handleDelete(record.ID)}
          >
            删除
          </MyButton>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card title="用户列表" bordered={false}>
        {/* 搜索和批量操作区域 */}
        <Row gutter={[16, 24]} align="middle" style={{marginBottom: 20}}>
          <Col flex="1">
            <Form layout="inline">
              <Form.Item label="搜索关键词">
                <Input
                  value={searchParams.keyword}
                  onChange={handleInputChange}
                  placeholder="请输入卡密/序列号/描述等关键词"
                  onPressEnter={handleSearch}
                  style={{ width: 350 }}
                />
              </Form.Item>
              <Button type="primary" onClick={handleSearch}>
                搜索
              </Button>
            </Form>
          </Col>

          {/* 批量操作按钮 */}
          <Col>
            <Space>
              <Button 
                danger 
                onClick={handleBatchDelete}
                disabled={selectedRowKeys.length === 0}
                icon={<></>} // 可添加删除图标
              >
                批量删除 ({selectedRowKeys.length})
              </Button>
              <Button 
                // onClick={handleClearSelection}
                disabled={selectedRowKeys.length === 0}
              >
                批量加时 ({selectedRowKeys.length})
              </Button>
              <Button 
                onClick={() => handleOpenModal('cardKey')}
              >
                新增卡密授权
              </Button>
              <Button 
                onClick={() => handleOpenModal('serial')}
              >
                新增序列号授权
              </Button>
            </Space>
          </Col>
        </Row>
        
        {/* 表格区域（使用原生rowSelection） */}
        <Table
          columns={tableColumns}
          dataSource={filteredData}
          rowKey="ID" // 必须与数据主键匹配
          loading={loading}
          pagination={false} // 自定义分页
          scroll={{ x: 'max-content' }}
          rowSelection={rowSelection} // 核心：启用行选择功能
        />

        {/* 分页区域 */}
        <div style={{ marginTop: 20, textAlign: 'right' }}>
          <Pagination
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={total}
            onChange={handlePaginationChange}
            showSizeChanger
            showQuickJumper
            showTotal={(total) => `共 ${total} 条记录`}
            pageSizeOptions={['10', '20', '50', '100']}
          />
        </div>
      </Card>
      {/* 添加用户模态框 */}
      <AddAppCardKeyModal
        visible={modalVisible && modalType === 'cardKey'} // 仅卡密类型时显示
        onCancel={handleCloseModal}
        onSubmit={handleSubmitAddAppUser}
        loading={isAdding}
      />
      <AddAppSerialModal
        visible={modalVisible && modalType === 'serial'} // 仅序列号类型时显示
        onCancel={handleCloseModal}
        onSubmit={handleSubmitAddAppUser}
        loading={isAdding}
      />
    </div>
  );
};

export default UserListPage;