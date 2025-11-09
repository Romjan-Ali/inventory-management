// frontend/src/components/inventory/Tabs/StatsTab.tsx
import type { Inventory } from '@/types'
import { useGetInventoryStatisticsQuery } from '@/features/inventory/inventoryApi'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Package,
  Calendar,
  Eye,
  CheckCircle,
  BarChart3,
  Hash,
  ToggleLeft,
  Type,
  FileText,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { cn } from '@/lib/utils'
import type {
  Stats,
  BooleanField,
  FieldCompletion,
  MostFrequent,
  NumericField,
  StringField,
  TextField,
  Overview,
} from '@/types/stats'

interface StatsTabProps {
  inventory: Inventory
}

const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: {
  title: string
  value: string | number
  description: string
  icon: React.ElementType
  trend?: 'up' | 'down' | 'neutral'
  className?: string
}) => (
  <Card className={cn('relative overflow-hidden', className)}>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <div
          className={cn(
            'rounded-lg p-3',
            trend === 'up'
              ? 'bg-green-100 dark:bg-green-900'
              : trend === 'down'
              ? 'bg-red-100 dark:bg-red-900'
              : 'bg-blue-100 dark:bg-blue-900'
          )}
        >
          <Icon
            className={cn(
              'h-6 w-6',
              trend === 'up'
                ? 'text-green-600 dark:text-green-400'
                : trend === 'down'
                ? 'text-red-600 dark:text-red-400'
                : 'text-blue-600 dark:text-blue-400'
            )}
          />
        </div>
      </div>
    </CardContent>
  </Card>
)

const ProgressCard = ({
  title,
  completed,
  total,
  percentage,
}: {
  title: string
  completed: number
  total: number
  percentage: number
}) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">{title}</span>
        <Badge variant="secondary">
          {completed}/{total}
        </Badge>
      </div>
      <Progress value={percentage} className="h-2" />
      <div className="flex justify-between mt-1">
        <span className="text-xs text-muted-foreground">Completion</span>
        <span className="text-xs font-medium">{percentage}%</span>
      </div>
    </CardContent>
  </Card>
)

const NumericStatCard = ({ field }: { field: NumericField }) => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="text-sm font-medium flex items-center gap-2">
        <Hash className="h-4 w-4" />
        {field.fieldName}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="space-y-1">
          <p className="text-muted-foreground">Average</p>
          <p className="font-semibold">{field.average}</p>
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground">Range</p>
          <p className="font-semibold">
            {field.min} - {field.max}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground">Total</p>
          <p className="font-semibold">{field.count}</p>
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground">Sum</p>
          <p className="font-semibold">{field.sum}</p>
        </div>
      </div>
    </CardContent>
  </Card>
)

const BooleanStatCard = ({ field }: { field: BooleanField }) => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="text-sm font-medium flex items-center gap-2">
        <ToggleLeft className="h-4 w-4" />
        {field.fieldName}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-center">
          <div
            className={cn(
              'text-2xl font-bold mb-1',
              field.truePercentage >= 50
                ? 'text-green-600'
                : 'text-muted-foreground'
            )}
          >
            {field.trueCount}
          </div>
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            True
          </Badge>
          <p className="text-xs text-muted-foreground mt-1">
            {field.truePercentage}%
          </p>
        </div>
        <div className="text-center">
          <div
            className={cn(
              'text-2xl font-bold mb-1',
              field.falsePercentage >= 50
                ? 'text-red-600'
                : 'text-muted-foreground'
            )}
          >
            {field.falseCount}
          </div>
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            False
          </Badge>
          <p className="text-xs text-muted-foreground mt-1">
            {field.falsePercentage}%
          </p>
        </div>
      </div>
      <div className="flex gap-1 h-2 rounded-full overflow-hidden">
        <div
          className="bg-green-500 transition-all duration-500"
          style={{ width: `${field.truePercentage}%` }}
        />
        <div
          className="bg-red-500 transition-all duration-500"
          style={{ width: `${field.falsePercentage}%` }}
        />
      </div>
    </CardContent>
  </Card>
)

