import type { LoginParams } from '../interface/user/login';

import { request } from './request';

/** 登录接口 */
// export const apiLogin = (data: LoginParams) => request<LoginResult>('post', '/user/login', data);
export const apiLogin = (params: LoginParams) => {
  return request('post', '/api/admin/login', params);
};

/** 登出接口 */
export const apiLogout = () => request('post', '/api/admin/logout');



export const AddAppUser = (data: { appid: number, usertype: string, userkey: string, time_interval: number }) => {
  return request('post', '/api/user/add', data);
};
export const DeleteAppUser = (data: { appid: number, userid: number }) => {
  return request('post', '/api/user/del', data);
};


import type { AppUserInfo } from '@/interface/appuser.interface';

export const GetAppUserInfo = (data: { userid: number}) => {
  return request<AppUserInfo>('post', '/api/user/getinfo', data);
};