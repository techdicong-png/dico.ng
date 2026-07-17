// src/app/(auth)/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F7F4EE] flex items-center justify-center p-6">
      {children}
    </div>
  )
}
