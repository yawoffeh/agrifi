"use client"

import { useEffect, useState } from "react"
import { useWalletContext } from "@/components/contexts/walletContext"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ethers } from "ethers"

export default function InvestmentsPage() {
  const { walletAddress, getInvestorHistory, getCropToken } = useWalletContext()
  const [investments, setInvestments] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    if (walletAddress) fetchInvestments()
  }, [walletAddress])

  async function fetchInvestments() {
    try {
      const history = await getInvestorHistory(walletAddress)
      const items: any[] = []

      for (const inv of history) {
        const cropId = Number(inv.cropId ?? inv[0])
        const amount = Number(inv.amount ?? inv[1])
        const timestamp = Number(inv.timestamp ?? inv[2])
        const claimed = inv.claimed ?? inv[3]

        const crop = await getCropToken(cropId)
        const cropType = crop?.cropType ?? crop?.[1] ?? "Unknown"
        const variety = crop?.variety ?? crop?.[2] ?? ""

        items.push({
          cropId,
          cropType,
          variety,
          amount,
          date: new Date(timestamp * 1000).toLocaleDateString(),
          claimed,
        })
      }

      setInvestments(items)
    } catch (err) {
      console.error("Failed to fetch investments:", err)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">My Investments</h1>

      {investments.length === 0 ? (
        <p className="text-muted-foreground">No investments yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {investments.map((inv, i) => (
            <Card key={i} className="hover:shadow-md transition">
              <CardHeader>
                <CardTitle>{inv.cropType} ({inv.variety})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>Crop ID: {inv.cropId}</p>
                <p>Tokens: {inv.amount}</p>
                <p>Date: {inv.date}</p>
                <Badge variant={inv.claimed ? "secondary" : "outline"}>
                  {inv.claimed ? "Claimed" : "Active"}
                </Badge>
                <Button
                  className="w-full mt-4"
                  onClick={() => router.push(`/investments/${inv.cropId}`)}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
