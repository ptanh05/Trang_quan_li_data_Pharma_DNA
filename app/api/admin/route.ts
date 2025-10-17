import { type NextRequest, NextResponse } from "next/server"
import { getUsers, assignRole, removeRole } from "@/app/actions/admin-actions"

export async function GET() {
  const users = await getUsers()
  return NextResponse.json(users)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const address = body.address?.toLowerCase()
    const role = body.role

    if (!address || !role) {
      return NextResponse.json({ error: "Missing information" }, { status: 400 })
    }

    const result = await assignRole(address, role)

    if (result.error) {
      return NextResponse.json(result, { status: 500 })
    }

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json()
    const address = body.address?.toLowerCase()

    if (!address) {
      return NextResponse.json({ error: "Missing address" }, { status: 400 })
    }

    const result = await removeRole(address)

    if (result.error) {
      return NextResponse.json(result, { status: 500 })
    }

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
