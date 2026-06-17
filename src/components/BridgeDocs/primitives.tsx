import type { BridgeDirection } from "../../core/types"
import type { SelectOption } from "./componentTypes"
import { defaultOperationTheme } from "./labels"

export function SelectField({
  className = "",
  onChange,
  options,
  value,
}: {
  className?: string
  onChange: (value: string) => void
  options: SelectOption[]
  value: string
}) {
  return (
    <span className={`bd-select-field ${className}`}>
      <select
        className="bd-select-native"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </span>
  )
}

export function OperationMethod({ direction }: { direction: BridgeDirection }) {
  return (
    <span className={`bd-method bd-method-${direction}`}>
      {defaultOperationTheme[direction].badge}
    </span>
  )
}

export function ChevronIcon({
  isOpen,
  className = "bd-chevron",
}: {
  isOpen: boolean
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      className={`${className} ${
        isOpen ? "bd-chevron-open" : "bd-chevron-closed"
      }`}
    >
      <span />
    </span>
  )
}

export function SchemaChevronIcon({ isOpen }: { isOpen: boolean }) {
  return <ChevronIcon className="bd-schema-chevron" isOpen={isOpen} />
}
