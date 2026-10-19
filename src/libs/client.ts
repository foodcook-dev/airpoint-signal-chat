import axios from 'axios';
import { PATH } from '@/constants/api-path';
import ResponseError from '@/libs/response-error';
import { getCurrentToken } from '@/libs/auth';

const API = axios.create({
  baseURL: PATH.base,
});

API.interceptors.request.use(
  (config) => {
    const newConfig = { ...config };

    const token = getCurrentToken();

    // if (token) {
    //   newConfig.headers.Authorization = `Bearer ${token}`;
    // }

    newConfig.headers.Authorization =
      'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzkyNDA1NTgxLCJpYXQiOjE3OTIzNjk1ODEsImp0aSI6ImJhZDEzNjM5ZWQ0MTRjMmJhNTNjY2JhOTRkODgxNTRjIiwidXNlcm5hbWUiOjF9.rlU3lDhsBZMNQycnOIT-05QX3sIUFxstTpdk7fZJfrM';

    return newConfig;
  },
  (err) => Promise.reject(err),
);

// 모든 요청 실패를 ResponseError로 통일 — API.get/API.post를 호출하는 쪽은
// 항상 ResponseError 인스턴스만 catch하면 된다 (useFetch, QueryCache onError 등).
API.interceptors.response.use(undefined, (error) => {
  const { response } = error;

  if (response.status === 302) {
    return Promise.resolve({
      data: { ...response.data, status: response.status },
    });
  }

  if (response.status === 500) {
    return Promise.reject(
      new ResponseError({
        status: 500,
        code: 99999,
        message: 'Network Error',
      }),
    );
  }

  return Promise.reject(
    new ResponseError({
      ...response.data,
      status: response.status,
    }),
  );
});

export default API;
