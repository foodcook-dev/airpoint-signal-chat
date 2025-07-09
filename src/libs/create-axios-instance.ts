import axios from 'axios';
import { PATH } from '@/constants/api-path';
import { Instance } from '@/types/api';
import ResponseError from '@/libs/response-error';
import { createSearchParams, getCurrentToken } from '@/libs/utils';

const instance = axios.create({
  baseURL: PATH.base,
});

instance.interceptors.request.use(
  (config) => {
    const newConfig = { ...config };

    const token = getCurrentToken();

    // if (token) {
    newConfig.headers.Authorization = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzUyMDYxNDE1LCJpYXQiOjE3NTIwMjU0MTUsImp0aSI6IjUwOTcwODk0YjFiYTRjNDNhN2FjNjA0YTY0ZGM3NmJhIiwidXNlcm5hbWUiOjF9.f-lzfKFJOa0IrfNNhuCD93Xv6XjbDSy7HDMW8Zv1v7o`;
    // }

    return newConfig;
  },
  (err) => Promise.reject(err),
);

instance.interceptors.response.use(undefined, (error) => {
  const { response } = error;

  if (response.status === 302) {
    return Promise.resolve({
      data: { ...response.data, status: response.status },
    });
  }

  if (response.status === 500) {
    return Promise.reject({
      status: 500,
      code: 99999,
      message: 'Network Error',
    });
  }

  return Promise.reject({
    ...response.data,
    status: response.status,
  });
});

const customAxios: Instance = async ({ method, endpoint, params, body }) => {
  try {
    const { data } = await instance({
      method,
      url: `${endpoint}${createSearchParams(params)}`,
      data: body,
    });

    return data;
  } catch (e) {
    throw new ResponseError(e);
  }
};

export default customAxios;
