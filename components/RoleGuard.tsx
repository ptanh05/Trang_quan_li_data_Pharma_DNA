"use client"

import type { ReactNode } from "react"
import { useAuth, type UserRole } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface RoleGuardProps {
  children: ReactNode
  allowedRoles: UserRole[]
  redirectTo?: string
}

export default function RoleGuard({ children, allowedRoles, redirectTo = "/" }: RoleGuardProps) {
  const { isAuthenticated, isLoading, role } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(redirectTo)
      } else if (role && !allowedRoles.includes(role)) {
        router.push(redirectTo)
      }
    }
  }, [isAuthenticated, isLoading, role, allowedRoles, redirectTo, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || (role && !allowedRoles.includes(role))) {
    return null
  }

  return <>{children}</>
}
