import { type NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// GET - Lấy chi tiết batch
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id

    const batchResult = await pool.query(
      `SELECT
        b.*,
        u.role as manufacturer_role
      FROM drug_batches b
      LEFT JOIN users u ON b.manufacturer_address = u.address
      WHERE b.id = $1`,
      [id]
    )

    if (batchResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy lô thuốc" },
        { status: 404 }
      )
    }

    const batch = batchResult.rows[0]

    // Get events
    const eventsResult = await pool.query(
      `SELECT * FROM supply_chain_events
       WHERE batch_id = $1
       ORDER BY created_at DESC`,
      [id]
    )

    return NextResponse.json({
      ...batch,
      events: eventsResult.rows,
    })
  } catch (error: any) {
    console.error("Error fetching batch:", error)
    return NextResponse.json(
      { error: "Lỗi khi lấy thông tin lô thuốc" },
      { status: 500 }
    )
  }
}

// PUT - Cập nhật batch
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const body = await req.json()
    const { status, notes, fromAddress, toAddress, location } = body

    if (!status) {
      return NextResponse.json(
        { error: "Thiếu thông tin trạng thái" },
        { status: 400 }
      )
    }

    // Update batch status
    const updateResult = await pool.query(
      `UPDATE drug_batches
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, id]
    )

    if (updateResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy lô thuốc" },
        { status: 404 }
      )
    }

    // Create event
    let eventType = "MANUFACTURED"
    if (status === "IN_TRANSIT") eventType = "SHIPPED"
    else if (status === "IN_PHARMACY") eventType = "RECEIVED"
    else if (status === "SOLD") eventType = "SOLD"

    await pool.query(
      `INSERT INTO supply_chain_events (
        batch_id, event_type, from_address, to_address, location, notes
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        id,
        eventType,
        fromAddress?.toLowerCase() || null,
        toAddress?.toLowerCase() || null,
        location || null,
        notes || null,
      ]
    )

    return NextResponse.json({
      success: true,
      batch: updateResult.rows[0],
    })
  } catch (error: any) {
    console.error("Error updating batch:", error)
    return NextResponse.json(
      { error: "Lỗi khi cập nhật lô thuốc" },
      { status: 500 }
    )
  }
}

// DELETE - Xóa batch
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id

    // Delete events first (cascade should handle this, but explicit is better)
    await pool.query("DELETE FROM supply_chain_events WHERE batch_id = $1", [id])

    // Delete batch
    const deleteResult = await pool.query(
      "DELETE FROM drug_batches WHERE id = $1 RETURNING *",
      [id]
    )

    if (deleteResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy lô thuốc" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Đã xóa lô thuốc",
    })
  } catch (error: any) {
    console.error("Error deleting batch:", error)
    return NextResponse.json(
      { error: "Lỗi khi xóa lô thuốc" },
      { status: 500 }
    )
  }
}
