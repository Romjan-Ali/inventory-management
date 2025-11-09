// frontend/src/types/stats.ts
export interface Stats {
  overview: Overview
  fieldCompletion: FieldCompletion[]
  numericFields: NumericField[]
  stringFields: StringField[]
  booleanFields: BooleanField[]
  textFields: TextField[]
}

export interface Overview {
  totalItems: number
  recentItems: number
  activeFields: number
  overallCompletionRate: number
  calculatedAt: string
}

export interface FieldCompletion {
  fieldName: string
  fieldType: string
  completed: number
  total: number
  completionRate: number
}

export interface NumericField {
  fieldName: string
  count: number
  average: number
  min: number
  max: number
  sum: number
}

export interface StringField {
  fieldName: string
  uniqueValues: number
  totalValues: number
  mostFrequent: MostFrequent[]
}

export interface MostFrequent {
  value: string
  count: number
  percentage: number
}

export interface BooleanField {
  fieldName: string
  total: number
  trueCount: number
  falseCount: number
  truePercentage: number
  falsePercentage: number
}

export interface TextField {
  fieldName: string
  totalEntries: number
  averageLength: number
  maxLength: number
  minLength: number
}
