import LoginForm from "@/components/LoginForm"
import { Factory } from "lucide-react"

export default function ManufacturerLoginPage() {
  return (
    <LoginForm
      title="Đăng nhập Nhà Sản Xuất"
      description="Truy cập vào hệ thống quản lý sản xuất và tạo lô thuốc"
      icon={<Factory className="w-8 h-8 text-white" />}
      redirectTo="/manufacturer"
    />
  )
}
