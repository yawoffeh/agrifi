"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Wallet, Leaf, TrendingUp, Users, MapPin, Calendar, Coins } from "lucide-react"
import { useWalletContext } from "@/components/contexts/walletContext"
import { ethers } from "ethers"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useEnsName, useEnsAvatar } from "wagmi"


export default function AgriFiPlatform() {
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [activeTab, setActiveTab] = useState("marketplace")
  const router = useRouter()

  // NOTE: using controllers from the WalletContext exactly as you requested
  const { walletAddress, connect, getActiveCrops, getCropToken, getInvestorHistory } = useWalletContext()

  const [cropTokens, setCropTokens] = useState<any[]>([])
  const [loadingCrops, setLoadingCrops] = useState(false)
  const [myInvestments, setMyInvestments] = useState<any[]>([])

  const { data: ensName } = useEnsName({
    address: walletAddress as `0x${string}`,
    chainId: 1, // ENS lives on Ethereum mainnet
  })

  const { data: ensAvatar } = useEnsAvatar({
    name: ensName ?? undefined,
    chainId: 1,
  })

  useEffect(() => {
    if (walletAddress) fetchMyInvestments()
  }, [walletAddress])

  async function fetchMyInvestments() {
    const history = await getInvestorHistory(walletAddress)
    const items: any[] = []

    for (const inv of history) {
      const cropId = Number(inv.cropId ?? inv[0])
      const amount = Number(inv.amount ?? inv[1])
      const crop = await getCropToken(cropId)

      items.push({
        cropId,
        cropType: crop?.cropType ?? "Unknown",
        variety: crop?.variety ?? "",
        tokensOwned: amount,
      })
    }
    setMyInvestments(items)
  }


  useEffect(() => {
    if (walletAddress) {
      setIsWalletConnected(true)
      fetchActiveCrops()
    } else {
      setIsWalletConnected(false)
      // try connecting automatically (optional)
      connect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress])

  async function fetchActiveCrops() {
    setLoadingCrops(true)
    try {
      // getActiveCrops should return an array of crop IDs (uint256[])
      const ids: any[] = await getActiveCrops()
      if (!ids || ids.length === 0) {
        setCropTokens([])
        return
      }

      // for each id, fetch the CropView struct via getCropToken(id)
      const crops: any[] = []
      for (const rawId of ids) {
        try {
          // normalize id (could be BigInt or string)
          const id = Number(rawId)

          // fetch on-chain details
          const cv = await getCropToken(rawId)

          // normalize structure (supports both tuple-array and named fields)
          const farmer = cv?.farmer ?? cv?.[0] ?? "0x0"
          const cropType = cv?.cropType ?? cv?.[1] ?? ""
          const variety = cv?.variety ?? cv?.[2] ?? ""
          const totalSupply = Number(cv?.totalSupply ?? cv?.[3] ?? 0)
          const priceRaw = cv?.pricePerToken ?? cv?.[4] ?? 0
          // priceRaw may be BigInt or string; formatUnits works with either
          const pricePerToken = priceRaw ? String(ethers.formatUnits(priceRaw, 18)) : "0"
          const harvestDateUnix = cv?.harvestDate ?? cv?.[5] ?? 0
          const harvestDate = harvestDateUnix ? new Date(Number(harvestDateUnix) * 1000).toLocaleDateString() : "—"
          const carbonCredits = Number(cv?.carbonCredits ?? cv?.[6] ?? 0)
          const isActive = cv?.isActive ?? cv?.[7] ?? false
          const totalInvestedRaw = cv?.totalInvested ?? cv?.[8] ?? 0
          const totalInvested = totalInvestedRaw ? String(totalInvestedRaw) : "0"
          const metadataURI = cv?.metadataURI ?? cv?.[9] ?? ""

          // NOTE: your contract doesn't directly expose "soldTokens" or "location/reputation" in CropView
          // so we show what we have from the contract. You can augment this by:
          // - fetching balanceOf(contractAddress, id) to compute available tokens
          // - fetching metadataURI to get the image & optional location/reputation in metadata.json
          crops.push({
            id,
            farmer,
            cropType,
            variety,
            totalSupply,
            // pricePerToken is a string in ETH (e.g. "0.1000")
            pricePerToken,
            harvestDate,
            carbonCredits,
            isActive,
            totalInvested,
            metadataURI,
            // placeholders for UI fields that are off-chain / optional
            ensName: "", // you can get this from farmer ENS or metadata if you store it
            location: "—",
            reputation: "—",
            soldTokens: 0,
            expectedYield: "—",
            avatar: "/placeholder.svg",
          })
        } catch (err) {
          console.error("Failed to fetch crop for id:", rawId, err)
        }
      }


      setCropTokens(crops)
    } catch (err) {
      console.error("Failed to fetch active crops:", err)
      setCropTokens([])
    } finally {
      setLoadingCrops(false)
    }
  }

  // Optional helper to fetch metadata JSON and return image URL (if metadataURI points to JSON)
  // You can call this for each crop to pull the image for the card. I did NOT auto-call it
  // for every crop (costly) — but here's a helper you can use if you want to display images.
  async function fetchMetadataImage(metadataURI: string) {
    if (!metadataURI) return "/placeholder.svg"
    try {
      let url = metadataURI
      if (metadataURI.startsWith("ipfs://")) {
        url = `https://ipfs.io/ipfs/${metadataURI.slice(7)}`
      }
      const res = await fetch(url)
      if (!res.ok) return "/placeholder.svg"
      const json = await res.json()
      let img = json.image || json.imageUrl || json.image_url
      if (!img) return "/placeholder.svg"
      if (img.startsWith("ipfs://")) img = `https://ipfs.io/ipfs/${img.slice(7)}`
      return img
    } catch (err) {
      console.warn("metadata fetch failed:", err)
      return "/placeholder.svg"
    }
  }

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
              <Button onClick={() => connect()} className="flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Connect Wallet
              </Button>
            ) : (
              <div className="flex items-center gap-4">
                {!isWalletConnected ? (
                  <Button onClick={connect} className="flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    Connect Wallet
                  </Button>
                ) : (
              <Link href="/profile" className="flex items-center gap-2">
                <Badge variant="outline" className="text-primary border-primary">
                  {ensName || `${walletAddress?.slice(0, 6)}...${walletAddress?.slice(-4)}`}
                </Badge>
                <Avatar className="h-8 w-8">
                  {ensAvatar ? (
                    <AvatarImage src={ensAvatar} alt={ensName ?? walletAddress} />
                  ) : (
                    <AvatarFallback>
                      {walletAddress ? walletAddress.slice(2, 3) : "U"}
                    </AvatarFallback>
                  )}
                </Avatar>
              </Link>
            )}
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
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
            <TabsTrigger value="dashboard" disabled={!isWalletConnected}>
              My Investments
            </TabsTrigger>
          </TabsList>

          {/* Marketplace Tab */}
          <TabsContent value="marketplace" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold text-foreground">Active Crop Tokens</h3>
              <Badge variant="secondary">{cropTokens.length} Available</Badge>
            </div>

            {loadingCrops ? (
              <p className="text-muted-foreground">Loading crops...</p>
            ) : cropTokens.length === 0 ? (
              <p className="text-muted-foreground">No active crops found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cropTokens.map((token) => (
                  <Card key={token.id} className="hover:shadow-lg transition-shadow border-border">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={token.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{String(token.farmer).slice(2, 4).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{token.cropType || `Crop #${token.id}`}</CardTitle>
                            <CardDescription className="text-primary font-mono text-sm">{token.ensName || token.farmer.slice(0, 6)}...{token.farmer?.slice(-4)}</CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          ⭐ {token.reputation ?? "—"}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-foreground">{token.variety || "—"}</span>
                          <Badge className="bg-accent text-accent-foreground">{token.expectedYield} Yield</Badge>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <MapPin className="h-3 w-3" />
                          <span>{token.location}</span>
                          <Calendar className="h-3 w-3 ml-2" />
                          <span>{token.harvestDate}</span>
                        </div>

                        <Progress value={token.totalSupply ? (token.soldTokens / token.totalSupply) * 100 : 0} className="h-2 mb-2" />
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {token.soldTokens}/{token.totalSupply} tokens sold
                          </span>
                          <span className="font-medium text-foreground">{Number(token.pricePerToken).toFixed(6)} ETH/token</span>
                        </div>
                      </div>

                      <Button
                          className="w-full hover:scale-[1.02] transition-transform hover:cursor-pointer"
                          disabled={!isWalletConnected}
                          onClick={() => router.push(`/invest/${token.id}`)}
                        >
                          Invest Now
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          {/* My Investments Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold text-foreground">My Investments</h3>
              <Badge variant="secondary">{myInvestments.length} Investments</Badge>
            </div>
            
            {!isWalletConnected ? (
              <p className="text-muted-foreground">Connect your wallet to view investments.</p>
            ) : myInvestments.length === 0 ? (
              <p className="text-muted-foreground">No investments yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myInvestments.map((inv, i) => (
                  <Card key={i} className="hover:shadow-md transition-shadow border-border">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          {/* <AvatarFallback>{inv.farmName[0]}</AvatarFallback> */}
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{inv.farmName}</CardTitle>
                          <CardDescription className="text-primary font-mono text-sm">{inv.cropType}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Tokens Owned</span>
                          <span className="font-medium text-foreground">{inv.tokensOwned}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Investment Value</span>
                          <span className="font-medium text-foreground">${inv.investmentValue}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Current Value</span>
                          <span className="font-medium text-foreground">${inv.currentValue}</span>
                        </div>
                        {/* <div className="flex justify-between">
                          <span>ROI</span>
                          <span className={`font-medium ${inv.roi.startsWith('+') ? 'text-green-500' : inv.roi.startsWith('-') ? 'text-red-500' : ''}`}>{inv.roi}</span>
                        </div> */}
                      </div>
                      <Button
                        className="w-full hover:scale-[1.02] transition-transform hover:cursor-pointer"
                        onClick={() => router.push(`/investments/${inv.cropId}`)}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
