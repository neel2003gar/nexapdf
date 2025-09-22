'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nexapdf-backend.onrender.com/api'

export default function DiagnosticPage() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const addResult = (test: string, status: 'success' | 'error' | 'info', message: string, data?: any) => {
    setResults(prev => [...prev, { test, status, message, data, timestamp: new Date().toISOString() }])
  }

  const runDiagnostics = async () => {
    setResults([])
    setLoading(true)
    
    addResult('Config', 'info', `API_URL: ${API_URL}`)
    addResult('Config', 'info', `Current URL: ${window.location.href}`)
    addResult('Config', 'info', `Origin: ${window.location.origin}`)

    // Test 1: Basic fetch to health endpoint
    try {
      addResult('Health Check', 'info', 'Testing basic health endpoint...')
      const response = await fetch(`${API_URL}/pdf/health/`)
      if (response.ok) {
        const data = await response.json()
        addResult('Health Check', 'success', 'Health endpoint accessible', data)
      } else {
        addResult('Health Check', 'error', `Health endpoint failed: ${response.status} ${response.statusText}`)
      }
    } catch (error: any) {
      addResult('Health Check', 'error', `Health endpoint error: ${error.message}`)
    }

    // Test 2: Health endpoint with CORS
    try {
      addResult('CORS Test', 'info', 'Testing CORS with credentials...')
      const response = await fetch(`${API_URL}/pdf/health/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      if (response.ok) {
        const data = await response.json()
        addResult('CORS Test', 'success', 'CORS working correctly', {
          headers: Object.fromEntries(response.headers.entries()),
          data
        })
      } else {
        addResult('CORS Test', 'error', `CORS test failed: ${response.status}`)
      }
    } catch (error: any) {
      addResult('CORS Test', 'error', `CORS error: ${error.message}`)
    }

    // Test 3: POST request test
    try {
      addResult('POST Test', 'info', 'Testing POST request...')
      const formData = new FormData()
      const response = await fetch(`${API_URL}/pdf/merge/`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      })
      // Expect 400 since no files, but should not be network error
      addResult('POST Test', response.status === 400 ? 'success' : 'error', 
        `POST test result: ${response.status} ${response.statusText}`)
    } catch (error: any) {
      addResult('POST Test', 'error', `POST error: ${error.message}`)
    }

    // Test 4: Axios test (same as merge page uses)
    try {
      addResult('Axios Test', 'info', 'Testing with axios...')
      const axios = (await import('axios')).default
      const response = await axios.get(`${API_URL}/pdf/health/`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        }
      })
      addResult('Axios Test', 'success', 'Axios working correctly', response.data)
    } catch (error: any) {
      addResult('Axios Test', 'error', `Axios error: ${error.message}`, {
        response: error.response?.data,
        status: error.response?.status
      })
    }

    setLoading(false)
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Frontend-Backend Connection Diagnostics</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={runDiagnostics} disabled={loading} className="mb-4">
            {loading ? 'Running Diagnostics...' : 'Run Diagnostics'}
          </Button>
          
          <div className="space-y-2">
            {results.map((result, index) => (
              <div key={index} className={`p-3 rounded border-l-4 ${
                result.status === 'success' ? 'bg-green-50 border-green-500' :
                result.status === 'error' ? 'bg-red-50 border-red-500' :
                'bg-blue-50 border-blue-500'
              }`}>
                <div className="font-semibold">[{result.test}] {result.message}</div>
                {result.data && (
                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                )}
                <div className="text-xs text-gray-500 mt-1">{result.timestamp}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}