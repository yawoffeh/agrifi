"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { MapPin, Calendar, Leaf, Star, Coins } from "lucide-react"

// ✅ Mock Data — replace with contract/DB fetch
const mockFarmers = [
  {
    id: "1",
    farmName: "Aburi Organic Farms",
    ensName: "aburi-farms.eth",
    cropType: "Organic Maize",
    bio: "A cooperative of smallholder farmers practicing regenerative agriculture with focus on maize and legumes.",
    totalTokens: 1000,
    soldTokens: 650,
    pricePerToken: 2.5,
    expectedYield: "15%",
    harvestDate: "Dec 2024",
    location: "Aburi, Ghana",
    reputation: 4.8,
    avatar: "/diverse-farmers-harvest.png",
    carbonCredits: 120,
  },
]

const Page = () => {
  const { id } = useParams()
  const [farmer, setFarmer] = useState<any>(null)

  useEffect(() => {
    // simulate fetch
    const data = mockFarmers.find((f) => f.id === id)
    setFarmer(data)
  }, [id])

  if (!farmer) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">
        Loading farmer profile...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <section className="bg-gradient-to-br from-primary/5 to-accent/5 py-16">
        <div className="container mx-auto px-4 flex flex-col items-center text-center">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={farmer.avatar} />
            <AvatarFallback>{farmer.farmName[0]}</AvatarFallback>
          </Avatar>
          <h2 className="text-3xl font-bold text-foreground">{farmer.farmName}</h2>
          <p className="text-primary font-mono">{farmer.ensName}</p>
          <Badge variant="outline" className="mt-2 text-xs">
            ⭐ {farmer.reputation} Reputation
          </Badge>
          <p className="mt-4 text-muted-foreground max-w-xl">{farmer.bio}</p>
        </div>
      </section>

      {/* Content Section */}
      <main className="container mx-auto px-4 py-12 space-y-12">
        {/* Farm Details */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Farm Details</CardTitle>
            <CardDescription>Overview of this farm’s tokenized crop</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> {farmer.location}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" /> Harvest: {farmer.harvestDate}
              </span>
              <span className="flex items-center gap-2">
                <Leaf className="h-4 w-4 text-primary" /> {farmer.cropType}
              </span>
              <span className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-primary" /> ${farmer.pricePerToken}/token
              </span>
            </div>

            <Progress value={(farmer.soldTokens / farmer.totalTokens) * 100} className="h-2" />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {farmer.soldTokens}/{farmer.totalTokens} tokens sold
              </span>
              <span className="font-medium text-foreground">{farmer.expectedYield} Yield</span>
            </div>

            <Button className="w-full">Invest in this Farm</Button>
          </CardContent>
        </Card>

        {/* Climate Impact */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Sustainability Impact</CardTitle>
            <CardDescription>How this farm contributes to climate goals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Carbon Credits Earned:</span>
              <Badge variant="secondary">{farmer.carbonCredits} kg CO₂e</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              This farm uses regenerative practices such as crop rotation, composting, and low-till methods. Verified
              impact is recorded on-chain for transparency.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}


export default Page