import { Suspense } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import SummaryForm from "@/components/summary-form"
import SummaryResult from "@/components/summary-result"
import BackgroundAnimation from "@/components/background-animation"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-gray-100 relative overflow-hidden">
      <BackgroundAnimation />

      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
              Brevio
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              Get concise AI-powered summaries of any YouTube video in seconds
            </p>
          </div>

          <div className="space-y-12">
            <Suspense fallback={<div className="h-20 rounded-xl bg-gray-800/50 animate-pulse"></div>}>
              <SummaryForm />
            </Suspense>

            <Suspense fallback={<div className="h-64 rounded-xl bg-gray-800/50 animate-pulse"></div>}>
              <SummaryResult />
            </Suspense>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
