import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050F09] flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <p className="font-serif text-8xl font-black text-[#C8960A]/15 leading-none mb-4">404</p>
        <h1 className="font-serif text-2xl font-black text-white mb-3">Page not found</h1>
        <p className="text-sm text-white/45 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or you may not have access.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="bg-[#C8960A] text-[#050F09] font-bold px-6 py-3 rounded-md text-sm hover:bg-[#dba50c] transition-colors">
            Back to Home
          </Link>
          <Link href="/dashboard" className="border border-white/20 text-white/65 px-6 py-3 rounded-md text-sm hover:border-white/50 hover:text-white transition-colors">
            My Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
