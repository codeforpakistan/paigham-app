import Link from 'next/link'
import { MessageSquare } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="py-8 px-4 md:px-6 lg:px-8 border-t">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <MessageSquare className="h-6 w-6" />
            <span className="font-bold text-xl">Paigham</span>
          </div>
          <nav className="flex flex-wrap justify-center md:justify-end space-x-4 mb-4 md:mb-0">
            <Link href="#" className="text-sm hover:underline">Features</Link>
            <Link href="#" className="text-sm hover:underline">Pricing</Link>
            <Link href="#" className="text-sm hover:underline">About</Link>
            <Link href="#" className="text-sm hover:underline">Contact</Link>
          </nav>
          <div className="text-sm text-gray-500">
            © 2025 Paigham. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}