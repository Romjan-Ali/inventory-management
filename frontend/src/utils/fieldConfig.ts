// frontend/src/src/utils/fieldConfig.ts
import type { Inventory, FieldConfig, FieldType } from '@/types'

export function getFieldConfigs(inventory: Inventory): FieldConfig[] {
  const fields: FieldConfig[] = []

  // Helper to process each field type
  const processFieldType = (type: FieldType, count: number) => {
    for (let i = 1; i <= count; i++) {
      const name = inventory[`${type}${i}Name` as keyof Inventory]
      if (name) {
        fields.push({
          type,
          index: i,
          name: name as string,
          description: inventory[`${type}${i}Description` as keyof Inventory] as string || '',
          visibleInTable: inventory[`${type}${i}Visible` as keyof Inventory] as boolean,
          order: inventory[`${type}${i}Order` as keyof Inventory] as number,
        })
      }
    }
  }

  processFieldType('string', 3)
  processFieldType('text', 3)
  processFieldType('number', 3)
  processFieldType('boolean', 3)
  processFieldType('link', 3)

  return fields.sort((a, b) => a.order - b.order)
}

export function getVisibleFields(inventory: Inventory): FieldConfig[] {
  return getFieldConfigs(inventory).filter(field => field.visibleInTable)
}

export function getActiveFields(inventory: Inventory): FieldConfig[] {
  return getFieldConfigs(inventory)
}