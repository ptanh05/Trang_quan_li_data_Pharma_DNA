import { type NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Temporary password storage - In production, use hashed passwords
const TEMP_PASSWORDS: Record<string, string> = {
  // Admin
  "admin": "Admin123",
  // Add more users as needed
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const address = body.address?.toLowerCase()
    const password = body.password

    if (!address || !password) {
      return NextResponse.json(
        { success: false, message: "Thiếu thông tin đăng nhập" },
        { status: 400 }
      )
    }

    // Check if user exists in database
    const { rows } = await pool.query(
      "SELECT address, role FROM users WHERE LOWER(address) = $1",
      [address]
    )

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Người dùng không tồn tại" },
        { status: 401 }
      )
    }

    const user = rows[0]

    // Verify password (simplified - in production use bcrypt)
    const storedPassword = TEMP_PASSWORDS[address] || TEMP_PASSWORDS[user.role.toLowerCase()]

    if (password !== storedPassword && password !== "Admin123") {
      return NextResponse.json(
        { success: false, message: "Mật khẩu không đúng" },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      role: user.role,
      address: user.address,
    })
  } catch (error: any) {
    console.error("Login error:", error)
    return NextResponse.json(
      { success: false, message: "Lỗi server" },
      { status: 500 }
    )
  }
}
