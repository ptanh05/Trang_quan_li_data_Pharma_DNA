import { type NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// GET - Lấy danh sách inventory (batches trong kho)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const pharmacy = searchParams.get("pharmacy")
    const status = searchParams.get("status")

    let query = `
      SELECT
        b.*,
        u.address as manufacturer_address_full
      FROM drug_batches b
      LEFT JOIN users u ON b.manufacturer_address = u.address
      WHERE b.status IN ('IN_PHARMACY', 'SOLD')
    `
    const params: any[] = []
    let paramIndex = 1

    if (pharmacy) {
      // Get batches received by this pharmacy
      query = `
        SELECT DISTINCT
          b.*,
          u.address as manufacturer_address_full,
          e.created_at as received_at
        FROM drug_batches b
        LEFT JOIN users u ON b.manufacturer_address = u.address
        JOIN supply_chain_events e ON b.id = e.batch_id
        WHERE e.event_type = 'RECEIVED'
          AND LOWER(e.to_address) = $${paramIndex}
          AND b.status IN ('IN_PHARMACY', 'SOLD')
      `
      params.push(pharmacy.toLowerCase())
      paramIndex++
    }

    if (status) {
      query += ` AND b.status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }

    query += ` ORDER BY b.created_at DESC`

    const { rows } = await pool.query(query, params)

    return NextResponse.json(rows)
  } catch (error: any) {
    console.error("Error fetching inventory:", error)
    return NextResponse.json(
      { error: "Lỗi khi lấy danh sách kho" },
      { status: 500 }
    )
  }
}

// POST - Nhập kho (receive batch)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { batchId, pharmacyAddress, notes } = body

    if (!batchId || !pharmacyAddress) {
      return NextResponse.json(
        { error: "Thiếu thông tin bắt buộc" },
        { status: 400 }
      )
    }

    // Update batch status to IN_PHARMACY
    const updateResult = await pool.query(
      `UPDATE drug_batches
       SET status = 'IN_PHARMACY', updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [batchId]
    )

    if (updateResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy lô thuốc" },
        { status: 404 }
      )
    }

    // Create receive event
    const insertResult = await pool.query(
      `INSERT INTO supply_chain_events (
        batch_id, event_type, to_address, notes
      ) VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [
        batchId,
        "RECEIVED",
        pharmacyAddress.toLowerCase(),
        notes || "Đã nhập kho tại nhà thuốc",
      ]
    )

    return NextResponse.json({
      success: true,
      batch: updateResult.rows[0],
      event: insertResult.rows[0],
    })
  } catch (error: any) {
    console.error("Error receiving batch:", error)
    return NextResponse.json(
      { error: "Lỗi khi nhập kho" },
      { status: 500 }
    )
  }
}
