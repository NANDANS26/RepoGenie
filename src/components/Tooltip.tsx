import { useState, type ReactNode } from 'react'

interface TooltipProps {
  content: string | ReactNode
  children: ReactNode
  position?: 'top' | 'right' | 'bottom' | 'left'
  delay?: number
  className?: string
}

const Tooltip = ({
  content,
  children,
  position = 'top',
  delay = 200,
  className = ''
}: TooltipProps) => {
  const [visible, setVisible] = useState(false)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

  const showTooltip = () => {
    const id = setTimeout(() => setVisible(true), delay)
    setTimeoutId(id)
  }

  const hideTooltip = () => {
    if (timeoutId) clearTimeout(timeoutId)
    setVisible(false)
  }

  const positionClasses = {
    top: 'bottom-full mb-2 left-1/2 transform -translate-x-1/2',
    right: 'left-full ml-2 top-1/2 transform -translate-y-1/2',
    bottom: 'top-full mt-2 left-1/2 transform -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 transform -translate-y-1/2'
  }

  return (
    <div className={`relative inline-block ${className}`} onMouseEnter={showTooltip} onMouseLeave={hideTooltip}>
      {children}
      {visible && (
        <div
          className={`absolute z-50 px-3 py-2 text-sm bg-dark-800 text-white rounded-lg shadow-lg ${positionClasses[position]}`}
        >
          <div className="relative">
            {content}
            <div
              className={`absolute w-2 h-2 bg-dark-800 transform rotate-45 ${
                position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' :
                position === 'right' ? 'left-[-4px] top-1/2 -translate-y-1/2' :
                position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' :
                'right-[-4px] top-1/2 -translate-y-1/2'
              }`}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default Tooltip