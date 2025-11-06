// frontend/src/components/inventory/CustomId/CustomIdPreview.tsx
import { useState, useEffect } from 'react'
import type { IdFormatElement } from '@/types'
import { usePreviewCustomIdMutation } from '@/features/inventory/inventoryApi'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { RefreshCw, Copy, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useDebounce } from 'use-debounce' 
import { useTranslation } from 'react-i18next'

interface CustomIdPreviewProps {
  format: IdFormatElement[]
}

export default function CustomIdPreview({ format }: CustomIdPreviewProps) {
  const { t } = useTranslation()
  const [previewCustomId, { isLoading, error }] = usePreviewCustomIdMutation()
  const [preview, setPreview] = useState<string>('')
  const [lastValidPreview, setLastValidPreview] = useState<string>('')

  // Debounce the format to prevent too many API calls (500ms delay)
  const [debouncedFormat] = useDebounce(format, 500)

  useEffect(() => {
    if (debouncedFormat.length > 0) {      
      generatePreview()
    } else {
      setPreview('')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFormat])

  const generatePreview = async () => {
    try {
      const result = await previewCustomId({ format: debouncedFormat }).unwrap()
      setPreview(result.preview)
      setLastValidPreview(result.preview)
    } catch (error) {
      console.error('Failed to generate preview:', error)
      // Keep the last valid preview if available
      setPreview(lastValidPreview || t('failedToGeneratePreview'))
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(preview)
      toast.success('Copied to clipboard')
    } catch (error) {
      console.error('Failed to copy:', error)
      toast.error('Failed to copy to clipboard')
    }
  }

  if (format.length === 0) {
    return (
      <div className="space-y-3">
        <Label>{t('preview')}</Label>
        <div className="p-4 border rounded-lg bg-muted/50 text-muted-foreground text-center">
          {t('addElementsToSeePreview')}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>{t('preview')}</Label>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={generatePreview}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {t('refresh')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            disabled={!preview || preview.startsWith('Error')}
          >
            <Copy className="h-4 w-4 mr-2" />
            {t('copy')}
          </Button>
        </div>
      </div>
      
      <div className={`p-4 border rounded-lg font-mono text-lg text-center ${
        preview.startsWith('Error') ? 'bg-destructive/10 text-destructive' : 'bg-muted/50'
      }`}>
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            {t('generatingPreview')}
          </div>
        ) : error ? (
          <div className="flex items-center justify-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            {t('failedToGeneratePreview')}
          </div>
        ) : (
          preview || t('startTypingToSeePreview')
        )}
      </div>
      
      <p className="text-sm text-muted-foreground">
        {t('previewAutoUpdates')}
      </p>
    </div>
  )
}