'use client'

import React from 'react'

interface BuilderLayoutProps {
  children: React.ReactNode
}

export default function BuilderLayout({ children }: BuilderLayoutProps) {
  return (
    <div className="fixed inset-0 z-50 bg-white">
      {/* Builder a schermo intero senza sidebar */}
      {children}
    </div>
  )
}
