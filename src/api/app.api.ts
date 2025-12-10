import type { AppItem, AppList, AppInfo, SetAppInfoParams } from '@/interface/app.interface';
import { request } from './request';
import { AppUserList } from '@/interface/appuser.interface';

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


export const getAppInfo = (data: { id: number }) => {
  return request<AppInfo>('post', '/api/app/getinfo', data);
};

export const setAppInfo = (data: SetAppInfoParams) => {
  return request('post', '/api/app/set', data);
};

export const GenerateAppRSAKeys = (data: { id: number }) => {
  return request('post', '/api/app/setkeys', data);
};

export const DelApp = (data: { id: number }) => {
  return request('post', '/api/app/del', data);
};

export const SetAppConfig = (data: { id: number, config: string }) => {
  return request('post', '/api/app/setconfig', data);
};

export const GetAppUserList = (data: { id: number}) => {
  return request<AppUserList[]>('post', '/api/user/getlist', data);
};