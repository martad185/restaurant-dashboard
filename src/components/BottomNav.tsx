'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PieChart, BarChart2, Clock, Star, List } from 'lucide-react'

export default function BottomNav({ slug }: { slug: string }) {
  const pathname = usePathname()

  // Helper to check if a link is active
  const isActive = (path: string) => pathname.includes(path)

  const navItems = [
    { label: 'Graphs', icon: <PieChart size={20} />, href: `/dashboard/basic/${slug}/graphs` },
    { label: 'Sales', icon: <BarChart2 size={20} />, href: `/dashboard/basic/${slug}/sales` },
    { label: 'Hour Sales', icon: <Clock size={20} />, href: `/dashboard/basic/${slug}/hours` },
    { label: 'Top 20 Sales', icon: <Star size={20} />, href: `/dashboard/basic/${slug}/top20` },
    { label: 'Category Sales', icon: <List size={20} />, href: `/dashboard/basic/${slug}/categories` },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#F8F9FA] border-t border-gray-300 flex justify-around py-2 shadow-lg z-50">
      {navItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={`flex flex-col items-center gap-1 min-w-[64px] transition-colors ${
            isActive(item.href) ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {item.icon}
          <span className="text-[10px] font-medium text-center leading-none">
            {item.label}
          </span>
        </Link>
      ))}
    </nav>
  )
}