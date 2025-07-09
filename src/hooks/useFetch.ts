import { useState } from 'react';
import ResponseError from '@/libs/response-error';

export type FetchOptions<T, U> = {
  requestFn: (args: U) => Promise<T> | null | void;
  onSuccess?: (params?: any) => void;
  onError?: (e: ResponseError) => void;
  onFetching?: () => void;
  onSettled?: () => void;
};

export default function useFetch<T, U>({
  requestFn,
  onSuccess,
  onError,
  onFetching,
  onSettled,
}: FetchOptions<T, U>) {
  const [state, setState] = useState<any>();
  const request: (args?: U) => Promise<void> | null = async (params?: any) => {
    onFetching?.();
    try {
      const response = await requestFn(params);

      setState(response);
      if (onSuccess || response) {
        onSuccess?.(response);
      }
    } catch (e: any) {
      if (onError) {
        onError?.(e as ResponseError);
      } else {
        if (typeof e.detail === 'string') {
          return console.log(e.detail);
        }
        return console.error(e);
      }
    } finally {
      onSettled?.();
    }
  };

  return { response: state, request };
}
