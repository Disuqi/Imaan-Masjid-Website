import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Footer from "@/app/components/footer";
import Header from "@/app/components/header";
import '@fontsource/carrois-gothic';
import '@fontsource/abril-fatface';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Imaan Masjid',
    icons: { icon: "./favicon.svg"},
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body id="rootEl" className={inter.className + " min-h-screen bg-bg-100 text-text-100 font-default"}>
        <Header/>
        <div className="relative">
            {children}
        </div>
        <Footer/>
      </body>
    </html>
  )
}
