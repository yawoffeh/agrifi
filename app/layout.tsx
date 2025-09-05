import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { WalletProvider } from "../components/contexts/walletContext";
import './globals.css'

export const metadata: Metadata = {
  title: 'Agrifi',
  description: 'Created with Agrifi',
  generator: 'Agrifi',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <WalletProvider>
          {children}
        </WalletProvider>
        <Analytics />
      </body>
    </html>
  )
}
