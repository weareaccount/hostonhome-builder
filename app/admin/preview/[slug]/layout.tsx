interface AdminPreviewLayoutProps {
  children: React.ReactNode;
}

export default function AdminPreviewLayout({ children }: AdminPreviewLayoutProps) {
  return (
    <div className="fixed inset-0 z-50 bg-white overflow-auto">
      {/* Preview a schermo intero per admin */}
      {children}
    </div>
  )
}
