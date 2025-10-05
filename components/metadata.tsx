"use client"

import { useEffect } from "react"

interface MetadataProps {
  title?: string
  description?: string
  keywords?: string
}

export function Metadata({ title, description, keywords }: MetadataProps) {
  useEffect(() => {
    // Update document title
    if (title) {
      document.title = title
    }

    // Update meta description
    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]')
      if (metaDescription) {
        metaDescription.setAttribute('content', description)
      } else {
        metaDescription = document.createElement('meta')
        metaDescription.setAttribute('name', 'description')
        metaDescription.setAttribute('content', description)
        document.head.appendChild(metaDescription)
      }
    }

    // Update meta keywords
    if (keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]')
      if (metaKeywords) {
        metaKeywords.setAttribute('content', keywords)
      } else {
        metaKeywords = document.createElement('meta')
        metaKeywords.setAttribute('name', 'keywords')
        metaKeywords.setAttribute('content', keywords)
        document.head.appendChild(metaKeywords)
      }
    }
  }, [title, description, keywords])

  return null
}
