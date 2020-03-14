import axios from 'axios';

import { API_URL, BASE_URL } from '../constants/url';
import I18n from '../i18n';

import { showToast } from './ToastHelper';
import { getHeaders } from './AuthHelper';

import { store } from '../store';
import { onLogOut } from '../actions/auth';

const parseErrorCode = error => {
  if (error.response) {
    if (error.response.status === 401) {
      store.dispatch(onLogOut());
    } else if (error.response.status === 404) {
      const { message } = error.response.data;
      showToast({ message });
    }
  } else {
    showToast({ message: I18n.t('ERRORS.COMMON_ERROR') });
  }

  return Promise.reject(error.response);
};

const API = axios.create();
API.defaults.baseURL = BASE_URL;
// Request parsing interceptor
API.interceptors.request.use(
  async config => {
    const headers = await getHeaders();

    if (headers) {
      config.headers = headers;
      const { accountId } = headers;
      if (accountId) {
        config.url = `${API_URL}accounts/${accountId}/${config.url}`;
      }
    }

    return config;
  },
  error => Promise.reject(error),
);

// Response parsing interceptor
API.interceptors.response.use(
  response => response,
  error => parseErrorCode(error),
);

export default API;
