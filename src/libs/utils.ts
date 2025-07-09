import { forEach, find, reduce } from 'lodash';
import { BodyContentType, ParameterType } from '@/types/api';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createSearchParams(obj: ParameterType = {}, base?: string) {
  const result = reduce(
    obj,
    (searchParams, value, key) => {
      if (value instanceof Array) {
        searchParams.delete(key);
        value.forEach((item) => {
          searchParams.append(key, item.toString());
        });
      } else if (value !== undefined && value !== null && value !== '') {
        searchParams.set(key, value.toString());
      } else {
        searchParams.delete(key);
      }

      return searchParams;
    },
    new URLSearchParams(base),
  ).toString();

  return result === '' ? '' : `?${result}`;
}

export function createFormData(obj: BodyContentType = {}) {
  return reduce(
    obj,
    (form, value, key) => {
      if (value instanceof File) {
        form.append(key, value);
        return form;
      }

      if (value instanceof Array) {
        const isFile = !!find(value, (item: string | number | File) => item instanceof File);

        if (isFile) {
          forEach(value, (item) => item instanceof File && form.append(key, item));
          return form;
        }
      }

      if (value !== undefined) form.append(key, JSON.stringify(value));

      return form;
    },
    new FormData(),
  );
}

export const groupIntoPairs = <T>(array: T[], groupSize: number = 2): T[][] => {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += groupSize) {
    result.push(array.slice(i, i + groupSize));
  }
  return result;
};

export function getTokenFromUrl(): string | null {
  const hash = window.location.hash;
  const params = new URLSearchParams(hash.split('?')[1] || '');
  return params.get('token');
}

export function getTokenFromStorage(): string | null {
  return localStorage.getItem('iframe_token');
}

export function setTokenToStorage(token: string): void {
  localStorage.setItem('iframe_token', token);
}

export function clearTokenFromStorage(): void {
  localStorage.removeItem('iframe_token');
}

export function getCurrentToken(): string | null {
  // URL에서 토큰을 먼저 확인하고, 없으면 localStorage에서 가져옴
  const urlToken = getTokenFromUrl();
  if (urlToken) {
    setTokenToStorage(urlToken);
    return urlToken;
  }
  return getTokenFromStorage();
}
