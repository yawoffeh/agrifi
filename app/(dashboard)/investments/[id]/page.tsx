"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useWalletContext } from "@/components/contexts/walletContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function InvestmentDetails() {
  const { id } = useParams()
  const { walletAddress, getInvestment, getCropToken } = useWalletContext()
  const [details, setDetails] = useState<any>(null)

  useEffect(() => {
    if (walletAddress && id) fetchDetails()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress, id])

  async function fetchDetails() {
    try {
      const inv = await getInvestment(id, walletAddress)
      const crop = await getCropToken(id)

      const amount = Number(inv.amount ?? inv[1] ?? 0)
      const claimed = inv.claimed ?? inv[3] ?? false
      const date = new Date(Number(inv.timestamp ?? inv[2]) * 1000).toLocaleDateString()

      setDetails({
        cropId: Number(id),
        cropType: crop?.cropType ?? crop?.[1] ?? "",
        variety: crop?.variety ?? crop?.[2] ?? "",
        totalSupply: Number(crop?.totalSupply ?? crop?.[3] ?? 0),
        pricePerToken: crop?.pricePerToken ? String(crop.pricePerToken) : "0",
        amount,
        date,
        claimed,
      })
    } catch (err) {
      console.error("Failed to fetch investment details:", err)
    }
  }

  if (!details) return <p className="p-8">Loading investment details...</p>

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>
            Investment in {details.cropType} ({details.variety})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p><strong>Crop ID:</strong> {details.cropId}</p>
          <p><strong>Tokens Owned:</strong> {details.amount}</p>
          <p><strong>Date:</strong> {details.date}</p>
          <p><strong>Price Per Token:</strong> {details.pricePerToken}</p>
          <Badge variant={details.claimed ? "secondary" : "outline"}>
            {details.claimed ? "Claimed" : "Active"}
          </Badge>
        </CardContent>
      </Card>
    </div>
  )
}
