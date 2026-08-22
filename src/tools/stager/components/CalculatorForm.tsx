import type { CalculatorValues, Field, FieldValue } from '../types'
import { FieldControl } from './FieldControl'

interface CalculatorFormProps {
  fields: Field[]
  values: CalculatorValues
  onChange: (id: string, value: FieldValue) => void
}

export function CalculatorForm({ fields, values, onChange }: CalculatorFormProps) {
  return (
    <div className="rounded-lg border border-line bg-elevated shadow-card">
      <div className="space-y-6 px-5 py-5">
        {fields.map((field) => (
          <FieldControl
            key={field.id}
            field={field}
            value={values[field.id] ?? null}
            onChange={(value) => onChange(field.id, value)}
          />
        ))}
      </div>
    </div>
  )
}
