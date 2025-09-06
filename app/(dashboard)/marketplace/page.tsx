"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useWalletContext } from "@/components/contexts/walletContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function MarketplacePage() {
  const { getActiveCrops, getCropToken } = useWalletContext()
  const [crops, setCrops] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    fetchCrops()
  }, [])

  async function fetchCrops() {
    try {
      const activeIds = await getActiveCrops()
      const list: any[] = []
      for (const id of activeIds) {
        try {
          const c = await getCropToken(id)
          list.push({
            id: Number(id),
            farmer: c?.farmer ?? c?.[0],
            cropType: c?.cropType ?? c?.[1],
            variety: c?.variety ?? c?.[2],
            totalSupply: Number(c?.totalSupply ?? c?.[3] ?? 0),
            pricePerToken: c?.pricePerToken?.toString() ?? "0",
            isActive: c?.isActive ?? c?.[7] ?? false,
          })
        } catch (err) {
          console.error("Failed to fetch crop:", id, err)
        }
      }
      setCrops(list)
    } catch (err) {
      console.error("Failed to load marketplace crops:", err)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Marketplace</h1>

      {crops.length === 0 ? (
        <p>No tokenized crops available in the marketplace right now.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {crops.map((c) => (
            <Card key={c.id} className="hover:shadow-md transition">
              <CardHeader className="flex items-center justify-between">
                <div>
                  <CardTitle>{c.cropType}</CardTitle>
                  <p className="text-sm text-muted-foreground">{c.variety}</p>
                </div>
                <Badge variant="outline">
                  {c.isActive ? "Active" : "Closed"}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>
                  <strong>Crop ID:</strong> {c.id}
                </p>
                <p>
                  <strong>Total Supply:</strong> {c.totalSupply}
                </p>
                <p>
                  <strong>Price/Token:</strong> {c.pricePerToken}
                </p>
                <Button
                  className="w-full mt-3"
                  onClick={() => router.push(`/invest/${c.id}`)}
                  disabled={!c.isActive}
                >
                  Invest Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
