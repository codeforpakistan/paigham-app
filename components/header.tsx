import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MessageSquare } from 'lucide-react'

export default function Header() {
  return (
    <header className="py-4 px-4 md:px-6 lg:px-8 border-b">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <MessageSquare className="h-6 w-6" />
          <span className="font-bold text-xl">Paigham</span>
        </Link>
        <nav className="hidden md:flex space-x-4">
          <Link href="#features" className="text-sm font-medium hover:underline">Features</Link>
          <Link href="#pricing" className="text-sm font-medium hover:underline">Pricing</Link>
          <Link href="#" className="text-sm font-medium hover:underline">About</Link>
        </nav>
        <Button>Get Started</Button>
      </div>
    </header>
  )
}