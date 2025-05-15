"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X, Youtube } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled ? "bg-gray-900/80 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Youtube className="h-6 w-6 text-red-500" />
              <span className="font-bold text-xl">Brevio</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-sm font-medium hover:text-purple-400 transition-colors">
              Home
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium hover:text-purple-400 transition-colors">
              How It Works
            </Link>
            <Link href="#about" className="text-sm font-medium hover:text-purple-400 transition-colors">
              About
            </Link>
            <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/10">
              Sign In
            </Button>
          </nav>

          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-gray-950 p-4">
          <div className="flex justify-end">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
              <X className="h-6 w-6" />
            </Button>
          </div>
          <nav className="flex flex-col items-center justify-center h-full space-y-8">
            <Link
              href="/"
              className="text-xl font-medium hover:text-purple-400 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="#how-it-works"
              className="text-xl font-medium hover:text-purple-400 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link
              href="#about"
              className="text-xl font-medium hover:text-purple-400 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>
            <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/10">
              Sign In
            </Button>
          </nav>
        </div>
      )}
    </header>
  )
}
