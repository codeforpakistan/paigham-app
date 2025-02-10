import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'

export default function Hero() {
  return (
    <section className="py-20 px-4 md:px-6 lg:px-8">
      <div className="container mx-auto flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-10 md:mb-0">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">Unify Your Communication</h1>
          <p className="text-xl mb-6">Paigham: Your all-in-one platform for SMS and email messaging.</p>
          <Button size="lg" className="mr-4">
            Start Free Trial
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="outline" size="lg">Learn More</Button>
        </div>
        <div className="md:w-1/2">
          <Image 
            src="/placeholder.svg" 
            alt="Paigham Platform" 
            width={600} 
            height={400} 
            className="rounded-lg shadow-lg"
          />
        </div>
      </div>
    </section>
  )
}