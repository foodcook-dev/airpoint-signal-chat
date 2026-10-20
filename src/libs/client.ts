import axios from 'axios';
import { PATH } from '@/constants/api-path';
import ResponseError from '@/libs/response-error';
import { getCurrentToken } from '@/libs/auth';

const API = axios.create({
  baseURL: PATH.base,
});

// TODO: 로그인 연동 전까지 임시로 고정된 관리자 토큰을 사용 — 소켓 연결(socket-provider.tsx)도
// 같은 백엔드를 쓰므로 반드시 이 토큰을 그대로 가져다 써야 핸드셰이크가 거부되지 않는다.
export const ADMIN_DEBUG_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzkyNTAwNzQ0LCJpYXQiOjE3OTI0NjQ3NDQsImp0aSI6ImEyZGMzNzI0ODkwMzQ4MTk4OWFlMGI2MjlhYzE1NDJkIiwidXNlcm5hbWUiOjF9.tzSV4LarNYu961aquVRuSZnEaYuPkMHkeh6LYQyHN7k';

API.interceptors.request.use(
  (config) => {
    const newConfig = { ...config };

    const token = getCurrentToken();

    // if (token) {
    //   newConfig.headers.Authorization = `Bearer ${token}`;
    // }

    newConfig.headers.Authorization = `Bearer ${ADMIN_DEBUG_TOKEN}`;

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
