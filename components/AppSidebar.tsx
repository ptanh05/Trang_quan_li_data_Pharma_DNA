"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Database,
  Shield,
  Factory,
  Truck,
  Pill,
  ChevronLeft,
  ChevronRight,
  Home,
} from "lucide-react"
import { useState } from "react"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  color?: string
}

const navItems: NavItem[] = [
  {
    title: "Trang chủ",
    href: "/",
    icon: Home,
    color: "text-gray-600",
  },
  {
    title: "Admin",
    href: "/admin",
    icon: Shield,
    badge: "Quản trị",
    color: "text-red-600",
  },
  {
    title: "Nhà Sản Xuất",
    href: "/manufacturer",
    icon: Factory,
    badge: "Tạo lô",
    color: "text-blue-600",
  },
  {
    title: "Nhà Phân Phối",
    href: "/distributor",
    icon: Truck,
    badge: "Vận chuyển",
    color: "text-green-600",
  },
  {
    title: "Nhà Thuốc",
    href: "/pharmacy",
    icon: Pill,
    badge: "Nhập kho",
    color: "text-purple-600",
  },
]

export default function AppSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r bg-white transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b">
        <Link href="/" className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Database className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-sm font-bold text-gray-900 leading-tight">PharmaDNA</h1>
              <p className="text-[10px] text-gray-500 leading-tight">Supply Chain</p>
            </div>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center rounded-lg transition-colors",
                  collapsed ? "justify-center p-3" : "px-3 py-2.5 space-x-3",
                  isActive
                    ? "bg-blue-50 text-blue-700 border border-blue-100"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
                title={collapsed ? item.title : undefined}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 flex-shrink-0",
                    isActive ? "text-blue-600" : item.color
                  )}
                />
                {!collapsed && (
                  <>
                    <span className="text-sm font-medium flex-1">{item.title}</span>
                    {item.badge && (
                      <span
                        className={cn(
                          "text-[10px] px-2 py-0.5 rounded-full font-medium",
                          item.href === "/admin" && "bg-red-100 text-red-700",
                          item.href === "/manufacturer" && "bg-blue-100 text-blue-700",
                          item.href === "/distributor" && "bg-green-100 text-green-700",
                          item.href === "/pharmacy" && "bg-purple-100 text-purple-700"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span>PharmaDNA Chainlet</span>
          </div>
        </div>
      )}
    </aside>
  )
}
