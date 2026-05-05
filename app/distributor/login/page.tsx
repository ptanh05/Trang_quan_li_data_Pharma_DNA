import LoginForm from "@/components/LoginForm"
import { Truck } from "lucide-react"

export default function DistributorLoginPage() {
  return (
    <LoginForm
      title="Đăng nhập Nhà Phân Phối"
      description="Truy cập vào hệ thống quản lý vận chuyển và phân phối"
      icon={<Truck className="w-8 h-8 text-white" />}
      redirectTo="/distributor"
    />
  )
}
