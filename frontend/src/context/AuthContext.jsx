import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [familyId, setFamilyId] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadConfig = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/config')
      setFamilyId(data.family_id)
    } catch {
      // will retry on next load
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('sl_token')
    const savedUser = localStorage.getItem('sl_user')
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser))
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      } catch {
        localStorage.removeItem('sl_token')
        localStorage.removeItem('sl_user')
      }
    }
    loadConfig().finally(() => setLoading(false))
  }, [loadConfig])

  const login = async (username, password, remember = true) => {
    const form = new URLSearchParams()
    form.append('username', username)
    form.append('password', password)

    const { data } = await api.post('/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    api.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`

    if (remember) {
      localStorage.setItem('sl_token', data.access_token)
      localStorage.setItem('sl_user', JSON.stringify(data.user))
    } else {
      sessionStorage.setItem('sl_token', data.access_token)
      sessionStorage.setItem('sl_user', JSON.stringify(data.user))
    }

    setUser(data.user)
    await loadConfig()
    return data.user
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('sl_token')
    localStorage.removeItem('sl_user')
    sessionStorage.removeItem('sl_token')
    sessionStorage.removeItem('sl_user')
    delete api.defaults.headers.common['Authorization']
  }

  return (
    <AuthContext.Provider value={{ user, familyId, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
