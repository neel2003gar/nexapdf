import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/components/auth-provider'
import { UsageProvider } from '@/components/usage-provider'
import { GuestModeProvider } from '@/components/guest-mode-provider'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'NexaPDF - Professional PDF Processing Suite',
  description: 'Complete PDF processing platform with 16+ tools - merge, split, compress, convert, organize, and more. Fast, secure, and professional.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16', type: 'image/x-icon' },
      { url: '/logo.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/logo.svg', sizes: '180x180', type: 'image/svg+xml' },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <GuestModeProvider>
            <AuthProvider>
              <UsageProvider>
                {children}
                <Toaster />
              </UsageProvider>
            </AuthProvider>
          </GuestModeProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}