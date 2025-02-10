import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export default function Cta() {
  return (
    <section className="py-20 px-4 md:px-6 lg:px-8 bg-primary text-primary-foreground">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Unify Your Communication?</h2>
        <p className="text-xl mb-8">Start your free trial today and experience the power of Paigham.</p>
        <Button size="lg" variant="secondary">
          Get Started Now
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </section>
  )
}