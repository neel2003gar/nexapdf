'use client'

import { useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { showToast } from '@/lib/toast'
import axios from 'axios'
import { 
  HelpCircle, 
  Mail, 
  MessageSquare, 
  FileText, 
  Bug, 
  Lightbulb,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  ChevronDown,
  ChevronRight,
  ExternalLink
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nexapdf-backend.onrender.com/api'

export default function SupportPage() {
  const [selectedCategory, setSelectedCategory] = useState('')
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    category: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const supportCategories = [
    { id: 'general', label: 'General Questions', icon: HelpCircle },
    { id: 'technical', label: 'Technical Issues', icon: Bug },
    { id: 'feature', label: 'Feature Requests', icon: Lightbulb },
    { id: 'billing', label: 'Billing & Account', icon: FileText }
  ]

  const faqs = [
    {
      category: 'general',
      question: 'Is NexaPDF free to use?',
      answer: 'Yes! NexaPDF offers a free tier with 10 operations per day. Each operation includes merging, splitting, compressing, converting, or processing PDFs. No account registration required.'
    },
    {
      category: 'general',
      question: 'Are my files secure and private?',
      answer: 'Absolutely. All uploaded files are automatically deleted within 30 minutes. We use HTTPS encryption, process files securely, and never store, analyze, or share your documents. See our Privacy Policy for full details.'
    },
    {
      category: 'general',
      question: 'What file formats are supported?',
      answer: 'We support PDF files for all operations, plus JPG, PNG, GIF for image-to-PDF conversion, and DOCX for document-to-PDF conversion. Maximum file size is 50MB per file.'
    },
    {
      category: 'technical',
      question: 'My PDF upload is failing. What should I do?',
      answer: 'Check that your file is under 50MB and is a valid PDF. Try refreshing the page or using a different browser. If the issue persists, the PDF might be corrupted or password-protected.'
    },
    {
      category: 'technical',
      question: 'The processing is taking too long. Is this normal?',
      answer: 'Most operations complete in 10-30 seconds. Large files or complex operations may take up to 5 minutes. If processing exceeds this time, please refresh and try again.'
    },
    {
      category: 'technical',
      question: 'Why is my compressed PDF still large?',
      answer: 'Compression effectiveness depends on the original PDF content. Text-heavy PDFs compress well, while image-heavy PDFs have limited compression. Try the "High" compression setting for maximum size reduction.'
    },
    {
      category: 'feature',
      question: 'Can you add batch processing for multiple operations?',
      answer: 'We\'re constantly improving NexaPDF. Batch processing is on our roadmap. Follow our updates or contact us with specific feature requests.'
    },
    {
      category: 'feature',
      question: 'Do you plan to add mobile apps?',
      answer: 'NexaPDF is fully responsive and works great on mobile browsers. Native mobile apps are being considered based on user demand.'
    },
    {
      category: 'billing',
      question: 'Will there be premium plans in the future?',
      answer: 'We\'re exploring premium features like higher daily limits, batch processing, and API access. The free tier will always remain available with core functionality.'
    }
  ]

  const filteredFaqs = selectedCategory 
    ? faqs.filter(faq => faq.category === selectedCategory)
    : faqs

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.subject.trim() || !contactForm.message.trim()) {
      showToast.error.custom('Please fill in all required fields')
      return
    }
    
    if (!contactForm.email.includes('@')) {
      showToast.error.custom('Please enter a valid email address')
      return
    }
    
    if (contactForm.message.trim().length < 10) {
      showToast.error.custom('Message must be at least 10 characters long')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const response = await axios.post(`${API_URL}/pdf/support/contact/`, {
        name: contactForm.name.trim(),
        email: contactForm.email.trim(),
        category: contactForm.category || 'general',
        subject: contactForm.subject.trim(),
        message: contactForm.message.trim()
      })
      
      if (response.status === 201) {
        setSubmitSuccess(true)
        setContactForm({
          name: '',
          email: '',
          category: '',
          subject: '',
          message: ''
        })
        showToast.success.custom('Message sent successfully! We will respond within 48 hours.')
      }
    } catch (error: any) {
      console.error('Contact form error:', error)
      
      if (error.response?.data?.details) {
        // Show specific validation errors
        const errors = error.response.data.details
        const errorMessages = Object.values(errors).flat()
        showToast.error.custom(`Please check: ${errorMessages.join(', ')}`)
      } else if (error.response?.data?.error) {
        showToast.error.custom(error.response.data.error)
      } else {
        showToast.error.custom('Failed to send message. Please try again or email us directly.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <HelpCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h1 className="text-4xl font-bold mb-4">Support Center</h1>
            <p className="text-muted-foreground text-lg">
              Get help with PDF Merger and find answers to common questions
            </p>
          </div>

          {/* Quick Help Section */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-red-50 dark:bg-red-950/30 p-6 rounded-lg text-center">
              <Clock className="mx-auto h-12 w-12 text-red-500 mb-3" />
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                24-48 Hour Response
              </h3>
              <p className="text-red-700 dark:text-red-300 text-sm">
                We respond to all support requests within 24-48 hours
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-950/30 p-6 rounded-lg text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-3" />
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                Free Support
              </h3>
              <p className="text-green-700 dark:text-green-300 text-sm">
                All support is provided free of charge for all users
              </p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-950/30 p-6 rounded-lg text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-purple-500 mb-3" />
              <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-2">
                Multiple Channels
              </h3>
              <p className="text-purple-700 dark:text-purple-300 text-sm">
                Email support, FAQ, and comprehensive documentation
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* FAQ Section */}
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Search className="h-6 w-6" />
                Frequently Asked Questions
              </h2>

              {/* Category Filter */}
              <div className="mb-6">
                <Label className="text-sm font-medium mb-3 block">Filter by Category:</Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === '' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('')}
                  >
                    All Questions
                  </Button>
                  {supportCategories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                      className="flex items-center gap-1"
                    >
                      <category.icon className="h-3 w-3" />
                      {category.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* FAQ List */}
              <div className="space-y-4">
                {filteredFaqs.map((faq, index) => (
                  <div key={index} className="border rounded-lg overflow-hidden">
                    <button
                      className="w-full p-4 text-left bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-800/50 flex items-center justify-between"
                      onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    >
                      <span className="font-medium">{faq.question}</span>
                      {expandedFaq === index ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    {expandedFaq === index && (
                      <div className="p-4 border-t bg-white dark:bg-gray-950">
                        <p className="text-muted-foreground">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {filteredFaqs.length === 0 && (
                <div className="text-center py-8">
                  <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-muted-foreground">No FAQs found for this category.</p>
                </div>
              )}
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Mail className="h-6 w-6" />
                Contact Support
              </h2>

              <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-amber-800 dark:text-amber-200 font-medium text-sm">
                      Before contacting support:
                    </p>
                    <ul className="text-amber-700 dark:text-amber-300 text-sm mt-1 space-y-1">
                      <li>• Check the FAQ above for quick answers</li>
                      <li>• Try refreshing the page or using a different browser</li>
                      <li>• Ensure your PDF file is under 50MB and not corrupted</li>
                    </ul>
                  </div>
                </div>
              </div>

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <select
                    id="category"
                    className="w-full p-2 border rounded-md bg-background"
                    value={contactForm.category}
                    onChange={(e) => setContactForm({...contactForm, category: e.target.value})}
                    required
                  >
                    <option value="">Select a category...</option>
                    {supportCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                    placeholder="Brief description of your issue"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    rows={6}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    placeholder="Please provide as much detail as possible about your issue, including any error messages, browser version, and steps to reproduce the problem."
                    required
                  />
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                  <Mail className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>

                {submitSuccess && (
                  <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Message sent successfully!</span>
                    </div>
                    <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                      We typically respond within 48 hours. Thank you for contacting NexaPDF!
                    </p>
                  </div>
                )}
              </form>

              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <h3 className="font-medium mb-3">Other Ways to Get Help:</h3>
                <div className="space-y-2 text-sm">
                  <a 
                    href="/privacy" 
                    className="flex items-center gap-2 text-red-600 hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Privacy Policy
                  </a>
                  <a 
                    href="/terms" 
                    className="flex items-center gap-2 text-red-600 hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Terms of Service
                  </a>
                  <p className="text-muted-foreground">
                    Direct email: <span className="font-mono">neel2003gar@gmail.com</span>
                  </p>
                  <p className="text-muted-foreground">
                    Response time: Within 48 hours (Mon-Fri, 10 AM - 6 PM EST)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="mt-16 border-t pt-12">
            <h2 className="text-2xl font-bold mb-8 text-center">PDF Merger Features</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="bg-red-100 dark:bg-red-900/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileText className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="font-semibold mb-2">Merge & Split</h3>
                <p className="text-sm text-muted-foreground">
                  Combine multiple PDFs or split large PDFs into separate pages
                </p>
              </div>

              <div className="text-center p-4">
                <div className="bg-green-100 dark:bg-green-900/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Compress & Convert</h3>
                <p className="text-sm text-muted-foreground">
                  Reduce file size and convert between PDF, images, and DOCX
                </p>
              </div>

              <div className="text-center p-4">
                <div className="bg-purple-100 dark:bg-purple-900/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Secure & Extract</h3>
                <p className="text-sm text-muted-foreground">
                  Add passwords, extract text, and add watermarks to your PDFs
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