import { cn } from '@/lib/utils'

export function DashboardCard({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('bg-white border border-border rounded-xl shadow-sm p-6', className)} {...props}>
      {children}
    </div>
  )
}

export function DashboardCardHeader({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      {children}
    </div>
  )
}

export function DashboardCardTitle({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <h3 className={cn('text-sm font-bold text-ink', className)}>
      {children}
    </h3>
  )
}
