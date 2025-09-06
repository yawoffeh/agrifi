"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Leaf, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useWalletContext } from "@/components/contexts/walletContext"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/investments", label: "My Investments" },
  { href: "/farmers", label: "Farmers" },
]

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const { walletAddress, connect } = useWalletContext()
  const pathname = usePathname()

  useEffect(() => {
    if (walletAddress) {
      setIsWalletConnected(true)
    } else {
      setIsWalletConnected(false)
    }
  }, [walletAddress])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Leaf className="h-7 w-7 text-primary" />
            <Link href="/" className="text-xl font-bold text-foreground">
              AgriFi
            </Link>
            <Badge variant="secondary" className="text-xs ml-2">
              Green Yield Finance
            </Badge>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium ${
                  pathname === link.href
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Wallet Section */}
          <div className="flex items-center gap-4">
            {!isWalletConnected ? (
              <Button onClick={connect} className="flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Connect Wallet
              </Button>
            ) : (
              // Clicking the badge/avatar will navigate to the profile page
              <Link href="/profile" className="flex items-center gap-2">
                <Badge variant="outline" className="text-primary border-primary">
                  {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
                </Badge>
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{walletAddress ? walletAddress.slice(2, 3) : "U"}</AvatarFallback>
                </Avatar>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} AgriFi — Empowering sustainable agriculture through blockchain
        </div>
      </footer>
    </div>
  )
}