const StringStatCard = ({ field }: { field: StringField }) => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="text-sm font-medium flex items-center gap-2">
        <Type className="h-4 w-4" />
        {field.fieldName}
      </CardTitle>
      <CardDescription>
        {field.uniqueValues} unique values • {field.totalValues} total entries
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-3">
      {field.mostFrequent.map((item: MostFrequent, idx: number) => (
        <div
          key={idx}
          className="flex items-center justify-between p-2 rounded-lg border"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{item.value}</p>
          </div>
          <div className="flex items-center gap-3 ml-2">
            <div className="text-right">
              <p className="text-sm font-medium">{item.count}</p>
              <p className="text-xs text-muted-foreground">
                {item.percentage}%
              </p>
            </div>
            <div className="w-16 bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
)

const TextStatCard = ({ field }: { field: TextField }) => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="text-sm font-medium flex items-center gap-2">
        <FileText className="h-4 w-4" />
        {field.fieldName}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-1">
          <p className="text-muted-foreground">Total Entries</p>
          <p className="font-semibold text-lg">{field.totalEntries}</p>
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground">Avg Length</p>
          <p className="font-semibold text-lg">{field.averageLength}</p>
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground">Max Length</p>
          <p className="font-semibold">{field.maxLength}</p>
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground">Min Length</p>
          <p className="font-semibold">{field.minLength}</p>
        </div>
      </div>
    </CardContent>
  </Card>
)

export default function StatsTab({ inventory }: StatsTabProps) {
  const { t } = useTranslation()

  const { data: statisticsData, isLoading: isLoadingStats } =
    useGetInventoryStatisticsQuery({
      inventoryId: inventory.id,
    })

  if (isLoadingStats) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const stats = (statisticsData as Stats) || {}
  const overview = (stats.overview as Overview) || {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          {t('inventoryStatistics')}
        </h2>
        <p className="text-muted-foreground">
          {t('statsCalculatedAt', {
            time: overview.calculatedAt
              ? new Date(overview.calculatedAt).toLocaleString()
              : 'N/A',
          })}
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('totalItems')}
          value={overview.totalItems || 0}
          description={t('totalItemsInInventory')}
          icon={Package}
          trend="up"
        />
        <StatCard
          title={t('recentActivity')}
          value={overview.recentItems || 0}
          description={t('last7Days')}
          icon={Calendar}
          trend="neutral"
        />
        <StatCard
          title={t('activeFields')}
          value={overview.activeFields || 0}
          description={t('customFieldsConfigured')}
          icon={Eye}
          trend="neutral"
        />
        <StatCard
          title={t('completionRate')}
          value={`${overview.overallCompletionRate || 0}%`}
          description={t('averageFieldCompletion')}
          icon={CheckCircle}
          trend={overview.overallCompletionRate > 50 ? 'up' : 'down'}
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="completion" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="completion" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Completion
          </TabsTrigger>
          <TabsTrigger value="numeric" className="flex items-center gap-2">
            <Hash className="h-4 w-4" />
            Numeric
          </TabsTrigger>
          <TabsTrigger value="boolean" className="flex items-center gap-2">
            <ToggleLeft className="h-4 w-4" />
            Boolean
          </TabsTrigger>
          <TabsTrigger value="text" className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            Text
          </TabsTrigger>
        </TabsList>

        {/* Completion Tab */}
        <TabsContent value="completion" className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stats.fieldCompletion?.map(
              (field: FieldCompletion, index: number) => (
                <ProgressCard
                  key={index}
                  title={field.fieldName}
                  completed={field.completed}
                  total={field.total}
                  percentage={Math.round(field.completionRate)}
                />
              )
            )}
          </div>

          {(!stats.fieldCompletion || stats.fieldCompletion.length === 0) && (
            <Card>
              <CardContent className="p-8 text-center">
                <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {t('noCompletionData')}
                </h3>
                <p className="text-muted-foreground">
                  {t('noCompletionDataDescription')}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Numeric Fields Tab */}
        <TabsContent value="numeric" className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stats.numericFields?.map((field: NumericField, index: number) => (
              <NumericStatCard key={index} field={field} />
            ))}
          </div>

          {(!stats.numericFields || stats.numericFields.length === 0) && (
            <Card>
              <CardContent className="p-8 text-center">
                <Hash className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {t('noNumericData')}
                </h3>
                <p className="text-muted-foreground">
                  {t('noNumericDataDescription')}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Boolean Fields Tab */}
        <TabsContent value="boolean" className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stats.booleanFields?.map((field: BooleanField, index: number) => (
              <BooleanStatCard key={index} field={field} />
            ))}
          </div>

          {(!stats.booleanFields || stats.booleanFields.length === 0) && (
            <Card>
              <CardContent className="p-8 text-center">
                <ToggleLeft className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {t('noBooleanData')}
                </h3>
                <p className="text-muted-foreground">
                  {t('noBooleanDataDescription')}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Text Fields Tab */}
        <TabsContent value="text" className="space-y-6">
          <div className="space-y-6">
            {/* String Fields */}
            {stats.stringFields && stats.stringFields.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Type className="h-5 w-5" />
                  String Fields
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {stats.stringFields.map(
                    (field: StringField, index: number) => (
                      <StringStatCard key={index} field={field} />
                    )
                  )}
                </div>
              </div>
            )}

            {/* Text Fields */}
            {stats.textFields && stats.textFields.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Text Fields
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {stats.textFields.map((field: TextField, index: number) => (
                    <TextStatCard key={index} field={field} />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {(!stats.stringFields || stats.stringFields.length === 0) &&
              (!stats.textFields || stats.textFields.length === 0) && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Type className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {t('noTextData')}
                    </h3>
                    <p className="text-muted-foreground">
                      {t('noTextDataDescription')}
                    </p>
                  </CardContent>
                </Card>
              )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Empty State for Entire Inventory */}
      {overview.totalItems === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {t('noDataAvailable')}
            </h3>
            <p className="text-muted-foreground mb-4">
              {t('noStatsAvailable')}
            </p>
            <Badge variant="outline" className="text-sm">
              Add items to see statistics
            </Badge>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
