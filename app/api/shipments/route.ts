import { type NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// GET - Lấy danh sách shipments
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const distributor = searchParams.get("distributor")

    let query = `
      SELECT
        e.*,
        b.batch_number,
        b.drug_name,
        b.quantity,
        b.unit,
        b.status as batch_status
      FROM supply_chain_events e
      JOIN drug_batches b ON e.batch_id = b.id
      WHERE e.event_type IN ('SHIPPED', 'RECEIVED')
    `
    const params: any[] = []
    let paramIndex = 1

    if (status === "in_transit") {
      query += ` AND b.status = 'IN_TRANSIT'`
    } else if (status === "completed") {
      query += ` AND b.status IN ('IN_PHARMACY', 'SOLD')`
    }

    if (distributor) {
      query += ` AND (LOWER(e.from_address) = $${paramIndex} OR LOWER(e.to_address) = $${paramIndex})`
      params.push(distributor.toLowerCase())
      paramIndex++
    }

    query += ` ORDER BY e.created_at DESC`

    const { rows } = await pool.query(query, params)

    return NextResponse.json(rows)
  } catch (error: any) {
    console.error("Error fetching shipments:", error)
    return NextResponse.json(
      { error: "Lỗi khi lấy danh sách vận chuyển" },
      { status: 500 }
    )
  }
}

// POST - Tạo shipment event mới
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { batchId, fromAddress, toAddress, location, notes } = body

    if (!batchId || !toAddress) {
      return NextResponse.json(
        { error: "Thiếu thông tin bắt buộc" },
        { status: 400 }
      )
    }

    // Update batch status to IN_TRANSIT
    await pool.query(
      `UPDATE drug_batches
       SET status = 'IN_TRANSIT', updated_at = NOW()
       WHERE id = $1`,
      [batchId]
    )

    // Create shipment event
    const insertResult = await pool.query(
      `INSERT INTO supply_chain_events (
        batch_id, event_type, from_address, to_address, location, notes
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        batchId,
        "SHIPPED",
        fromAddress?.toLowerCase() || null,
        toAddress.toLowerCase(),
        location || null,
        notes || null,
      ]
    )

    return NextResponse.json({
      success: true,
      event: insertResult.rows[0],
    })
  } catch (error: any) {
    console.error("Error creating shipment:", error)
    return NextResponse.json(
      { error: "Lỗi khi tạo vận chuyển" },
      { status: 500 }
    )
  }
}
