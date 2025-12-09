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

type UserStatus = 'InActive' | 'Active' | 'Freeze';

const UserListPage: FC = () => {
  const { appId } = useParams();
  
  // 状态管理
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
      // await DeleteAppUser(id);
      message.success('删除成功');
      setAllData(prev => prev.filter(item => item.ID !== id));
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
                // onClick={handleClearSelection}
              >
                新增
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
    </div>
  );
};

export default UserListPage;