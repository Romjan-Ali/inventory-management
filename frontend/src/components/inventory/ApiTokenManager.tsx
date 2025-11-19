// frontend/src/components/inventory/ApiTokenManager.tsx
import { useState, useEffect } from 'react'
import type { Inventory } from '@/types'
import { Copy, Plus, Trash2, Key } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { API_BASE_URL } from '@/lib/constants'

interface ApiToken {
  id: string
  token: string
  createdAt: string
  expiresAt: string | null
  isActive: boolean
}

interface ApiTokenManagerProps {
  inventory: Inventory
}

export default function ApiTokenManager({ inventory }: ApiTokenManagerProps) {
  const { t } = useTranslation()
  const [tokens, setTokens] = useState<ApiToken[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    fetchTokens()
  }, [inventory.id])

  const fetchTokens = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/${inventory.id}/tokens`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setTokens(data)
      } else if (response.status === 401) {
        toast.error(t('authenticationRequired'))
      } else {
        toast.error(t('failedToFetchTokens'))
      }
    } catch (error) {
      console.error('Failed to fetch tokens:', error)
      toast.error(t('failedToFetchTokens'))
    } finally {
      setIsLoading(false)
    }
  }

  const generateToken = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/${inventory.id}/tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      })

      if (response.ok) {
        const newToken = await response.json()
        setTokens(prev => [newToken, ...prev])
        toast.success(t('apiTokenGenerated'))
      } else if (response.status === 401) {
        toast.error(t('authenticationRequired'))
      } else if (response.status === 403) {
        toast.error(t('noWriteAccess'))
      } else {
        toast.error(t('failedToGenerateToken'))
      }
    } catch (error) {
      console.error('Failed to generate token:', error)
      toast.error(t('failedToGenerateToken'))
    } finally {
      setIsGenerating(false)
    }
  }

  const revokeToken = async (tokenId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/${inventory.id}/tokens/${tokenId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        setTokens(prev => prev.filter(token => token.id !== tokenId))
        toast.success(t('apiTokenRevoked'))
      } else if (response.status === 401) {
        toast.error(t('authenticationRequired'))
      } else if (response.status === 403) {
        toast.error(t('noWriteAccess'))
      } else {
        toast.error(t('failedToRevokeToken'))
      }
    } catch (error) {
      console.error('Failed to revoke token:', error)
      toast.error(t('failedToRevokeToken'))
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success(t('copiedToClipboard'))
  }

  const getApiUrl = () => {
    return `${API_BASE_URL}/inventory/odoo-data`
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              {t('apiAccess')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground">{t('loading')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            {t('apiAccess')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">{t('generateApiToken')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('apiTokenDescription')}
              </p>
            </div>
            <Button onClick={generateToken} disabled={isGenerating}>
              <Plus className="h-4 w-4 mr-2" />
              {t('generateToken')}
            </Button>
          </div>

          {tokens.length > 0 ? (
            <div className="space-y-3">
              <h4 className="font-medium">{t('activeTokens')}</h4>
              {tokens.map((token) => (
                <Card key={token.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {token.token.substring(0, 16)}...
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(token.token)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t('created')}: {new Date(token.createdAt).toLocaleDateString()}
                        {token.expiresAt && (
                          <> • {t('expires')}: {new Date(token.expiresAt).toLocaleDateString()}</>
                        )}
                      </div>
                      <div className="text-xs">
                        <strong>{t('apiUrl')}:</strong>
                        <div className="flex items-center gap-1 mt-1">
                          <code className="text-xs bg-muted px-2 py-1 rounded flex-1 font-mono">
                            {getApiUrl()}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(getApiUrl())}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>                      
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => revokeToken(token.id)}
                      className="ml-4"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <Key className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">{t('noTokensGenerated')}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {t('generateFirstToken')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}