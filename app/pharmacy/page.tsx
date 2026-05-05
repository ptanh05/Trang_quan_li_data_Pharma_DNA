"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Pill, Package, Search, CheckCircle, QrCode, AlertCircle, ShieldCheck } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import RoleGuard from "@/components/RoleGuard"
import { useAuth } from "@/hooks/useAuth"

function PharmacyContent() {
  const { address } = useAuth()
  const [isVerifying, setIsVerifying] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [verificationResult, setVerificationResult] = useState<any>(null)
  const [inventoryBatches, setInventoryBatches] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (address) {
      fetchInventory()
    }
  }, [address])

  const fetchInventory = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/inventory?pharmacy=${address}`)
      const data = await res.json()
      setInventoryBatches(data)
    } catch (error) {
      console.error("Error fetching inventory:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyBatch = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsVerifying(true)
    setVerificationResult(null)

    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchNumber: searchQuery }),
      })

      const data = await res.json()
      setVerificationResult(data)
    } catch (error: any) {
      setVerificationResult({
        success: false,
        message: "Có lỗi xảy ra khi xác minh",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleReceiveBatch = async (batchId: number, batchNumber: string) => {
    if (!confirm(`Xác nhận nhập kho lô thuốc ${batchNumber}?`)) {
      return
    }

    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchId,
          pharmacyAddress: address,
          notes: "Đã nhập kho tại nhà thuốc",
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Lỗi khi nhập kho")
      }

      alert(`✅ Đã xác nhận nhập kho lô thuốc ${batchNumber}`)
      setVerificationResult(null)
      setSearchQuery("")
      fetchInventory()
    } catch (error: any) {
      alert(error.message || "Có lỗi xảy ra")
    }
  }

  const stats = {
    total: inventoryBatches.length,
    valid: inventoryBatches.filter((b) => new Date(b.expiry_date) > new Date()).length,
    expiringSoon: inventoryBatches.filter((b) => {
      const expiryDate = new Date(b.expiry_date)
      const now = new Date()
      const diffDays = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return diffDays > 0 && diffDays <= 90
    }).length,
    sold: inventoryBatches.filter((b) => b.status === "SOLD").length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Pill className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Nhà Thuốc</h1>
              <p className="text-xs text-gray-500">Xác minh và quản lý kho thuốc</p>
            </div>
          </div>
          <Badge className="bg-purple-100 text-purple-800">
            <Pill className="w-3 h-3 mr-1" />
            Pharmacy
          </Badge>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.total}</div>
                <p className="text-sm text-gray-600">Tổng lô trong kho</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.valid}</div>
                <p className="text-sm text-gray-600">Còn hạn sử dụng</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.expiringSoon}</div>
                <p className="text-sm text-gray-600">Sắp hết hạn</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.sold}</div>
                <p className="text-sm text-gray-600">Đã bán</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="verify" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="verify" className="flex items-center">
              <Search className="w-4 h-4 mr-2" />
              Xác minh lô thuốc
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center">
              <Package className="w-4 h-4 mr-2" />
              Kho thuốc
            </TabsTrigger>
          </TabsList>

          {/* Verify Batch */}
          <TabsContent value="verify">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Search className="w-5 h-5 mr-2" />
                    Tra cứu và xác minh
                  </CardTitle>
                  <CardDescription>
                    Nhập mã lô thuốc hoặc quét QR code để xác minh nguồn gốc
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleVerifyBatch} className="space-y-4">
                    <div>
                      <div className="flex space-x-2">
                        <Input
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Nhập mã lô thuốc (VD: BATCH-2025-001)"
                          required
                          className="flex-1"
                        />
                        <Button type="button" variant="outline" size="icon">
                          <QrCode className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isVerifying || !searchQuery}
                      className="w-full"
                    >
                      {isVerifying ? "Đang xác minh..." : "Xác minh lô thuốc"}
                    </Button>
                  </form>

                  {verificationResult && (
                    <div className="mt-6">
                      {verificationResult.success ? (
                        <Alert className="bg-green-50 border-green-200">
                          <ShieldCheck className="h-4 w-4 text-green-600" />
                          <AlertDescription className="text-green-800">
                            <strong>Xác minh thành công!</strong> Lô thuốc hợp lệ và có nguồn gốc rõ ràng.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <Alert className="bg-red-50 border-red-200">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <AlertDescription className="text-red-800">
                            <strong>Không tìm thấy!</strong> {verificationResult.message}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {verificationResult?.success && (
                <Card className="border-2 border-green-200 bg-green-50/50">
                  <CardHeader>
                    <CardTitle className="flex items-center text-green-900">
                      <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                      Thông tin lô thuốc
                    </CardTitle>
                    <CardDescription>
                      Dữ liệu được xác thực từ blockchain
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Mã lô:</span>
                        <span className="font-mono font-medium">{verificationResult.batchNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Tên thuốc:</span>
                        <span className="font-medium">{verificationResult.drugName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Nhà sản xuất:</span>
                        <span className="font-medium text-xs">{verificationResult.manufacturer}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Số lượng:</span>
                        <span className="font-medium">
                          {verificationResult.quantity?.toLocaleString()} {verificationResult.unit}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Ngày sản xuất:</span>
                        <span className="font-medium">{new Date(verificationResult.manufactureDate).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Hạn sử dụng:</span>
                        <span className="font-medium">{new Date(verificationResult.expiryDate).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Trạng thái:</span>
                        <Badge className="bg-orange-100 text-orange-800">
                          {verificationResult.status}
                        </Badge>
                      </div>
                    </div>

                    {verificationResult.status !== "IN_PHARMACY" && verificationResult.status !== "SOLD" && (
                      <div className="pt-4 border-t">
                        <Button
                          onClick={() => handleReceiveBatch(verificationResult.tokenId, verificationResult.batchNumber)}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Xác nhận nhập kho
                        </Button>
                      </div>
                    )}

                    <div className="text-xs text-gray-500 space-y-1">
                      <p>
                        <strong>Lưu ý:</strong> Sau khi xác nhận nhập kho, trạng thái sẽ được cập nhật lên blockchain.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Inventory */}
          <TabsContent value="inventory">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Kho thuốc hiện tại
                </CardTitle>
                <CardDescription>
                  Danh sách các lô thuốc đã nhập kho
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải...</p>
                  </div>
                ) : inventoryBatches.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">Kho thuốc trống</h3>
                    <p className="text-sm">Hãy xác minh và nhập lô thuốc đầu tiên</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {inventoryBatches.map((batch) => (
                      <div
                        key={batch.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">{batch.drug_name}</h3>
                            <p className="text-sm text-gray-500">Mã lô: {batch.batch_number}</p>
                          </div>
                          <Badge className="bg-purple-100 text-purple-800">
                            Trong kho
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Số lượng</p>
                            <p className="font-medium">{batch.quantity.toLocaleString()} {batch.unit}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Nhà SX</p>
                            <p className="font-medium text-xs">{batch.manufacturer_address?.substring(0, 10)}...</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Hạn SD</p>
                            <p className="font-medium">{new Date(batch.expiry_date).toLocaleDateString('vi-VN')}</p>
                          </div>
                          <div>
                            <Button variant="outline" size="sm" className="w-full">
                              Chi tiết
                            </Button>
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

export default function PharmacyPage() {
  return (
    <RoleGuard allowedRoles={["PHARMACY", "ADMIN"]}>
      <PharmacyContent />
    </RoleGuard>
  )
}
