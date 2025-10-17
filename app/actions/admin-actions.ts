"use server"

import { Pool } from "pg"
import { ethers } from "ethers"
import pharmaNFTAbi from "@/lib/pharmaNFT-abi.json"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const PHARMA_NFT_ADDRESS = process.env.PHARMA_NFT_ADDRESS || "0xaa3f88a6b613985f3D97295D6BAAb6246c2699c6"
const PHARMADNA_RPC = "https://pharmadna-2759821881746000-1.jsonrpc.sagarpc.io"
const OWNER_PRIVATE_KEY = process.env.OWNER_PRIVATE_KEY

export async function getUsers() {
  try {
    const { rows } = await pool.query("SELECT address, role, assigned_at FROM users")
    return rows.map((u: { address: string; role: string; assigned_at: string }) => ({
      ...u,
      address: u.address.toLowerCase(),
      assignedAt: u.assigned_at,
    }))
  } catch (error) {
    console.error("Error fetching users:", error)
    return []
  }
}

export async function assignRole(address: string, role: string) {
  try {
    const normalizedAddress = address.toLowerCase()
    const now = new Date().toISOString()

    await pool.query(
      `INSERT INTO users (address, role, assigned_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (address) DO UPDATE SET role = $2, assigned_at = $3`,
      [normalizedAddress, role, now],
    )

    if (!OWNER_PRIVATE_KEY) throw new Error("OWNER_PRIVATE_KEY not set")

    const provider = new ethers.JsonRpcProvider(PHARMADNA_RPC)

    if (!PHARMA_NFT_ADDRESS || PHARMA_NFT_ADDRESS === "0x" || PHARMA_NFT_ADDRESS.length < 10) {
      throw new Error("PHARMA_NFT_ADDRESS is not configured")
    }

    const code = await provider.getCode(PHARMA_NFT_ADDRESS)
    if (!code || code === "0x") {
      throw new Error(`No contract code at PHARMA_NFT_ADDRESS: ${PHARMA_NFT_ADDRESS}`)
    }

    const ownerWallet = new ethers.Wallet(OWNER_PRIVATE_KEY, provider)
    const contract = new ethers.Contract(PHARMA_NFT_ADDRESS, pharmaNFTAbi.abi || pharmaNFTAbi, ownerWallet)

    const roleEnumMap: Record<string, number> = {
      MANUFACTURER: 1,
      DISTRIBUTOR: 2,
      PHARMACY: 3,
      ADMIN: 4,
    }

    const roleEnum = roleEnumMap[String(role)]
    if (!roleEnum) throw new Error("Invalid role")

    console.log("Assigning role on contract:", normalizedAddress, roleEnum)
    const tx = await contract.assignRole(normalizedAddress, roleEnum)
    console.log("Tx hash:", tx.hash)
    await tx.wait()

    const roleOnChain = await contract.roles(normalizedAddress)
    console.log("Role on chain after assign:", roleOnChain)

    return { success: true }
  } catch (err: any) {
    console.error("Error assigning role:", err)
    return {
      error: "Error syncing role to contract",
      detail: err?.message || String(err),
      hints: [
        "Check PHARMA_NFT_ADDRESS is correct on PharmaDNA",
        "Ensure OWNER_PRIVATE_KEY has PDNA balance and is contract owner",
        "Check PharmaDNA RPC endpoint is working",
      ],
    }
  }
}

export async function removeRole(address: string) {
  try {
    const normalizedAddress = address.toLowerCase()
    await pool.query("DELETE FROM users WHERE address = $1", [normalizedAddress])
    return { success: true }
  } catch (error) {
    console.error("Error removing role:", error)
    return { error: "Error removing role" }
  }
}
