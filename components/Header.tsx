'use client'

import { Bricolage_Grotesque } from 'next/font/google'
import Link from 'next/link'
import { useState, useEffect } from 'react'

const bricolageGrotesque = Bricolage_Grotesque({
  weight: '700',
  subsets: ['latin'],
})

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu when clicking outside or on a link
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const navLinks = [
    { href: '/docs', label: 'Documentation' },
    { href: 'https://app.happy.engineering', label: 'Web App', external: true },
  ]

  const linkClasses = (mobile = false) => {
    const baseClasses = mobile
      ? 'block px-4 py-3 text-base font-medium transition-colors'
      : 'px-3 py-2 rounded-lg transition-all text-sm font-medium'
    
    const colorClasses = isScrolled 
      ? mobile
        ? 'text-gray-900 hover:bg-gray-50'
        : 'text-gray-600 hover:text-gray-900 hover:bg-white/90'
      : mobile
        ? 'text-white hover:bg-white/10'
        : 'text-white hover:bg-white/40'
    
    return `${baseClasses} ${colorClasses}`
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-[32px] border-b border-gray-200 shadow-sm' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className={`${bricolageGrotesque.className} text-xl font-bold transition-colors ${
              isScrolled ? 'text-black hover:text-gray-700' : 'text-white hover:text-gray-200'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Happy Coder
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={linkClasses()}
                {...(link.external && {
                  target: '_blank',
                  rel: 'noopener noreferrer'
                })}
              >
                {link.label}
              </Link>
            ))}
            <Link 
              href="https://github.com/slopus/happy" 
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2 rounded-lg transition-all ${
                isScrolled 
                  ? 'text-gray-600 hover:text-gray-900 hover:bg-white/90' 
                  : 'text-white hover:bg-white/40'
              }`}
              aria-label="GitHub repository"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="hover:opacity-80 transition-opacity"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className={`md:hidden p-2 rounded-lg transition-all ${
              isScrolled 
                ? 'text-gray-600 hover:text-gray-900 hover:bg-white/90' 
                : 'text-white hover:bg-white/40'
            }`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform duration-200 ${isMobileMenuOpen ? 'rotate-90' : ''}`}
            >
              {isMobileMenuOpen ? (
                <>
                  <path d="M18 6L6 18" />
                  <path d="M6 6l12 12" />
                </>
              ) : (
                <>
                  <path d="M3 12h18" />
                  <path d="M3 6h18" />
                  <path d="M3 18h18" />
                </>
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen 
            ? 'max-h-96 opacity-100' 
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className={`py-4 border-t ${
            isScrolled ? 'border-gray-200' : 'border-white/20'
          }`}>
            <nav className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={linkClasses(true)}
                  onClick={() => setIsMobileMenuOpen(false)}
                  {...(link.external && {
                    target: '_blank',
                    rel: 'noopener noreferrer'
                  })}
                >
                  {link.label}
                  {link.external && (
                    <svg
                      className="inline-block ml-1 w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  )}
                </Link>
              ))}
              <Link
                href="https://github.com/slopus/happy"
                target="_blank"
                rel="noopener noreferrer"
                className={linkClasses(true)}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                GitHub
                <svg
                  className="inline-block ml-1 w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  )
}