import axios from 'axios'
import { Message, Loading } from 'element-ui'
import router from './router'

let loading
function startLoading () {
  loading = Loading.service({
    lock: true,
    text: '拼命加载中。。。',
    background: 'rgb(0,0,0,0,7)'
  })
}

function endLoading () {
  loading.close()
}

// 请求拦截
axios.interceptors.request.use(config => {
  startLoading()
  if (localStorage.eleToken) {
    config.headers.Authorization = localStorage.eleToken
  }

  return config
}, error => {
  return Promise.reject(error)
})

// 响应拦截
axios.interceptors.response.use(response => {
  endLoading()
  return response
}, error => {
  Message.error(error.response.data)

  //获取错误状态码
  const { status } = error.response
  if (status == 401) {
    Message.error('token失效')
    //清楚老token
    localStorage.removeItem('eleToken')
    //跳转至登录页面
    router.push('/login')
  }
  return Promise.reject(error)
})

export default axios
