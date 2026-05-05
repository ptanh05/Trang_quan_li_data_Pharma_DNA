import { type NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// GET - Lấy danh sách tất cả batches hoặc filter theo query
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const manufacturer = searchParams.get("manufacturer")
    const search = searchParams.get("search")

    let query = `
      SELECT
        b.*,
        u.role as manufacturer_role
      FROM drug_batches b
      LEFT JOIN users u ON b.manufacturer_address = u.address
      WHERE 1=1
    `
    const params: any[] = []
    let paramIndex = 1

    if (status) {
      query += ` AND b.status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }

    if (manufacturer) {
      query += ` AND LOWER(b.manufacturer_address) = $${paramIndex}`
      params.push(manufacturer.toLowerCase())
      paramIndex++
    }

    if (search) {
      query += ` AND (
        LOWER(b.batch_number) LIKE $${paramIndex} OR
        LOWER(b.drug_name) LIKE $${paramIndex}
      )`
      params.push(`%${search.toLowerCase()}%`)
      paramIndex++
    }

    query += ` ORDER BY b.created_at DESC`

    const { rows } = await pool.query(query, params)

    return NextResponse.json(rows)
  } catch (error: any) {
    console.error("Error fetching batches:", error)
    return NextResponse.json(
      { error: "Lỗi khi lấy danh sách lô thuốc" },
      { status: 500 }
    )
  }
}

// POST - Tạo batch mới
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      batchNumber,
      drugName,
      manufacturerAddress,
      manufactureDate,
      expiryDate,
      quantity,
      unit,
      description,
      ipfsHash,
    } = body

    if (!batchNumber || !drugName || !manufacturerAddress || !manufactureDate || !expiryDate || !quantity || !unit) {
      return NextResponse.json(
        { error: "Thiếu thông tin bắt buộc" },
        { status: 400 }
      )
    }

    // Check if batch number already exists
    const checkResult = await pool.query(
      "SELECT id FROM drug_batches WHERE batch_number = $1",
      [batchNumber]
    )

    if (checkResult.rows.length > 0) {
      return NextResponse.json(
        { error: "Mã lô thuốc đã tồn tại" },
        { status: 400 }
      )
    }

    // Generate token_id (simple increment, in production use better method)
    const tokenIdResult = await pool.query(
      "SELECT COALESCE(MAX(token_id), 0) + 1 as next_id FROM drug_batches"
    )
    const tokenId = tokenIdResult.rows[0].next_id

    // Insert batch
    const insertResult = await pool.query(
      `INSERT INTO drug_batches (
        token_id, batch_number, drug_name, manufacturer_address,
        manufacture_date, expiry_date, quantity, unit, status, ipfs_hash
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        tokenId,
        batchNumber,
        drugName,
        manufacturerAddress.toLowerCase(),
        manufactureDate,
        expiryDate,
        quantity,
        unit,
        "MANUFACTURED",
        ipfsHash || null,
      ]
    )

    const batch = insertResult.rows[0]

    // Create initial event
    await pool.query(
      `INSERT INTO supply_chain_events (
        batch_id, event_type, from_address, notes
      ) VALUES ($1, $2, $3, $4)`,
      [batch.id, "MANUFACTURED", manufacturerAddress.toLowerCase(), description || "Lô thuốc được sản xuất"]
    )

    return NextResponse.json({
      success: true,
      batch,
    })
  } catch (error: any) {
    console.error("Error creating batch:", error)
    return NextResponse.json(
      { error: "Lỗi khi tạo lô thuốc", detail: error.message },
      { status: 500 }
    )
  }
}
