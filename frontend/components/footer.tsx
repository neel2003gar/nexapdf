import Link from 'next/link'
import { FileText, Shield, Zap, Github, Instagram, Facebook, Linkedin } from 'lucide-react'
import { UsageIndicator } from '@/components/usage-indicator'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <img
                  src="/nexa-pdf/logo.svg"
                  alt="NexaPDF"
                  width={24}
                  height={24}
                  className="h-6 w-6"
                  onError={(e) => {
                    // Fallback to PNG if SVG fails
                    e.currentTarget.src = '/logo.png'
                    e.currentTarget.onerror = () => {
                      // Hide image and show icon if both fail
                      e.currentTarget.style.display = 'none'
                      const icon = e.currentTarget.parentElement?.querySelector('.fallback-icon-footer')
                      if (icon) icon.classList.remove('hidden')
                    }
                  }}
                />
                <FileText className="h-6 w-6 text-primary fallback-icon-footer hidden" />
                <span className="font-bold text-lg">NexaPDF</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Professional PDF processing platform with 16+ powerful tools for all your document needs.
            </p>
          </div>

          {/* Tools Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Popular Tools</h3>
            <div className="space-y-2">
              <Link href="/merge" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Merge PDFs
              </Link>
              <Link href="/split" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Split PDF
              </Link>
              <Link href="/compress" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Compress PDF
              </Link>
              <Link href="/pdf-to-word" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                PDF to Word
              </Link>
            </div>
          </div>

          {/* Features Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Features</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Secure Processing</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Zap className="h-4 w-4" />
                <span>Fast & Reliable</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>16+ PDF Tools</span>
              </div>
            </div>
          </div>

          {/* Support Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Support</h3>
            <div className="space-y-2">
              <Link href="/support" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Help Center
              </Link>
              <Link href="/privacy" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center md:items-start gap-2">
              <div className="flex items-center gap-4">
                <p className="text-sm text-muted-foreground">
                  © {currentYear} NexaPDF. All rights reserved.
                </p>
                {/* Usage Indicator */}
                <UsageIndicator />
              </div>
              <p className="text-sm text-muted-foreground">
                Built with ❤️ by{' '}
                <span className="font-medium text-foreground">Neel Pachchigar</span>
              </p>
            </div>
            
            <div className="flex flex-col items-center md:items-end gap-4">
              {/* Social Media Links */}
              <div className="flex items-center gap-4">
                <Link
                  href="https://github.com/neel2003gar"
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="GitHub Profile"
                >
                  <Github className="h-5 w-5" />
                </Link>
                <Link
                  href="https://www.linkedin.com/in/neel25gar/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="LinkedIn Profile"
                >
                  <Linkedin className="h-5 w-5" />
                </Link>
                <Link
                  href="https://www.instagram.com/neel25gar/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Instagram Profile"
                >
                  <Instagram className="h-5 w-5" />
                </Link>
                <Link
                  href="https://www.facebook.com/Neel25gar"
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Facebook Profile"
                >
                  <Facebook className="h-5 w-5" />
                </Link>
              </div>
              
              {/* Tech Stack */}
              <p className="text-sm text-muted-foreground">
                Built with{' '}
                <Link
                  href="https://nextjs.org"
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium underline underline-offset-4 hover:text-foreground transition-colors"
                >
                  Next.js
                </Link>{' '}
                and{' '}
                <Link
                  href="https://www.djangoproject.com"
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium underline underline-offset-4 hover:text-foreground transition-colors"
                >
                  Django
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}