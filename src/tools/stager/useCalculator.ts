import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Calculator, CalculatorResult, CalculatorValues, Field, FieldValue } from './types'

/** Valor inicial de um campo — espelha o que o formulario mostraria vazio. */
function initialValue(field: Field): FieldValue {
  if (field.type === 'select' || field.type === 'radio') {
    return field.default ?? field.options?.[0]?.value ?? null
  }
  if (field.type === 'number') return field.default ?? null
  return field.default ?? ''
}

function initialValues(calc: Calculator): CalculatorValues {
  const values: CalculatorValues = {}
  for (const field of calc.fields) values[field.id] = initialValue(field)
  return values
}

/**
 * Estado de uma calculadora: valores, campos visiveis e resultado derivado.
 *
 * Campos ocultos por `when` continuam no estado — igual ao motor de origem,
 * onde o input escondido seguia no DOM e seu valor ainda era lido. Esconder um
 * campo nunca muda silenciosamente o calculo.
 */
export function useCalculator(calc: Calculator) {
  const { t } = useTranslation()
  const [values, setValues] = useState<CalculatorValues>(() => initialValues(calc))

  useEffect(() => {
    setValues(initialValues(calc))
  }, [calc])

  const setValue = useCallback((id: string, value: FieldValue) => {
    setValues((current) => ({ ...current, [id]: value }))
  }, [])

  const reset = useCallback(() => setValues(initialValues(calc)), [calc])

  const visibleFields = useMemo(
    () => calc.fields.filter((field) => !field.when || field.when(values)),
    [calc, values],
  )

  const result = useMemo<CalculatorResult>(() => {
    try {
      return calc.compute(values) ?? {}
    } catch (error) {
      // Uma regra com defeito nao pode derrubar a pagina inteira.
      const message = error instanceof Error ? error.message : String(error)
      return { warnings: [t('stager.computeError', { message })], report: '' }
    }
  }, [calc, values, t])

  return { values, setValue, reset, visibleFields, result }
}
