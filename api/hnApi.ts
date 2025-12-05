import axios from 'axios';

const API_BASE_URL = 'https://hn.algolia.com/api/v1';

export const hnApi = axios.create({
  baseURL: API_BASE_URL,
});

export const fetchMobileArticles = async (page: number = 0) => {
  const response = await hnApi.get(`/search_by_date?query=mobile&page=${page}`);
  return response.data;
};
