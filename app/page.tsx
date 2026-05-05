"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Shield,
  Factory,
  Truck,
  Pill,
  ArrowRight,
  Database,
  Lock,
  Globe,
  CheckCircle,
} from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const roles = [
    {
      title: "Admin",
      description: "Quản lý toàn bộ hệ thống, cấp quyền người dùng, giám sát chuỗi cung ứng",
      icon: Shield,
      href: "/admin",
      color: "bg-red-50 text-red-700 border-red-200",
      iconBg: "bg-red-100",
      badge: "Toàn quyền",
    },
    {
      title: "Nhà Sản Xuất",
      description: "Tạo lô thuốc mới, ghi nhận thông tin sản xuất lên blockchain",
      icon: Factory,
      href: "/manufacturer/login",
      color: "bg-blue-50 text-blue-700 border-blue-200",
      iconBg: "bg-blue-100",
      badge: "Tạo NFT",
    },
    {
      title: "Nhà Phân Phối",
      description: "Quản lý vận chuyển, cập nhật trạng thái hàng hóa trong quá trình phân phối",
      icon: Truck,
      href: "/distributor/login",
      color: "bg-green-50 text-green-700 border-green-200",
      iconBg: "bg-green-100",
      badge: "Vận chuyển",
    },
    {
      title: "Nhà Thuốc",
      description: "Xác nhận nhập kho, kiểm tra nguồn gốc thuốc, bán cho người dùng",
      icon: Pill,
      href: "/pharmacy/login",
      color: "bg-purple-50 text-purple-700 border-purple-200",
      iconBg: "bg-purple-100",
      badge: "Nhập kho",
    },
  ]

  const features = [
    { icon: Database, title: "Blockchain", desc: "Dữ liệu minh bạch, không thể thay đổi" },
    { icon: Lock, title: "Bảo mật", desc: "Mã hóa end-to-end, xác thực đa lớp" },
    { icon: Globe, title: "Truy xuất", desc: "Truy xuất nguồn gốc toàn cầu" },
    { icon: CheckCircle, title: "Tuân thủ", desc: "Đáp ứng tiêu chuẩn GDP/GMP" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">PharmaDNA</h1>
              <p className="text-xs text-gray-500">Chuỗi cung ứng dược phẩm</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1.5" />
            Đang hoạt động
          </Badge>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        {/* Hero Content */}
        <section className="text-center space-y-6">
          <Badge className="bg-blue-100 text-blue-800 text-sm px-4 py-1">
            Blockchain Supply Chain
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
            Quản lý chuỗi cung ứng
            <br />
            <span className="text-blue-600">dược phẩm minh bạch</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Hệ thống quản lý chuỗi cung ứng dược phẩm dựa trên công nghệ blockchain,
            đảm bảo tính minh bạch và truy xuất nguồn gốc cho mọi lô thuốc.
          </p>
        </section>

        {/* Role Selection */}
        <section>
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Chọn vai trò của bạn</h3>
            <p className="text-gray-600">Truy cập vào cổng thông tin phù hợp với vai trò trong chuỗi cung ứng</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roles.map((role) => {
              const Icon = role.icon
              return (
                <Link key={role.title} href={role.href} className="group">
                  <Card className={`h-full border-2 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${role.color}`}>
                    <CardHeader className="pb-3">
                      <div className={`w-12 h-12 ${role.iconBg} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{role.title}</CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {role.badge}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm leading-relaxed mb-4">
                        {role.description}
                      </CardDescription>
                      <Button variant="ghost" size="sm" className="group-hover:bg-white/50 w-full justify-between">
                        Truy cập
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Features */}
        <section className="bg-white rounded-2xl border p-8 md:p-12">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Tính năng nổi bật</h3>
            <p className="text-gray-600">Công nghệ hiện đại đảm bảo an toàn dược phẩm</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div key={feature.title} className="text-center space-y-3">
                  <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mx-auto">
                    <Icon className="w-7 h-7 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">{feature.title}</h4>
                  <p className="text-sm text-gray-600">{feature.desc}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Network Info */}
        <section className="text-center space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Thông tin mạng</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Card className="inline-flex items-center space-x-3 px-6 py-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <div className="text-left">
                <p className="text-sm font-medium">PharmaDNA Chainlet</p>
                <p className="text-xs text-gray-500">Saga Network</p>
              </div>
            </Card>
            <Card className="inline-flex items-center space-x-3 px-6 py-3">
              <Globe className="w-5 h-5 text-blue-600" />
              <div className="text-left">
                <p className="text-sm font-medium">Smart Contract</p>
                <p className="text-xs text-gray-500 font-mono">0xaa3f...9c6</p>
              </div>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Database className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-gray-900">PharmaDNA</span>
            </div>
            <p className="text-sm text-gray-500">
              © 2025 PharmaDNA. Hệ thống quản lý chuỗi cung ứng dược phẩm.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
