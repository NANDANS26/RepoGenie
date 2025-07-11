
interface ToggleProps {
  enabled: boolean
  setEnabled: (enabled: boolean) => void
  label?: string
  className?: string
}

const Toggle = ({ enabled, setEnabled, label, className = '' }: ToggleProps) => {
  return (
    <div className={`flex items-center ${className}`}>
      {label && <span className="mr-2 text-sm text-dark-300">{label}</span>}
      <button
        type="button"
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
          enabled ? 'bg-primary-600' : 'bg-dark-700'
        }`}
        onClick={() => setEnabled(!enabled)}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}

export default Toggle