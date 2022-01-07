import axios from 'axios'
import _isEmpty from 'lodash/isEmpty'

import { getAccessToken, removeAccessToken } from './utils'

const api = axios.create({
  baseURL: 'https://api.swetrix.com/'
})

api.interceptors.request.use(
  async (config) => {
    let token

    try {
      token = await getAccessToken()
    } catch (e) {
      console.error('[API REQUEST INTERCEPTOR]', e)
    }

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.data.statusCode === 401) {
      try {
        await removeAccessToken()
      } catch (e) {
        console.error('[API RESPONSE INTERCEPTOR]', e)
      }
    }
    return Promise.reject(error)
  }
)

export const authMe = () =>
  api
    .get('/auth/me')
    .then((response) => response.data)
    .catch((error) => {
      throw _isEmpty(error.response.data?.message)
        ? error.response.data
        : error.response.data.message
    })

export const login = (credentials) =>
  api
    .post('/auth/login', credentials)
    .then((response) => response.data)
    .catch((error) => {
      throw _isEmpty(error.response.data?.message)
        ? error.response.data
        : error.response.data.message
    })