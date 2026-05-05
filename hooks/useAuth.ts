"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export type UserRole = "ADMIN" | "MANUFACTURER" | "DISTRIBUTOR" | "PHARMACY" | null

interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  role: UserRole
  address: string | null
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    role: null,
    address: null,
  })

  const router = useRouter()

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = () => {
    setAuthState((prev) => ({ ...prev, isLoading: true }))

    const token = localStorage.getItem("auth_token")
    const role = localStorage.getItem("user_role") as UserRole
    const address = localStorage.getItem("user_address")
    const loginTime = localStorage.getItem("login_time")

    if (token && role && address && loginTime) {
      const now = Date.now()
      const loginTimestamp = Number.parseInt(loginTime)
      const sessionDuration = 24 * 60 * 60 * 1000 // 24 giờ

      if (now - loginTimestamp < sessionDuration) {
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          role,
          address,
        })
        return
      } else {
        // Session hết hạn
        clearAuth()
      }
    }

    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      role: null,
      address: null,
    })
  }

  const login = async (address: string, password: string): Promise<{ success: boolean; role?: UserRole; message?: string }> => {
    setAuthState((prev) => ({ ...prev, isLoading: true }))

    try {
      // Call API to verify credentials
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, password }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        const token = btoa(`${address}:${Date.now()}`)
        localStorage.setItem("auth_token", token)
        localStorage.setItem("user_role", data.role)
        localStorage.setItem("user_address", address)
        localStorage.setItem("login_time", Date.now().toString())

        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          role: data.role,
          address,
        })

        return { success: true, role: data.role }
      } else {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          role: null,
          address: null,
        })
        return { success: false, message: data.message || "Đăng nhập thất bại" }
      }
    } catch (error) {
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        role: null,
        address: null,
      })
      return { success: false, message: "Có lỗi xảy ra" }
    }
  }

  const clearAuth = () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_role")
    localStorage.removeItem("user_address")
    localStorage.removeItem("login_time")
  }

  const logout = () => {
    clearAuth()
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      role: null,
      address: null,
    })
    router.push("/")
    router.refresh()
  }

  return {
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    role: authState.role,
    address: authState.address,
    login,
    logout,
    checkAuthStatus,
  }
}
