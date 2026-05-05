import { type NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// POST - Verify batch by batch number
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { batchNumber } = body

    if (!batchNumber) {
      return NextResponse.json(
        { success: false, message: "Thiếu mã lô thuốc" },
        { status: 400 }
      )
    }

    // Get batch info
    const batchResult = await pool.query(
      `SELECT
        b.*,
        u.address as manufacturer_address_full,
        u.role as manufacturer_role
      FROM drug_batches b
      LEFT JOIN users u ON b.manufacturer_address = u.address
      WHERE b.batch_number = $1`,
      [batchNumber]
    )

    if (batchResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Không tìm thấy thông tin lô thuốc",
      })
    }

    const batch = batchResult.rows[0]

    // Get events
    const eventsResult = await pool.query(
      `SELECT * FROM supply_chain_events
       WHERE batch_id = $1
       ORDER BY created_at DESC`,
      [batch.id]
    )

    return NextResponse.json({
      success: true,
      verified: true,
      batchNumber: batch.batch_number,
      drugName: batch.drug_name,
      manufacturer: batch.manufacturer_address,
      manufactureDate: batch.manufacture_date,
      expiryDate: batch.expiry_date,
      quantity: batch.quantity,
      unit: batch.unit,
      status: batch.status,
      tokenId: batch.token_id,
      events: eventsResult.rows,
    })
  } catch (error: any) {
    console.error("Error verifying batch:", error)
    return NextResponse.json(
      { success: false, message: "Lỗi khi xác minh lô thuốc" },
      { status: 500 }
    )
  }
}
