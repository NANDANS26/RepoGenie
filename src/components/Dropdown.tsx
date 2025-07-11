import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

interface DropdownOption {
  value: string
  label: string
}

interface DropdownProps {
  options: DropdownOption[]
  value: string
  onChange: (value: string) => void
  icon?: React.ReactNode
  className?: string
}

const Dropdown = ({ options, value, onChange, icon, className = '' }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(option => option.value === value) || options[0]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        className="flex items-center justify-between w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-sm text-dark-300 hover:bg-dark-700 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          {selectedOption.label}
        </div>
        <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-dark-800 border border-dark-700 rounded-lg shadow-lg">
          <ul className="py-1 max-h-60 overflow-auto">
            {options.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  className={`w-full text-left px-3 py-2 text-sm flex items-center ${
                    value === option.value
                      ? 'bg-primary-900/30 text-primary-400'
                      : 'text-dark-300 hover:bg-dark-700'
                  }`}
                  onClick={() => {
                    onChange(option.value)
                    setIsOpen(false)
                  }}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default Dropdown