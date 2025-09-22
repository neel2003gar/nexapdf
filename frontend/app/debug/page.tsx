'use client'

import { useEffect, useState } from 'react'

export default function DebugPage() {
  const [apiUrl, setApiUrl] = useState('')
  const [backendStatus, setBackendStatus] = useState('')

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nexapdf-backend.onrender.com/api'
    setApiUrl(API_URL)
    
    // Test backend connection
    fetch(`${API_URL}/`)
      .then(response => response.json())
      .then(data => {
        setBackendStatus(`✅ Connected: ${data.message}`)
      })
      .catch(error => {
        setBackendStatus(`❌ Failed: ${error.message}`)
      })
  }, [])

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Information</h1>
      <div className="space-y-4">
        <div>
          <strong>API URL:</strong> {apiUrl}
        </div>
        <div>
          <strong>Backend Status:</strong> {backendStatus}
        </div>
        <div>
          <strong>Environment:</strong> {process.env.NODE_ENV}
        </div>
      </div>
    </div>
  )
}