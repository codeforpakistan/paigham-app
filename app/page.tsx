"use client"
import Header from '@/components/header'
import { Hero } from "@/components/ui/animated-hero"
import Features from '@/components/features'
import Testimonials from '@/components/testimonials'
import Cta from '@/components/cta'
import Footer from '@/components/footer'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Hero />
        <Features />
        <Testimonials />
        <Cta />
      </main>
      <Footer />
    </div>
  )
}