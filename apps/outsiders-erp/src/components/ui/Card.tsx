import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  title?: string
  className?: string
  padding?: boolean
}

export default function Card({ 
  children, 
  title, 
  className = '',
  padding = true 
}: CardProps) {
  return (
    <div className={`card ${!padding && 'p-0'} ${className}`}>
      {title && (
        <div className="border-b border-gray-200 pb-4 mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      {children}
    </div>
  )
}
