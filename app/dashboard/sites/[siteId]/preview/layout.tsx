'use client'

import React from 'react'

interface PreviewLayoutProps {
  children: React.ReactNode
}

export default function PreviewLayout({ children }: PreviewLayoutProps) {
  return (
    <div className="fixed inset-0 z-50 bg-white overflow-auto">
      {/* Preview a schermo intero senza sidebar */}
      {children}
    </div>
  )
}
