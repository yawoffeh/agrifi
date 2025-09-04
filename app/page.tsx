"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Wallet, Leaf, TrendingUp, Users, MapPin, Calendar, Coins } from "lucide-react"

export default function AgriFiPlatform() {
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [activeTab, setActiveTab] = useState("marketplace")

  const connectWallet = () => {
    // Simulate wallet connection
    setIsWalletConnected(true)
  }

  const cropTokens = [
    {
      id: 1,
      farmName: "Aburi Organic Farms",
      ensName: "aburi-farms.eth",
      cropType: "Organic Maize",
      totalTokens: 1000,
      soldTokens: 650,
      pricePerToken: 2.5,
      expectedYield: "15%",
      harvestDate: "Dec 2024",
      location: "Aburi, Ghana",
      reputation: 4.8,
      avatar: "/diverse-farmers-harvest.png",
    },
    {
      id: 2,
      farmName: "Kumasi Green Valley",
      ensName: "kumasi-valley.eth",
      cropType: "Cocoa Beans",
      totalTokens: 500,
      soldTokens: 320,
      pricePerToken: 5.0,
      expectedYield: "18%",
      harvestDate: "Jan 2025",
      location: "Kumasi, Ghana",
      reputation: 4.6,
      avatar: "/cocoa-farmer.jpg",
    },
    {
      id: 3,
      farmName: "Tamale Sustainable Co-op",
      ensName: "tamale-coop.eth",
      cropType: "Shea Nuts",
      totalTokens: 750,
      soldTokens: 200,
      pricePerToken: 3.2,
      expectedYield: "12%",
      harvestDate: "Mar 2025",
      location: "Tamale, Ghana",
      reputation: 4.9,
      avatar: "/shea-farmer.jpg",
    },
  ]

  const myInvestments = [
    {
      farmName: "Aburi Organic Farms",
      cropType: "Organic Maize",
      tokensOwned: 50,
      investmentValue: 125,
      currentValue: 142,
      roi: "+13.6%",
    },
    {
      farmName: "Kumasi Green Valley",
      cropType: "Cocoa Beans",
      tokensOwned: 25,
      investmentValue: 125,
      currentValue: 138,
      roi: "+10.4%",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">AgriFi</h1>
            <Badge variant="secondary" className="text-xs">
              Green Yield Finance
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            {!isWalletConnected ? (
              <Button onClick={connectWallet} className="flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Connect Wallet
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-primary border-primary">
                  0x1234...5678
                </Badge>
                <Avatar className="h-8 w-8">
                  <AvatarFallback>W</AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 to-accent/5 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-foreground mb-4 text-balance">Invest in Sustainable Agriculture</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
            Support farmers through crop tokenization and earn yield-based returns while promoting sustainable farming
            practices.
          </p>
          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span>15% Avg. Yield</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span>500+ Farmers</span>
            </div>
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-primary" />
              <span>$2M+ Funded</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
            <TabsTrigger value="dashboard" disabled={!isWalletConnected}>
              My Investments
            </TabsTrigger>
            <TabsTrigger value="farmers">Farmers</TabsTrigger>
          </TabsList>

          {/* Marketplace Tab */}
          <TabsContent value="marketplace" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold text-foreground">Active Crop Tokens</h3>
              <Badge variant="secondary">{cropTokens.length} Available</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cropTokens.map((token) => (
                <Card key={token.id} className="hover:shadow-lg transition-shadow border-border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={token.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{token.farmName[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{token.farmName}</CardTitle>
                          <CardDescription className="text-primary font-mono text-sm">{token.ensName}</CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        ⭐ {token.reputation}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-foreground">{token.cropType}</span>
                        <Badge className="bg-accent text-accent-foreground">{token.expectedYield} Yield</Badge>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <MapPin className="h-3 w-3" />
                        <span>{token.location}</span>
                        <Calendar className="h-3 w-3 ml-2" />
                        <span>{token.harvestDate}</span>
                      </div>

                      <Progress value={(token.soldTokens / token.totalTokens) * 100} className="h-2 mb-2" />
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {token.soldTokens}/{token.totalTokens} tokens sold
                        </span>
                        <span className="font-medium text-foreground">${token.pricePerToken}/token</span>
                      </div>
                    </div>

                    <Button className="w-full" disabled={!isWalletConnected}>
                      {isWalletConnected ? "Invest Now" : "Connect Wallet to Invest"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold text-foreground">My Investments</h3>
              <Badge variant="secondary">{myInvestments.length} Active</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myInvestments.map((investment, index) => (
                <Card key={index} className="border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">{investment.farmName}</CardTitle>
                    <CardDescription>{investment.cropType}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tokens Owned:</span>
                      <span className="font-medium">{investment.tokensOwned}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Investment:</span>
                      <span className="font-medium">${investment.investmentValue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current Value:</span>
                      <span className="font-medium">${investment.currentValue}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-muted-foreground">ROI:</span>
                      <Badge className="bg-accent text-accent-foreground">{investment.roi}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Farmers Tab */}
          <TabsContent value="farmers" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold text-foreground">Featured Farmers</h3>
              <Button variant="outline">View All</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cropTokens.map((farmer) => (
                <Card key={farmer.id} className="border-border">
                  <CardHeader className="text-center">
                    <Avatar className="h-16 w-16 mx-auto mb-3">
                      <AvatarImage src={farmer.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="text-lg">{farmer.farmName[0]}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-lg">{farmer.farmName}</CardTitle>
                    <CardDescription className="text-primary font-mono">{farmer.ensName}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center space-y-3">
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{farmer.location}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      ⭐ {farmer.reputation} Rating
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      Specializes in {farmer.cropType.toLowerCase()} with sustainable farming practices.
                    </p>
                    <Button variant="outline" className="w-full bg-transparent">
                      View Profile
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 mt-16">
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Leaf className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold text-foreground">AgriFi</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Empowering sustainable agriculture through blockchain technology
          </p>
        </div>
      </footer>
    </div>
  )
}
