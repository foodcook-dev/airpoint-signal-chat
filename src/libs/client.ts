import axios from 'axios';
import { PATH } from '@/constants/api-path';
import ResponseError from '@/libs/response-error';
import { getCurrentToken } from '@/libs/auth';

const API = axios.create({
  baseURL: PATH.base,
});

// 외부 링크로 직접 접속(iframe 밖)했을 때만 쓰는 임시 관리자 토큰
export const ADMIN_DEBUG_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzkzMDkyNjIwLCJpYXQiOjE3OTMwNTY2MjAsImp0aSI6IjlhMGRjZDJkODIwNDQ4NjBiOTU4NjQ2OTZhZGNlOThlIiwidXNlcm5hbWUiOjF9.cGD2AHePK5_D-MosBaPVPHxLlXSaF4Di-s4CgnGGayM';

// cross-origin 부모 프레임이면 window.top 접근 자체가 막힐 수 있어 예외도 iframe으로 본다
function isInIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

// iframe 안에서는 부모가 넘겨준 토큰(URL/localStorage)을, 외부 링크 접속 시에는 하드코딩된 토큰을 사용한다.
// 소켓 연결(socket-provider.tsx)도 같은 백엔드를 쓰므로 반드시 이 함수로 토큰을 가져와야 핸드셰이크가 거부되지 않는다.
export function getAuthToken(): string | null {
  return isInIframe() ? getCurrentToken() : ADMIN_DEBUG_TOKEN;
}

API.interceptors.request.use(
  (config) => {
    const newConfig = { ...config };

    const token = getAuthToken();

    if (token) {
      newConfig.headers.Authorization = `Bearer ${token}`;
    }

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
