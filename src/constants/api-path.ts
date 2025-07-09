// TODO: 추후 실서버, 개발서버, 로컬서버에 따라 BASE_URL을 변경할 수 있도록 설정해야함
const BASE_URL = import.meta.env.VITE_API_URL;

export const PATH = { base: BASE_URL };
