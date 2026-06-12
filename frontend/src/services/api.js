import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

// Restore token from storage on module load
const token = localStorage.getItem('sl_token') || sessionStorage.getItem('sl_token')
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

export default api
