import LoginForm from "@/components/LoginForm"
import { Pill } from "lucide-react"

export default function PharmacyLoginPage() {
  return (
    <LoginForm
      title="Đăng nhập Nhà Thuốc"
      description="Truy cập vào hệ thống xác minh và quản lý kho thuốc"
      icon={<Pill className="w-8 h-8 text-white" />}
      redirectTo="/pharmacy"
    />
  )
}
