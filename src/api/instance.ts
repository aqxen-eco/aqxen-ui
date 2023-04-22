import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

export const AUTH_TOKEN_KEY = 'authToken:accessKey'

const api = axios.create({
  headers: {
    'Access-Control-Allow-Origin': '*'
  },
  baseURL: import.meta.env.API_URL
})

export interface IAuthTokenInterceptorConfig {
  header?: string
  headerPrefix?: string
}

const authTokenInterceptor = ({ header = 'Authorization', headerPrefix = 'Bearer ' }: IAuthTokenInterceptorConfig) => {
  return (requestConfig: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const accessToken = localStorage.getItem(AUTH_TOKEN_KEY)

    // add token to headers
    if (accessToken && requestConfig.headers) {
      requestConfig.headers[header] = `${headerPrefix}${accessToken}`
    }

    return requestConfig
  }
}

const onRequestError = (error: AxiosError): Promise<AxiosError> => {
  console.error(`[request error] [${JSON.stringify(error)}]`)
  return Promise.reject(error)
}

api.interceptors.request.use(authTokenInterceptor({}), onRequestError)

export default api
