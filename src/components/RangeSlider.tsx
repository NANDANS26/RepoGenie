import { useState, useEffect } from 'react'

interface RangeSliderProps {
  label: string
  icon?: React.ReactNode
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  steps?: Array<{ value: number; label: string }>
  className?: string
}

const RangeSlider = ({
  label,
  icon,
  value,
  onChange,
  min,
  max,
  steps,
  className = ''
}: RangeSliderProps) => {
  const [sliderValue, setSliderValue] = useState(value)
  const [isDragging, setIsDragging] = useState(false)

  // Sync internal state with external value changes
  useEffect(() => {
    if (!isDragging) {
      setSliderValue(value)
    }
  }, [value, isDragging])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value)
    setSliderValue(newValue)
    onChange(newValue)
  }

  const handleMouseDown = () => {
    setIsDragging(true)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    // Ensure final value is committed
    onChange(sliderValue)
  }


  const handleStepClick = (stepValue: number) => {
    setSliderValue(stepValue)
    onChange(stepValue)
  }

  // Calculate progress percentage for the fill
  const progress = ((sliderValue - min) / (max - min)) * 100

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-2">
        <label className="flex items-center text-sm font-medium text-dark-300">
          {icon && <span className="mr-2">{icon}</span>}
          {label}
        </label>
        <span className="text-xs font-medium bg-dark-800 px-2 py-1 rounded-full text-primary-400">
          {steps?.find(s => s.value === sliderValue)?.label || sliderValue}
        </span>
      </div>

      <div className="relative h-8">
        {/* Track */}
        <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-dark-700 rounded-full transform -translate-y-1/2" />
        
        {/* Fill */}
        <div 
          className="absolute top-1/2 left-0 h-1.5 bg-primary-500 rounded-full transform -translate-y-1/2"
          style={{ width: `${progress}%` }}
        />
        
        {/* Thumb */}
        <input
          type="range"
          min={min}
          max={max}
          value={sliderValue ?? min}
          onChange={handleChange}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
          className="absolute top-1/2 left-0 right-0 w-full h-full opacity-0 cursor-pointer transform -translate-y-1/2 z-10"
        />
        <div 
          className="absolute top-1/2 h-4 w-4 bg-primary-500 rounded-full shadow-lg transform -translate-y-1/2 -translate-x-1/2 border-2 border-white"
          style={{ left: `${progress}%` }}
        />
      </div>

      {steps && (
        <div className="flex justify-between mt-2">
          {steps.map((step) => (
            <button
              key={step.value}
              onClick={() => handleStepClick(step.value)}
              className={`text-xs ${sliderValue === step.value ? 'text-primary-400 font-medium' : 'text-dark-500 hover:text-dark-300'}`}
            >
              {step.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default RangeSlider