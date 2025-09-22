import Link from 'next/link'
import { LucideIcon } from 'lucide-react'

interface FeatureCardProps {
  title: string
  description: string
  icon: LucideIcon
  href: string
  color: string
}

export function FeatureCard({ title, description, icon: Icon, href, color }: FeatureCardProps) {
  return (
    <Link
      href={href}
      className="group block rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 transition-all duration-300 hover:shadow-xl hover:shadow-red-500/10 hover:scale-105 hover:border-red-300 dark:hover:border-red-600 hover:-translate-y-1 active:scale-95"
    >
      <div className="flex items-start space-x-4 mb-4">
        <div className={`p-3 rounded-xl ${color} shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
          <Icon className="h-7 w-7 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">{description}</p>
        </div>
      </div>
      <div className="h-1 w-0 bg-gradient-to-r from-red-500 to-red-600 group-hover:w-full transition-all duration-500 rounded-full"></div>
    </Link>
  )
}