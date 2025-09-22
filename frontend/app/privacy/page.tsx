'use client'

import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Shield, Lock, Eye, Server, Trash2, FileText, Globe, Mail } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Shield className="mx-auto h-16 w-16 text-red-600 mb-4" />
            <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground text-lg">
              Your privacy and data security are our top priorities
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Last updated: September 21, 2025
            </p>
          </div>

          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <div className="bg-red-50 dark:bg-red-950/30 p-6 rounded-lg mb-8">
              <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-3 flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Our Privacy Commitment
              </h2>
              <p className="text-red-700 dark:text-red-300">
                NexaPDF is designed with privacy by design. We process your files securely in Canada, 
                use temporary storage, and automatically delete all uploaded content within 30 minutes. 
                We do not store, analyze, or share your documents.
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <FileText className="h-6 w-6" />
                Information We Collect
              </h2>
              
              <h3 className="text-xl font-semibold mb-3">Files You Upload</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>PDF Documents:</strong> Temporarily stored for processing only</li>
                <li><strong>Images:</strong> For PDF conversion and watermarking features</li>
                <li><strong>Processing Parameters:</strong> Settings like compression level, rotation angles, etc.</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">Technical Information</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Usage Analytics:</strong> Anonymous operation counts and performance metrics</li>
                <li><strong>Error Logs:</strong> Technical errors for debugging (no file content)</li>
                <li><strong>Browser Information:</strong> For compatibility and optimization</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">What We DON'T Collect</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Personal information or account data</li>
                <li>File content or metadata beyond processing requirements</li>
                <li>Tracking across other websites</li>
                <li>Location data</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Server className="h-6 w-6" />
                How We Use Your Information
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                    File Processing
                  </h3>
                  <ul className="text-green-700 dark:text-green-300 text-sm space-y-1">
                    <li>• PDF manipulation and conversion</li>
                    <li>• Temporary storage during processing</li>
                    <li>• Quality optimization</li>
                    <li>• Format conversion</li>
                  </ul>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-2">
                    Service Improvement
                  </h3>
                  <ul className="text-purple-700 dark:text-purple-300 text-sm space-y-1">
                    <li>• Anonymous usage statistics</li>
                    <li>• Performance optimization</li>
                    <li>• Error monitoring</li>
                    <li>• Feature development</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Trash2 className="h-6 w-6" />
                Data Retention & Deletion
              </h2>
              
              <div className="bg-red-50 dark:bg-red-950/30 p-6 rounded-lg mb-4">
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-3">
                  Automatic File Deletion
                </h3>
                <ul className="text-red-700 dark:text-red-300 space-y-2">
                  <li><strong>Immediate:</strong> Files are deleted from memory after processing</li>
                  <li><strong>30 Minutes:</strong> All temporary files are automatically purged</li>
                  <li><strong>No Permanent Storage:</strong> We do not keep copies of your documents</li>
                  <li><strong>Secure Deletion:</strong> Files are overwritten to prevent recovery</li>
                </ul>
              </div>

              <div className="bg-red-50 dark:bg-red-950/30 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-3">
                  Support Data Retention
                </h3>
                <ul className="text-red-700 dark:text-red-300 space-y-2">
                  <li><strong>Contact Form Data:</strong> Stored for up to 6 months for support purposes</li>
                  <li><strong>Support Tickets:</strong> Retained for 6 months, then automatically deleted</li>
                  <li><strong>Email Communications:</strong> Standard email retention applies</li>
                  <li><strong>Analytics Data:</strong> Basic usage analytics may be collected (anonymized)</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Lock className="h-6 w-6" />
                Security Measures
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Data Protection</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>HTTPS encryption for all data transfer</li>
                    <li>Secure server infrastructure</li>
                    <li>Regular security audits</li>
                    <li>Access controls and monitoring</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">File Security</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Isolated processing environments</li>
                    <li>Temporary file encryption</li>
                    <li>Malware scanning</li>
                    <li>Secure file deletion</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Globe className="h-6 w-6" />
                Third-Party Services
              </h2>
              
              <p className="mb-4">
                We use minimal third-party services to provide our functionality:
              </p>
              
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Cloud Hosting:</strong> Secure servers for application hosting</li>
                <li><strong>CDN Services:</strong> For faster content delivery</li>
                <li><strong>Analytics:</strong> Anonymous usage statistics (no personal data)</li>
              </ul>
              
              <p className="mt-4 text-sm text-muted-foreground">
                We do not share your files or personal information with any third parties.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Eye className="h-6 w-6" />
                Your Rights
              </h2>
              
              <div className="bg-amber-50 dark:bg-amber-950/30 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-3">
                  You Have the Right To:
                </h3>
                <ul className="text-amber-700 dark:text-amber-300 space-y-2">
                  <li>• <strong>Access:</strong> Request information about data processing</li>
                  <li>• <strong>Deletion:</strong> Files are automatically deleted within 30 minutes</li>
                  <li>• <strong>Portability:</strong> Download your processed files immediately</li>
                  <li>• <strong>Transparency:</strong> Understand how your data is processed</li>
                  <li>• <strong>Control:</strong> Stop using the service at any time</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Cookies & Tracking</h2>
              
              <p className="mb-4">
                We use minimal cookies and tracking:
              </p>
              
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Essential Cookies:</strong> Required for basic functionality</li>
                <li><strong>Preferences:</strong> Remember your theme and language settings</li>
                <li><strong>No Tracking:</strong> We do not track you across other websites</li>
                <li><strong>No Advertising:</strong> We do not use advertising cookies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Updates to This Policy</h2>
              
              <p className="mb-4">
                We may update this privacy policy to reflect changes in our practices or legal requirements. 
                When we make significant changes, we will:
              </p>
              
              <ul className="list-disc pl-6 space-y-2">
                <li>Update the "Last updated" date at the top of this page</li>
                <li>Notify users through the application interface</li>
                <li>Maintain transparency about any changes</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Mail className="h-6 w-6" />
                Contact Us
              </h2>
              
              <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg">
                <p className="mb-4">
                  If you have questions about this privacy policy or our data practices, please contact us:
                </p>
                
                <ul className="space-y-2">
                  <li><strong>Email:</strong> neel2003gar@gmail.com</li>
                  <li><strong>Phone:</strong> +1 519-791-1902</li>
                  <li><strong>Developer:</strong> Neel Pachchigar</li>
                  <li><strong>Location:</strong> Brantford, Ontario, Canada</li>
                  <li><strong>Support:</strong> Visit our <a href="/support" className="text-red-600 hover:underline">Support page</a></li>
                  <li><strong>Response Time:</strong> We respond to privacy inquiries within 48 hours</li>
                </ul>
              </div>
            </section>

            <div className="border-t pt-6 mt-8 text-center text-sm text-muted-foreground">
              <p>
                This privacy policy is effective as of September 21, 2025 and applies to all users of NexaPDF.
              </p>
              <p className="mt-2">
                NexaPDF is operated by Neel Pachchigar, Brantford, Ontario, Canada.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}