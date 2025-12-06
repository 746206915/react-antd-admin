import type { AppItem, AppList } from '@/interface/app.interface';
import { request } from './request';

/**
 * 获取 app 列表
 */
export const getAppList = () => {
  return request<AppList>('post', '/api/app/getlist');
};

/**
 * 添加新 app
 * @param data - app 信息
 */
export const addApp = (data: { name: string }) => {
  return request<AppItem>('post', '/api/app/add', data);
};