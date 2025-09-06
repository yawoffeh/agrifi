"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { MapPin, Calendar } from "lucide-react"
import { ethers } from "ethers"
import { useWalletContext } from "@/components/contexts/walletContext"
import toast from "react-hot-toast"

export default function InvestPage() {
  const { id } = useParams()
  const router = useRouter()
  const { walletAddress, connect, getCropToken, investInCrop } = useWalletContext()

  const [isLoading, setIsLoading] = useState(true)
  const [crop, setCrop] = useState<any>(null)
  const [amount, setAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!id) return
    fetchCropDetails(id as string)
  }, [id])

  async function fetchCropDetails(cropId: string) {
    setIsLoading(true)
    try {
      const cv = await getCropToken(cropId)

      const farmer = cv?.farmer ?? cv?.[0] ?? "0x0"
      const cropType = cv?.cropType ?? cv?.[1] ?? ""
      const variety = cv?.variety ?? cv?.[2] ?? ""
      const totalSupply = Number(cv?.totalSupply ?? cv?.[3] ?? 0)
      const priceRaw = cv?.pricePerToken ?? cv?.[4] ?? 0
      const pricePerToken = priceRaw ? String(ethers.formatUnits(priceRaw, 18)) : "0"
      const harvestDateUnix = cv?.harvestDate ?? cv?.[5] ?? 0
      const harvestDate = harvestDateUnix ? new Date(Number(harvestDateUnix) * 1000).toLocaleDateString() : "—"

      setCrop({
        id: Number(cropId),
        farmer,
        cropType,
        variety,
        totalSupply,
        pricePerToken,
        harvestDate,
      })
    } catch (err) {
      console.error("Failed to fetch crop:", err)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleInvest() {
    if (!amount || !crop) return
    try {
      setIsSubmitting(true)
      toast.loading("Waiting for transaction confirmation...", { id: "invest" })

      console.log(crop.id)
      const tx = await investInCrop(crop.id, amount, crop.pricePerToken)

      toast.success("Transaction submitted. Awaiting confirmation...", { id: "invest" })
      router.push("/investments") // back to marketplace or dashboard
    } catch (err) {
      console.error("Investment failed:", err)
      toast.error("Transaction failed. See console for details.", { id: "invest" })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) return <p className="p-8">Loading crop details...</p>

  if (!crop) return <p className="p-8">Crop not found.</p>

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Invest in {crop.cropType}</CardTitle>
          <CardDescription>
            Tokenized crop #{crop.id} by {crop.farmer}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex justify-between">
            <span>Price per Token</span>
            <span className="font-medium">{crop.pricePerToken} ETH</span>
          </div>
          <div className="flex justify-between">
            <span>Harvest Date</span>
            <span className="font-medium">{crop.harvestDate}</span>
          </div>

          <div className="pt-4">
            <label className="block mb-2 text-sm font-medium">Enter Tokens to Buy</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 10"
              min="1"
            />
            {amount && (
              <p className="mt-2 text-sm text-muted-foreground">
                Total Cost:{" "}
                <span className="font-medium">
                  {(Number(amount) * Number(crop.pricePerToken)).toFixed(6)} ETH
                </span>
              </p>
            )}
          </div>

          <Button
            className="w-full"
            disabled={!walletAddress || isSubmitting || !amount}
            onClick={handleInvest}
          >
            {walletAddress
              ? isSubmitting
                ? "Processing..."
                : "Confirm Investment"
              : "Connect Wallet to Invest"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
