"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useWalletContext } from "@/components/contexts/walletContext"

export default function ProfilePage() {
  const router = useRouter()
  const { walletAddress, connect, registerFarmer, getCropToken, getFarmer } = useWalletContext()

  const [loading, setLoading] = useState(false)
  const [farmer, setFarmer] = useState<any>(null)
  const [cropViews, setCropViews] = useState<any[]>([])

  // registration form states
  const [ensName, setEnsName] = useState("")
  const [name, setName] = useState("")
  const [location, setLocation] = useState("")
  const [registering, setRegistering] = useState(false)

  useEffect(() => {
    if (!walletAddress) {
      connect()
      return
    }
    fetchFarmer()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress])

  async function fetchFarmer() {
    setLoading(true)
    try {
      const raw = await getFarmer(walletAddress)
      console.log("Raw farmer data", raw)
      if (!raw) {
        setFarmer(null)
        setCropViews([])
        return
      }
      const ensName = raw?.ensName ?? raw?.[0] ?? ""
      const name = raw?.name ?? raw?.[1] ?? ""
      const loc = raw?.location ?? raw?.[2] ?? ""
      const reputation = raw?.reputationScore ?? raw?.[3] ?? 0
      const isRegistered = raw?.isRegistered ?? raw?.[4] ?? false
      const cropIdsRaw = raw?.cropIds ?? raw?.[5] ?? []
      const cropIds = Array.isArray(cropIdsRaw) ? cropIdsRaw.map((x: any) => Number(x)) : []

      const farmerObj = {
        ensName,
        name,
        location: loc,
        reputation: Number(reputation),
        isRegistered,
        cropIds,
      }

      setFarmer(farmerObj)

      if (cropIds.length > 0) {
        const cviews: any[] = []
        for (const id of cropIds) {
          try {
            const cv = await getCropToken(id)
            const normalized = {
              id,
              farmer: cv?.farmer ?? cv?.[0],
              cropType: cv?.cropType ?? cv?.[1],
              variety: cv?.variety ?? cv?.[2],
              totalSupply: Number(cv?.totalSupply ?? cv?.[3] ?? 0),
              pricePerToken: cv?.pricePerToken ?? cv?.[4] ?? 0,
              harvestDate: Number(cv?.harvestDate ?? cv?.[5] ?? 0),
              carbonCredits: Number(cv?.carbonCredits ?? cv?.[6] ?? 0),
              isActive: cv?.isActive ?? cv?.[7] ?? false,
              totalInvested: Number(cv?.totalInvested ?? cv?.[8] ?? 0),
              metadataURI: cv?.metadataURI ?? cv?.[9] ?? "",
            }
            cviews.push(normalized)
          } catch (err) {
            console.error("Failed fetching crop token", id, err)
          }
        }
        setCropViews(cviews)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(e: any) {
    e.preventDefault()
    setRegistering(true)
    try {
      const tx = await registerFarmer(ensName, name, location)
      await fetchFarmer()
    } catch (err) {
      console.error(err)
      alert("Registration failed. See console.")
    } finally {
      setRegistering(false)
    }
  }

  function shortenAddress(addr: string) {
    return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : ""
  }

  if (!walletAddress) {
    return (
      <div className="container mx-auto px-4 py-24 text-center text-muted-foreground">
        <p>Please connect your wallet to view your profile.</p>
        <Button onClick={() => connect()} className="mt-4">
          Connect Wallet
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="h-16 w-16">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback>{walletAddress ? walletAddress.slice(2, 3) : "U"}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {farmer?.name || shortenAddress(walletAddress)}
            </h1>
            <p className="text-primary font-mono">
              {farmer?.ensName && farmer.ensName !== ""
                ? farmer.ensName
                : shortenAddress(walletAddress)}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="outline">
                {farmer?.isRegistered ? "Farmer" : "Visitor"}
              </Badge>
              <Badge variant="secondary">{farmer?.reputation ?? "—"} Reputation</Badge>
              {farmer?.isRegistered && (
                <Link href="/farmer/tokenize">
                  <Button size="sm" className="ml-2">Tokenize Crop</Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Not registered -> show register form */}
        {!farmer?.isRegistered ? (
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Register as Farmer</CardTitle>
              <CardDescription>
                Provide your details to start tokenizing crops. ENS is optional.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <input
                    placeholder="ENS (optional, e.g. aburi-farms.eth)"
                    value={ensName}
                    onChange={(e) => setEnsName(e.target.value)}
                    className="input"
                  />
                  <span className="text-xs text-muted-foreground mt-1">
                    Don’t have ENS?{" "}
                    <a
                      href="https://app.ens.domains"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      Register one
                    </a>
                  </span>
                </div>
                <input
                  placeholder="Name (e.g. Aburi Farms)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  required
                />
                <input
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="input"
                  required
                />
                <div className="md:col-span-3">
                  <Button type="submit" disabled={registering}>
                    {registering ? "Registering..." : "Register"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          // Registered -> show farmer details and crops
          <div className="space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Farm Overview</CardTitle>
                <CardDescription>On-chain data for your farm</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">ENS</div>
                    <div className="font-medium">
                      {farmer?.ensName || "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Location</div>
                    <div className="font-medium">{farmer?.location}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Reputation</div>
                    <div className="font-medium">{farmer?.reputation}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <section>
              <h3 className="text-lg font-semibold mb-3">My Tokenized Crops</h3>
              {cropViews.length === 0 ? (
                <Card className="border-border">
                  <CardContent>No tokenized crops yet. Click "Tokenize Crop" to create one.</CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cropViews.map((c) => (
                    <Card key={c.id} className="border-border">
                      <CardHeader>
                        <div className="flex items-center justify-between w-full">
                          <div>
                            <CardTitle>{c.cropType}</CardTitle>
                            <CardDescription className="text-sm">{c.variety}</CardDescription>
                          </div>
                          <Badge variant="outline">{c.isActive ? "Active" : "Closed"}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-muted-foreground mb-2">
                          Price per token: {String(c.pricePerToken)}
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-muted-foreground">Total Supply</div>
                          <div className="font-medium">{c.totalSupply}</div>
                        </div>
                        <div className="mt-3 text-sm">
                          Metadata URI:{" "}
                          <a
                            className="text-primary break-all"
                            href={c.metadataURI}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {c.metadataURI}
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
