"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Package, Calendar, Factory, MapPin, Clock, CheckCircle, Truck } from "lucide-react"
import Link from "next/link"

export default function BatchDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [batch, setBatch] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (params.id) {
      fetchBatchDetail()
    }
  }, [params.id])

  const fetchBatchDetail = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/batches/${params.id}`)

      if (!res.ok) {
        throw new Error("Không tìm thấy lô thuốc")
      }

      const data = await res.json()
      setBatch(data)
    } catch (error: any) {
      setError(error.message || "Có lỗi xảy ra")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "MANUFACTURED":
        return "bg-blue-100 text-blue-800"
      case "IN_TRANSIT":
        return "bg-orange-100 text-orange-800"
      case "IN_PHARMACY":
        return "bg-purple-100 text-purple-800"
      case "SOLD":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "MANUFACTURED":
        return <Factory className="w-5 h-5 text-blue-600" />
      case "SHIPPED":
        return <Truck className="w-5 h-5 text-orange-600" />
      case "RECEIVED":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "SOLD":
        return <Package className="w-5 h-5 text-purple-600" />
      default:
        return <Package className="w-5 h-5 text-gray-600" />
    }
  }

  const getEventLabel = (eventType: string) => {
    switch (eventType) {
      case "MANUFACTURED":
        return "Đã sản xuất"
      case "SHIPPED":
        return "Đang vận chuyển"
      case "RECEIVED":
        return "Đã nhận hàng"
      case "SOLD":
        return "Đã bán"
      default:
        return eventType
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin lô thuốc...</p>
        </div>
      </div>
    )
  }

  if (error || !batch) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">Không tìm thấy lô thuốc</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Chi tiết lô thuốc</h1>
              <p className="text-xs text-gray-500">{batch.batch_number}</p>
            </div>
          </div>
          <Badge className={getStatusColor(batch.status)}>
            {batch.status}
          </Badge>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Thông tin lô thuốc
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Mã lô thuốc</p>
                    <p className="font-mono font-semibold text-lg">{batch.batch_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Token ID</p>
                    <p className="font-mono font-semibold text-lg">#{batch.token_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Tên thuốc</p>
                    <p className="font-semibold text-lg">{batch.drug_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Số lượng</p>
                    <p className="font-semibold text-lg">{batch.quantity.toLocaleString()} {batch.unit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Ngày sản xuất
                    </p>
                    <p className="font-medium">{new Date(batch.manufacture_date).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Hạn sử dụng
                    </p>
                    <p className="font-medium">{new Date(batch.expiry_date).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500 mb-1 flex items-center">
                      <Factory className="w-4 h-4 mr-1" />
                      Nhà sản xuất
                    </p>
                    <p className="font-mono text-sm">{batch.manufacturer_address}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Lịch sử di chuyển
                </CardTitle>
                <CardDescription>
                  Timeline theo dõi toàn bộ hành trình của lô thuốc
                </CardDescription>
              </CardHeader>
              <CardContent>
                {batch.events && batch.events.length > 0 ? (
                  <div className="space-y-4">
                    {batch.events.map((event: any, index: number) => (
                      <div key={event.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                            {getEventIcon(event.event_type)}
                          </div>
                          {index < batch.events.length - 1 && (
                            <div className="w-px h-full bg-gray-200 my-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-6">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold">{getEventLabel(event.event_type)}</h4>
                            <span className="text-sm text-gray-500">
                              {new Date(event.created_at).toLocaleString('vi-VN')}
                            </span>
                          </div>
                          {event.location && (
                            <p className="text-sm text-gray-600 flex items-center mt-1">
                              <MapPin className="w-4 h-4 mr-1" />
                              {event.location}
                            </p>
                          )}
                          {event.from_address && (
                            <p className="text-xs text-gray-500 mt-1">
                              Từ: {event.from_address}
                            </p>
                          )}
                          {event.to_address && (
                            <p className="text-xs text-gray-500">
                              Đến: {event.to_address}
                            </p>
                          )}
                          {event.notes && (
                            <p className="text-sm text-gray-600 mt-2 italic">
                              {event.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Chưa có lịch sử di chuyển</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Thông tin bổ sung</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Trạng thái</p>
                  <Badge className={getStatusColor(batch.status)}>
                    {batch.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Ngày tạo</p>
                  <p className="font-medium">{new Date(batch.created_at).toLocaleString('vi-VN')}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Cập nhật lần cuối</p>
                  <p className="font-medium">{new Date(batch.updated_at).toLocaleString('vi-VN')}</p>
                </div>
                {batch.ipfs_hash && (
                  <div>
                    <p className="text-gray-500 mb-1">IPFS Hash</p>
                    <p className="font-mono text-xs break-all">{batch.ipfs_hash}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Blockchain</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(
                    `https://pharmadna-2759821881746000-1.sagaexplorer.io/token/${batch.token_id}`,
                    "_blank"
                  )}
                >
                  Xem trên Explorer
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
