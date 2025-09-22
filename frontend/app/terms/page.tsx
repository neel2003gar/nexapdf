'use client'

import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Scale, FileText, Shield, AlertTriangle, Users, Gavel, Globe, Mail } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Scale className="mx-auto h-16 w-16 text-purple-500 mb-4" />
            <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
            <p className="text-muted-foreground text-lg">
              Please read these terms carefully before using PDF Merger
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Last updated: September 21, 2025
            </p>
          </div>

          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <div className="bg-purple-50 dark:bg-purple-950/30 p-6 rounded-lg mb-8">
              <h2 className="text-xl font-semibold text-purple-800 dark:text-purple-200 mb-3">
                Agreement to Terms
              </h2>
              <p className="text-purple-700 dark:text-purple-300">
                By accessing and using NexaPDF, you accept and agree to be bound by the terms 
                and provision of this agreement. If you do not agree to these terms, please do not use our service.
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <FileText className="h-6 w-6" />
                Service Description
              </h2>
              
              <p className="mb-4">
                NexaPDF is a web-based service operated by Neel Pachchigar that provides the following PDF processing capabilities:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-lg">
                  <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">Core Features</h3>
                  <ul className="text-red-700 dark:text-red-300 text-sm space-y-1">
                    <li>• Merge multiple PDF files</li>
                    <li>• Split PDF into separate pages</li>
                    <li>• Compress PDF file size</li>
                    <li>• Convert PDF to images</li>
                    <li>• Convert images to PDF</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">Advanced Features</h3>
                  <ul className="text-green-700 dark:text-green-300 text-sm space-y-1">
                    <li>• Extract text from PDFs</li>
                    <li>• Add text and image watermarks</li>
                    <li>• Rotate PDF pages</li>
                    <li>• Password protect PDFs</li>
                    <li>• Remove PDF passwords</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Users className="h-6 w-6" />
                User Obligations
              </h2>
              
              <h3 className="text-xl font-semibold mb-3">Acceptable Use</h3>
              <p className="mb-4">You agree to use PDF Merger only for lawful purposes. You must not:</p>
              
              <div className="bg-red-50 dark:bg-red-950/30 p-6 rounded-lg mb-4">
                <h4 className="font-semibold text-red-800 dark:text-red-200 mb-3">Prohibited Activities</h4>
                <ul className="text-red-700 dark:text-red-300 space-y-2">
                  <li>• Upload or process illegal, harmful, or offensive content</li>
                  <li>• Violate any applicable laws or regulations</li>
                  <li>• Infringe on intellectual property rights</li>
                  <li>• Upload malware, viruses, or malicious code</li>
                  <li>• Attempt to reverse engineer or hack the service</li>
                  <li>• Use the service for commercial purposes without authorization</li>
                  <li>• Overload or abuse the service infrastructure</li>
                </ul>
              </div>

              <h3 className="text-xl font-semibold mb-3">Content Responsibility</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>You are solely responsible for the content you upload and process</li>
                <li>You must have the legal right to process all uploaded files</li>
                <li>You must respect copyright and intellectual property laws</li>
                <li>You must not upload confidential information without proper authorization</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Shield className="h-6 w-6" />
                Privacy & Data Handling
              </h2>
              
              <div className="bg-red-50 dark:bg-red-950/30 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-3">
                  Our Commitments  
                </h3>
                <ul className="text-red-700 dark:text-red-300 space-y-2">
                  <li>• All uploaded files are automatically deleted within 30 minutes</li>
                  <li>• We do not store, analyze, or share your documents</li>
                  <li>• Processing is done securely with encryption</li>
                  <li>• No user accounts or personal information required</li>
                  <li>• Full privacy policy available at <a href="/privacy" className="underline">PDF Merger Privacy Policy</a></li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Service Availability</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Usage Limits</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Free users: 10 operations per day</li>
                    <li>Maximum file size: 50MB per file</li>
                    <li>Maximum files per operation: 20 files</li>
                    <li>Processing timeout: 5 minutes per operation</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Service Levels</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Best effort uptime and availability</li>
                    <li>Scheduled maintenance notifications</li>
                    <li>Emergency maintenance as needed</li>
                    <li>No guaranteed SLA for free service</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <AlertTriangle className="h-6 w-6" />
                Disclaimers & Limitations
              </h2>
              
              <div className="bg-amber-50 dark:bg-amber-950/30 p-6 rounded-lg mb-4">
                <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-3">
                  Service "As Is"
                </h3>
                <p className="text-amber-700 dark:text-amber-300 mb-3">
                  PDF Merger is provided "as is" without any warranties, express or implied. We do not guarantee:
                </p>
                <ul className="text-amber-700 dark:text-amber-300 space-y-1">
                  <li>• Continuous, uninterrupted, or error-free operation</li>
                  <li>• Accuracy or completeness of processing results</li>
                  <li>• Compatibility with all PDF formats or versions</li>
                  <li>• Preservation of all document metadata or features</li>
                </ul>
              </div>

              <h3 className="text-xl font-semibold mb-3">Limitation of Liability</h3>
              <p className="mb-4">
                To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, 
                special, consequential, or punitive damages, including but not limited to:
              </p>
              
              <ul className="list-disc pl-6 space-y-2">
                <li>Loss of data or documents</li>
                <li>Business interruption or lost profits</li>
                <li>Damage to reputation or goodwill</li>
                <li>Third-party claims or demands</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Intellectual Property</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Our Rights</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>PDF Merger service and technology</li>
                    <li>Website design and content</li>
                    <li>Trademarks and branding</li>
                    <li>Software and algorithms</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Your Rights</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>You retain all rights to your uploaded content</li>
                    <li>We claim no ownership of your files</li>
                    <li>You grant us temporary processing rights only</li>
                    <li>Rights terminate when files are deleted</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Termination</h2>
              
              <p className="mb-4">
                We reserve the right to terminate or restrict access to our service at any time for:
              </p>
              
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Violation of these terms of service</li>
                <li>Illegal or harmful use of the service</li>
                <li>Abuse of service resources or limits</li>
                <li>Technical or security reasons</li>
              </ul>
              
              <p>
                You may stop using the service at any time. Upon termination, all uploaded files 
                are immediately deleted from our systems.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Gavel className="h-6 w-6" />
                Governing Law
              </h2>
              
              <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg">
                <p className="mb-4">
                  These terms shall be governed by and construed in accordance with applicable law. 
                  Any disputes arising from these terms or use of the service shall be resolved through:
                </p>
                
                <ul className="space-y-2">
                  <li>• <strong>First:</strong> Good faith negotiation</li>
                  <li>• <strong>Then:</strong> Mediation or arbitration</li>
                  <li>• <strong>Finally:</strong> Appropriate legal jurisdiction</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Changes to Terms</h2>
              
              <p className="mb-4">
                We may update these terms of service from time to time. When we make changes:
              </p>
              
              <ul className="list-disc pl-6 space-y-2">
                <li>The "Last updated" date will be revised</li>
                <li>Significant changes will be announced on the service</li>
                <li>Continued use constitutes acceptance of new terms</li>
                <li>You should review terms periodically</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Mail className="h-6 w-6" />
                Contact Information
              </h2>
              
              <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg">
                <p className="mb-4">
                  Questions about these terms of service? Contact us:
                </p>
                
                <ul className="space-y-2">
                  <li><strong>Service Operator:</strong> Neel Pachchigar</li>
                  <li><strong>Email:</strong> neel2003gar@gmail.com</li>
                  <li><strong>Phone:</strong> +1 519-791-1902</li>
                  <li><strong>Location:</strong> Brantford, Ontario, Canada</li>
                  <li><strong>Jurisdiction:</strong> Ontario, Canada</li>
                  <li><strong>Support:</strong> Visit our <a href="/support" className="text-purple-600 hover:underline">Support page</a></li>
                  <li><strong>Response Time:</strong> We respond to legal inquiries within 48 hours</li>
                </ul>
              </div>
            </section>

            <div className="border-t pt-6 mt-8">
              <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg text-center">
                <p className="text-green-800 dark:text-green-200 font-medium mb-2">
                  Thank you for using NexaPDF responsibly!
                </p>
                <p className="text-green-700 dark:text-green-300 text-sm">
                  These terms are effective as of September 21, 2025 and apply to all users of NexaPDF.
                </p>
                <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                  NexaPDF is operated by Neel Pachchigar under Ontario, Canada jurisdiction.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}