"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Truck, Package, MapPin, ArrowRight, Clock, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import RoleGuard from "@/components/RoleGuard"
import { useAuth } from "@/hooks/useAuth"

function DistributorContent() {
  const { address } = useAuth()
  const [isUpdating, setIsUpdating] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [selectedBatch, setSelectedBatch] = useState<any>(null)
  const [inTransitBatches, setInTransitBatches] = useState<any[]>([])
  const [completedShipments, setCompletedShipments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [shipmentData, setShipmentData] = useState({
    location: "",
    notes: "",
  })

  useEffect(() => {
    if (address) {
      fetchShipments()
    }
  }, [address])

  const fetchShipments = async () => {
    try {
      setIsLoading(true)
      const [inTransitRes, completedRes] = await Promise.all([
        fetch(`/api/shipments?status=in_transit&distributor=${address}`),
        fetch(`/api/shipments?status=completed&distributor=${address}`),
      ])

      const inTransitData = await inTransitRes.json()
      const completedData = await completedRes.json()

      setInTransitBatches(inTransitData)
      setCompletedShipments(completedData)
    } catch (error) {
      console.error("Error fetching shipments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setShipmentData({
      ...shipmentData,
      [e.target.name]: e.target.value,
    })
  }

  const handleUpdateShipment = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    setSuccessMessage("")

    try {
      const res = await fetch(`/api/batches/${selectedBatch.batch_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "IN_TRANSIT",
          location: shipmentData.location,
          notes: shipmentData.notes,
          fromAddress: address,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Lỗi khi cập nhật")
      }

      setSuccessMessage(`✅ Đã cập nhật trạng thái vận chuyển thành công!`)
      setShipmentData({
        location: "",
        notes: "",
      })
      setSelectedBatch(null)
      fetchShipments()
      setTimeout(() => setSuccessMessage(""), 5000)
    } catch (error: any) {
      alert(error.message || "Có lỗi xảy ra khi cập nhật")
    } finally {
      setIsUpdating(false)
    }
  }

  const stats = {
    inTransit: inTransitBatches.length,
    completed: completedShipments.length,
    pending: 0,
    total: inTransitBatches.length + completedShipments.length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Truck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Nhà Phân Phối</h1>
              <p className="text-xs text-gray-500">Quản lý vận chuyển và phân phối</p>
            </div>
          </div>
          <Badge className="bg-green-100 text-green-800">
            <Truck className="w-3 h-3 mr-1" />
            Distributor
          </Badge>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.inTransit}</div>
                <p className="text-sm text-gray-600">Đang vận chuyển</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
                <p className="text-sm text-gray-600">Đã giao</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
                <p className="text-sm text-gray-600">Chờ xử lý</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.total}</div>
                <p className="text-sm text-gray-600">Tổng lô đã xử lý</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="in-transit" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="in-transit" className="flex items-center">
              <Truck className="w-4 h-4 mr-2" />
              Đang vận chuyển
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Đã hoàn thành
            </TabsTrigger>
          </TabsList>

          {/* In Transit */}
          <TabsContent value="in-transit">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="w-5 h-5 mr-2" />
                  Lô hàng đang vận chuyển
                </CardTitle>
                <CardDescription>
                  Theo dõi và cập nhật trạng thái vận chuyển
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải...</p>
                  </div>
                ) : inTransitBatches.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Truck className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">Không có lô hàng đang vận chuyển</h3>
                    <p className="text-sm">Các lô hàng mới sẽ xuất hiện ở đây</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {inTransitBatches.map((shipment) => (
                      <div
                        key={shipment.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-gray-900">{shipment.drug_name}</h3>
                            <p className="text-sm text-gray-500">Mã lô: {shipment.batch_number}</p>
                          </div>
                          <Badge className="bg-orange-100 text-orange-800">
                            <Truck className="w-3 h-3 mr-1" />
                            Đang vận chuyển
                          </Badge>
                        </div>

                        <div className="flex items-center space-x-2 mb-4 text-sm">
                          <div className="flex items-center space-x-2 flex-1">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{shipment.from_address || "Nhà sản xuất"}</span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                          <div className="flex items-center space-x-2 flex-1">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{shipment.to_address || "Đích đến"}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                          <div>
                            <p className="text-gray-500">Số lượng</p>
                            <p className="font-medium">{shipment.quantity?.toLocaleString()} {shipment.unit}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Vị trí</p>
                            <p className="font-medium">{shipment.location || "Đang cập nhật"}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Cập nhật</p>
                            <p className="font-medium">{new Date(shipment.created_at).toLocaleDateString('vi-VN')}</p>
                          </div>
                          <div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => setSelectedBatch(shipment)}
                            >
                              Cập nhật
                            </Button>
                          </div>
                        </div>

                        {selectedBatch?.id === shipment.id && (
                          <form onSubmit={handleUpdateShipment} className="border-t pt-4 space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="location">
                                  <MapPin className="w-4 h-4 inline mr-1" />
                                  Vị trí hiện tại
                                </Label>
                                <Input
                                  id="location"
                                  name="location"
                                  value={shipmentData.location}
                                  onChange={handleInputChange}
                                  placeholder="VD: Kho trung chuyển Hà Nội"
                                  className="mt-1"
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="notes">Ghi chú</Label>
                              <Textarea
                                id="notes"
                                name="notes"
                                value={shipmentData.notes}
                                onChange={handleInputChange}
                                placeholder="Thông tin bổ sung về trạng thái vận chuyển..."
                                rows={3}
                                className="mt-1"
                              />
                            </div>
                            {successMessage && (
                              <Alert className="bg-green-50 border-green-200">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <AlertDescription className="text-green-800">
                                  {successMessage}
                                </AlertDescription>
                              </Alert>
                            )}
                            <div className="flex space-x-2">
                              <Button type="submit" disabled={isUpdating} className="flex-1">
                                {isUpdating ? "Đang cập nhật..." : "Cập nhật trạng thái"}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setSelectedBatch(null)}
                              >
                                Hủy
                              </Button>
                            </div>
                          </form>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Completed */}
          <TabsContent value="completed">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Lô hàng đã giao
                </CardTitle>
                <CardDescription>
                  Lịch sử các lô hàng đã giao thành công
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải...</p>
                  </div>
                ) : completedShipments.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">Chưa có lô hàng nào hoàn thành</h3>
                    <p className="text-sm">Lịch sử giao hàng sẽ xuất hiện ở đây</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {completedShipments.map((shipment) => (
                      <div
                        key={shipment.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">{shipment.drug_name}</h3>
                            <p className="text-sm text-gray-500">Mã lô: {shipment.batch_number}</p>
                          </div>
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Đã giao
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Số lượng</p>
                            <p className="font-medium">{shipment.quantity?.toLocaleString()} {shipment.unit}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Đích đến</p>
                            <p className="font-medium">{shipment.to_address}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Ngày giao</p>
                            <p className="font-medium">{new Date(shipment.created_at).toLocaleDateString('vi-VN')}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default function DistributorPage() {
  return (
    <RoleGuard allowedRoles={["DISTRIBUTOR", "ADMIN"]}>
      <DistributorContent />
    </RoleGuard>
  )
}
