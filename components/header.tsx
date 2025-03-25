"use client"

import Link from 'next/link'
import { Button } from './ui/button'

export default function Header() {
  return (
    <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold">Paigham</span>
        </Link>
        
        <nav className="flex items-center gap-4">
          <Link 
            href="/auth/login"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Log in
          </Link>
          <Link href="/auth/register">
            <Button variant="secondary" size="sm">
              Sign up
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}