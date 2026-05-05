"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Factory, Package, Plus, Calendar, Hash, Pill, FileText, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import RoleGuard from "@/components/RoleGuard"
import { useAuth } from "@/hooks/useAuth"
import Link from "next/link"

function ManufacturerContent() {
  const { address } = useAuth()
  const [isCreating, setIsCreating] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [myBatches, setMyBatches] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    batchNumber: "",
    drugName: "",
    quantity: "",
    unit: "Viên",
    manufactureDate: "",
    expiryDate: "",
    description: "",
  })

  useEffect(() => {
    if (address) {
      fetchMyBatches()
    }
  }, [address])

  const fetchMyBatches = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/batches?manufacturer=${address}`)
      const data = await res.json()
      setMyBatches(data)
    } catch (error) {
      console.error("Error fetching batches:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    setSuccessMessage("")

    try {
      const res = await fetch("/api/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchNumber: formData.batchNumber,
          drugName: formData.drugName,
          manufacturerAddress: address,
          manufactureDate: formData.manufactureDate,
          expiryDate: formData.expiryDate,
          quantity: parseInt(formData.quantity),
          unit: formData.unit,
          description: formData.description,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Lỗi khi tạo lô thuốc")
      }

      setSuccessMessage(`✅ Đã tạo lô thuốc ${formData.batchNumber} thành công!`)
      setFormData({
        batchNumber: "",
        drugName: "",
        quantity: "",
        unit: "Viên",
        manufactureDate: "",
        expiryDate: "",
        description: "",
      })
      fetchMyBatches()
      setTimeout(() => setSuccessMessage(""), 5000)
    } catch (error: any) {
      alert(error.message || "Có lỗi xảy ra khi tạo lô thuốc")
    } finally {
      setIsCreating(false)
    }
  }

  const stats = {
    total: myBatches.length,
    manufactured: myBatches.filter((b) => b.status === "MANUFACTURED").length,
    inTransit: myBatches.filter((b) => b.status === "IN_TRANSIT").length,
    delivered: myBatches.filter((b) => b.status === "IN_PHARMACY" || b.status === "SOLD").length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Factory className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Nhà Sản Xuất</h1>
              <p className="text-xs text-gray-500">Quản lý sản xuất và tạo lô thuốc</p>
            </div>
          </div>
          <Badge className="bg-blue-100 text-blue-800">
            <Factory className="w-3 h-3 mr-1" />
            Manufacturer
          </Badge>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <p className="text-sm text-gray-600">Tổng lô thuốc</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.manufactured}</div>
                <p className="text-sm text-gray-600">Đang sản xuất</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.inTransit}</div>
                <p className="text-sm text-gray-600">Đang vận chuyển</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.delivered}</div>
                <p className="text-sm text-gray-600">Đã giao</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create" className="flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Tạo lô thuốc mới
            </TabsTrigger>
            <TabsTrigger value="batches" className="flex items-center">
              <Package className="w-4 h-4 mr-2" />
              Lô thuốc của tôi
            </TabsTrigger>
          </TabsList>

          {/* Create Batch */}
          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Tạo lô thuốc mới
                </CardTitle>
                <CardDescription>
                  Nhập thông tin lô thuốc và tạo NFT trên blockchain
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateBatch} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="batchNumber" className="flex items-center">
                        <Hash className="w-4 h-4 mr-1" />
                        Mã lô thuốc *
                      </Label>
                      <Input
                        id="batchNumber"
                        name="batchNumber"
                        value={formData.batchNumber}
                        onChange={handleInputChange}
                        placeholder="VD: BATCH-2025-001"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="drugName" className="flex items-center">
                        <Pill className="w-4 h-4 mr-1" />
                        Tên thuốc *
                      </Label>
                      <Input
                        id="drugName"
                        name="drugName"
                        value={formData.drugName}
                        onChange={handleInputChange}
                        placeholder="VD: Paracetamol 500mg"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="quantity">Số lượng *</Label>
                      <Input
                        id="quantity"
                        name="quantity"
                        type="number"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        placeholder="VD: 10000"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="unit">Đơn vị *</Label>
                      <Input
                        id="unit"
                        name="unit"
                        value={formData.unit}
                        onChange={handleInputChange}
                        placeholder="VD: Viên, Hộp, Chai"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="manufactureDate" className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Ngày sản xuất *
                      </Label>
                      <Input
                        id="manufactureDate"
                        name="manufactureDate"
                        type="date"
                        value={formData.manufactureDate}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="expiryDate" className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Hạn sử dụng *
                      </Label>
                      <Input
                        id="expiryDate"
                        name="expiryDate"
                        type="date"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description" className="flex items-center">
                      <FileText className="w-4 h-4 mr-1" />
                      Mô tả (tùy chọn)
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Thông tin bổ sung về lô thuốc..."
                      rows={4}
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

                  <Button
                    type="submit"
                    disabled={isCreating}
                    className="w-full"
                    size="lg"
                  >
                    {isCreating ? "Đang tạo lô thuốc..." : "Tạo lô thuốc và mint NFT"}
                  </Button>

                  <div className="text-sm text-gray-500 space-y-1">
                    <p>
                      <strong>Lưu ý:</strong> Sau khi tạo, thông tin lô thuốc sẽ được ghi lên blockchain và không thể thay đổi.
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Batches */}
          <TabsContent value="batches">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Lô thuốc của tôi
                </CardTitle>
                <CardDescription>
                  Danh sách các lô thuốc đã tạo
                </CardDescription>
              </CardHeader>
              <CardContent>
                {myBatches.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">Chưa có lô thuốc nào</h3>
                    <p className="text-sm">Hãy tạo lô thuốc đầu tiên ở tab "Tạo lô thuốc mới"</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myBatches.map((batch) => (
                      <div
                        key={batch.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">{batch.drug_name}</h3>
                            <p className="text-sm text-gray-500">Mã lô: {batch.batch_number}</p>
                          </div>
                          <Badge className="bg-blue-100 text-blue-800">
                            {batch.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Số lượng</p>
                            <p className="font-medium">{batch.quantity.toLocaleString()} {batch.unit}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Ngày SX</p>
                            <p className="font-medium">{new Date(batch.manufacture_date).toLocaleDateString('vi-VN')}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Hạn SD</p>
                            <p className="font-medium">{new Date(batch.expiry_date).toLocaleDateString('vi-VN')}</p>
                          </div>
                          <div>
                            <Link href={`/batches/${batch.id}`}>
                              <Button variant="outline" size="sm" className="w-full">
                                Chi tiết
                              </Button>
                            </Link>
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

export default function ManufacturerPage() {
  return (
    <RoleGuard allowedRoles={["MANUFACTURER", "ADMIN"]}>
      <ManufacturerContent />
    </RoleGuard>
  )
}
