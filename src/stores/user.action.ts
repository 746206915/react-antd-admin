import type { LoginParams } from '../interface/user/login';
import type { Dispatch } from '@reduxjs/toolkit';

import { apiLogin, apiLogout } from '../api/user.api';
import { setUserItem } from './user.store';
import { createAsyncAction } from './utils';
// typed wrapper async thunk function demo, no extra feature, just for powerful typings
export const loginAsync = createAsyncAction<LoginParams, boolean>(payload => {
  return async dispatch => {
    const resp = await apiLogin(payload);
    
    if (resp.success) {
      // 登录成功：resp.result 为 LoginData 类型
      localStorage.setItem('username', payload.username);
        dispatch(
          setUserItem({
            logged: true,
            username: payload.username,
          }),
        );

      return true;
      // 跳转首页等逻辑
    } else {
      // 登录失败：resp.message 为后端返回的错误提示（如“用户名或密码错误”）
      console.log('登录失败：', resp.message);
    }
    return false;
  };
});

export const logoutAsync = () => {
  return async (dispatch: Dispatch) => {
    const res = await apiLogout();

    if (res.success){
      localStorage.clear();
      dispatch(
        setUserItem({
          logged: false,
        }),
      );
      return true;
    }
    return false;
  };
};
