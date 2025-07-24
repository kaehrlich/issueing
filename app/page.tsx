'use client'

import { useState } from 'react'

export default function Home() {
  const [certs, setCerts] = useState<{ cert1: string; cert2: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [downloaded, setDownloaded] = useState<{ cert1: boolean; cert2: boolean }>({
    cert1: false,
    cert2: false,
  })

  const fetchCerts = async () => {
    if (!certs) {
      setIsLoading(true)
      const res = await fetch('/api/issue')
      const data = await res.json()
      setCerts(data)
      setIsLoading(false)
      return data
    }
    return certs
  }

  const downloadCert = async (which: 'cert1' | 'cert2') => {
    const data = await fetchCerts()
    const blob = new Blob([data[which]], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${which}.mutual.json`
    a.click()
    URL.revokeObjectURL(url)
    setDownloaded((prev) => ({ ...prev, [which]: true }))
  }

  return (
      <div className="font-sans min-h-screen bg-white dark:bg-black flex items-center justify-center p-8">
        <div className="flex flex-col gap-8 w-full max-w-sm text-sm">
          {/* Request Certificates */}
          <div className="flex flex-col gap-2">
            <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              This service issues a pair of mutual trust certificates based on asymmetric RSA encryption.
              Each generated file contains a private key (used for decryption) and the peer’s public key (used for encryption).
              This allows two independent services or serverless functions to communicate securely over untrusted channels.
            </div>
            <div className="flex flex-col items-start pt-1 gap-2">
              <button
                  disabled={isLoading}
                  onClick={() => fetchCerts()}
                  className={`h-12 w-full rounded-xl font-medium text-sm sm:text-base
                ${isLoading
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-black text-white dark:bg-white dark:text-black hover:opacity-90 active:scale-[0.98] cursor-pointer'}
                transition-colors`}
              >
                {isLoading ? 'Generating…' : 'Request Certificates'}
              </button>
              <div className="flex flex-row items-center gap-4 pt-3">
                <a
                    href="/advanced"
                    className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline underline-offset-4"
                >
                  Advanced options
                </a>
                <a
                    href="https://github.com/kaehrlich/issueing/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline underline-offset-4"
                >
                  GitHub
                </a>
              </div>
            </div>
          </div>

          {/* Download Group */}
          <div className="flex flex-col gap-3">
            <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Once created, download both certificates and deploy them to the respective services.
              Certificate 1 is for Service A, Certificate 2 for Service B.
              Each file is unique and must be stored securely — never share private keys.
            </div>
            <div className="flex flex-col gap-2">
              <button
                  disabled={!certs}
                  onClick={() => downloadCert('cert1')}
                  className={`h-12 w-full rounded-xl font-medium flex items-center justify-between px-4
                ${certs
                      ? `bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer
                     ${downloaded.cert1 ? 'text-green-600 dark:text-green-400 border-green-500' : 'text-black dark:text-white'}`
                      : 'border border-gray-300 dark:border-neutral-800 text-gray-500 bg-gray-100 dark:bg-neutral-900 dark:text-gray-600 cursor-not-allowed'}
              `}
              >
                Download Certificate 1
              </button>

              <button
                  disabled={!certs}
                  onClick={() => downloadCert('cert2')}
                  className={`h-12 w-full rounded-xl font-medium flex items-center justify-between px-4
                ${certs
                      ? `bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer
                     ${downloaded.cert2 ? 'text-green-600 dark:text-green-400 border-green-500' : 'text-black dark:text-white'}`
                      : 'border border-gray-300 dark:border-neutral-800 text-gray-500 bg-gray-100 dark:bg-neutral-900 dark:text-gray-600 cursor-not-allowed'}
              `}
              >
                Download Certificate 2
              </button>
            </div>
          </div>
        </div>
      </div>
  )
}
