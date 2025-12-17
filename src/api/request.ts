import type { AxiosRequestConfig, Method } from 'axios';

import { message as $message } from 'antd';
import axios from 'axios';

import store from '@/stores';
import { setGlobalState } from '@/stores/global.store';

const axiosInstance = axios.create({
  timeout: 6000,
  headers: {
    "Content-Type": "application/x-www-form-urlencoded"
  },
  // 默认基础请求地址
  // baseURL: `${location.protocol}//${location.host}`,
  baseURL: 'https://fuck.9oc.cc',
  withCredentials :true,
});

axiosInstance.interceptors.request.use(
  config => {
    store.dispatch(
      setGlobalState({
        loading: true,
      }),
    );

    return config;
  },
  error => {
    store.dispatch(
      setGlobalState({
        loading: false,
      }),
    );
    Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  (response) => {
    // 响应成功：关闭加载状态
    store.dispatch(
      setGlobalState({
        loading: false,
      }),
    );

    // 解构后端原始响应（注意字段名大小写：后端是小写）
    const backendResp = response.data as BackendResponse;
    const { code, message, data } = backendResp;

    // 前端统一格式转换
    const frontResp: Response = {
      success: code === 200,       // 200视为业务成功
      code: code,                  // 透传后端状态码
      message: message || '操作成功', // 兜底提示
      result: data ?? null,        // undefined转为null，避免业务层报错
    };

    // 可选：非200时提示后端错误信息（根据业务需求开关）
    if (code !== 200) {
      $message.error(frontResp.message);
    }

    return frontResp;
  },
  (error) => {
    // 网络错误/请求异常：关闭加载状态
    store.dispatch(
      setGlobalState({
        loading: false,
      }),
    );

    // 统一错误信息处理
    let errorMessage = '系统异常';
    if (error?.message?.includes('Network Error')) {
      errorMessage = '网络错误，请检查您的网络';
    } else if (error?.response) {
      // 有响应但状态码非2xx（如404/500）
      errorMessage = error.response.data?.Message || error.message || errorMessage;
    } else {
      errorMessage = error?.message || errorMessage;
    }

    console.dir('请求异常：', error);
    $message.error(errorMessage);

    // 返回前端统一错误格式
    const errorResp: Response = {
      success: false,
      code: error?.response?.status || 500, // 网络错误默认500
      message: errorMessage,
      result: null,
    };

    // 注意：这里返回resolve而非reject，保证业务层无需try/catch也能拿到统一格式
    return Promise.resolve(errorResp);
  },
);

/** 后端返回的原始响应结构 */
interface BackendResponse<T = any> {
  code: number;         // 后端状态码（200=成功）
  message: string;      // 后端提示信息
  data: T | undefined;  // 后端业务数据（可选）
}

/** 前端统一返回格式（简化业务层调用） */
export type Response<T = any> = {
  success: boolean;     // 前端简化判断：Code=200 则为true
  code: number;         // 后端原始状态码
  message: string;      // 后端提示信息
  result: T | null;     // 后端Data字段（统一为null，避免undefined）
};

// export type Response<T = any> = {
//   status: boolean;
//   message: string;
//   result: T;
// };

export type MyResponse<T = any> = Promise<Response<T>>;

/**
 * 统一请求函数
 * @param method - 请求方法（仅支持post/get，小写）
 * @param url - 请求路径（如 /api/admin/login）
 * @param data - POST请求体 / GET查询参数
 * @param config - 额外Axios配置（可选）
 */
export const request = <T = any>(
  method: Lowercase<Method>,
  url: string,
  data?: any,
  config?: AxiosRequestConfig,
): MyResponse<T> => {
  const prefix = ''; // 可根据需要添加接口前缀（如/api）
  const fullUrl = prefix + url;

  if (method === 'post') {
    // POST请求：data作为请求体
    return axiosInstance.post(fullUrl, data, config);
  } else {
    // GET请求：data作为URL查询参数
    return axiosInstance.get(fullUrl, {
      params: data,
      ...config,
    });
  }
};