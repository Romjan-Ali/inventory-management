// backend/src/services/CustomIdService.ts
import { prisma } from '../lib/prisma'
import type { IdFormatElement } from '../types'

export class CustomIdService {
  // Generate a custom ID based on the format with retry limit
  async generateCustomId(
    inventoryId: string,
    format: IdFormatElement[],
    retryCount: number = 0
  ): Promise<{ customId: string; sequenceNumber?: number }> {
    const MAX_RETRIES = 5

    // Validate format to ensure we can generate unique IDs
    if (retryCount === 0 && !this.hasRandomOrSequenceElements(format)) {
      throw new Error(
        'Custom ID format must contain at least one random or sequence element to ensure uniqueness'
      )
    }

    const parts: string[] = []
    let sequenceNumber: number | undefined = undefined

    for (const element of format) {
      let part = ''

      switch (element.type) {
        case 'FIXED_TEXT':
          part = element.value || ''
          break

        case 'RANDOM_20BIT':
          part = this.generateRandomNumber(1048575).toString()
          break

        case 'RANDOM_32BIT':
          part = this.generateRandomNumber(4294967295).toString()
          break

        case 'RANDOM_6DIGIT':
          part = this.generateRandomNumber(999999, 6, 0)
          break

        case 'RANDOM_9DIGIT':
          part = this.generateRandomNumber(999999999, 9, 0)
          break

        case 'GUID':
          part = this.generateStandardGuid()
          break

        case 'DATETIME':
          part = this.generateDateTime(element.format)
          break

        case 'SEQUENCE':
          const sequenceResult = await this.generateSequence(
            inventoryId,
            element.format
          )
          part = sequenceResult.sequenceValue
          sequenceNumber = sequenceResult.sequenceNumber
          break
      }

      // Apply formatting
      if (element.format && this.isNumeric(part)) {
        part = this.formatNumber(part, element.format)
      }

      parts.push(part)
    }

    const generatedId = parts.join('')

    // Check for uniqueness with retry limit
    const exists = await prisma.item.findFirst({
      where: {
        inventoryId,
        customId: generatedId,
      },
    })

    if (exists) {
      if (retryCount >= MAX_RETRIES) {
        throw new Error(
          `Failed to generate unique custom ID after ${MAX_RETRIES} attempts. Please modify your custom ID format.`
        )
      }

      console.warn(
        `Custom ID collision detected for inventory ${inventoryId}. Retry ${
          retryCount + 1
        }/${MAX_RETRIES}`
      )
      return this.generateCustomId(inventoryId, format, retryCount + 1)
    }

    return { customId: generatedId, sequenceNumber }
  }

  private async generateSequence(
    inventoryId: string,
    format?: string
  ): Promise<{ sequenceValue: string; sequenceNumber: number }> {
    // Find the maximum sequence number from ITEMS in this inventory
    const maxSequenceResult = await prisma.item.aggregate({
      _max: {
        sequenceNumber: true,
      },
      where: {
        inventoryId: inventoryId,
      },
    })

    // The next sequence is the max existing one + 1
    const nextSequenceNumber = (maxSequenceResult._max.sequenceNumber || 0) + 1

    // Format the number with leading zeros if needed
    let sequenceValue = nextSequenceNumber.toString()
    if (format) {
      sequenceValue = sequenceValue.padStart(format.length, '0')
    }

    return { sequenceValue, sequenceNumber: nextSequenceNumber }
  }

  // Generate preview (no changes needed here)
  async generatePreview(format: IdFormatElement[]): Promise<string> {
    const parts: string[] = []

    for (const element of format) {
      let part = ''

      switch (element.type) {
        case 'FIXED_TEXT':
          part = element.value || 'SAMPLE'
          break
        case 'RANDOM_20BIT':
          part = this.generateRandomNumber(1048575).toString()
          break
        case 'RANDOM_32BIT':
          part = this.generateRandomNumber(4294967295).toString()
          break
        case 'RANDOM_6DIGIT':
          part = this.generateRandomNumber(999999, 6, 0)
          break
        case 'RANDOM_9DIGIT':
          part = this.generateRandomNumber(999999999, 9, 0)
          break
        case 'GUID':
          part = this.generateStandardGuid()
          break
        case 'DATETIME':
          part = this.generateDateTime(element.format)
          break
        case 'SEQUENCE':
          // For preview, use a sample sequence number that shows formatting
          const sampleSequence = 42
          part = element.format
            ? sampleSequence.toString().padStart(element.format.length, '0')
            : sampleSequence.toString()
          break
      }

      if (element.format && this.isNumeric(part)) {
        part = this.formatNumber(part, element.format)
      }

      parts.push(part)
    }

    return parts.join('')
  }

  // ... rest of the helper methods remain the same ...
  private hasRandomOrSequenceElements(format: IdFormatElement[]): boolean {
    return format.some(
      (element) =>
        element.type.includes('RANDOM') ||
        element.type === 'GUID' ||
        element.type === 'SEQUENCE'
    )
  }

  private generateRandomNumber(
    max: number,
    minLength?: number,
    min: number = 0
  ): string {
    const random = Math.floor(Math.random() * (max - min + 1)) + min
    if (minLength) {
      return random.toString().padStart(minLength, '0')
    }
    return random.toString()
  }

  private generateStandardGuid(): string {
    const cryptoObj: Crypto | undefined =
      globalThis.crypto ??
      (typeof require !== 'undefined' ? require('crypto').webcrypto : undefined)

    if (cryptoObj?.getRandomValues) {
      const buffer = new Uint8Array(16)
      cryptoObj.getRandomValues(buffer)
      buffer[6]! = (buffer[6]! & 0x0f) | 0x40
      buffer[8]! = (buffer[8]! & 0x3f) | 0x80
      const hex = Array.from(buffer, (b) =>
        b.toString(16).padStart(2, '0')
      ).join('')
      return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(
        12,
        16
      )}-${hex.substring(16, 20)}-${hex.substring(20)}`
    }

    // Fallback
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  private generateDateTime(format?: string): string {
    const now = new Date()
    if (format === 'YYYYMMDD') {
      return now.toISOString().slice(0, 10).replace(/-/g, '')
    }
    if (format === 'YYYY-MM-DD') {
      return now.toISOString().slice(0, 10)
    }
    if (format === 'DDMMYYYY') {
      return `${now.getUTCDate().toString().padStart(2, '0')}${(now.getUTCMonth() + 1)
        .toString()
        .padStart(2, '0')}${now.getUTCFullYear()}`
    }
    if (format === 'YYYYMMDDHHmmss') {
      return now.toISOString().slice(0, 19).replace(/[-:T]/g, '')
    }
    return now.toISOString()
  }

  private formatNumber(value: string, format: string): string {
    const num = parseInt(value, 10)
    if (isNaN(num)) return value
    return num.toString().padStart(format.length, '0')
  }

  private isNumeric(value: string): boolean {
    return /^-?\d+$/.test(value)
  }
}
