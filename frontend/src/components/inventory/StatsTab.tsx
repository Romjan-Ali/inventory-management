// frontend/src/components/inventory/StatsTab.tsx
import type { Inventory } from '@/types'
import { useGetInventoryItemsQuery } from '@/features/items/itemsApi'
import { getActiveFields } from '@/utils/fieldConfig'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Package, Users, Eye, BarChart3 } from 'lucide-react'

interface StatsTabProps {
  inventory: Inventory
}

export default function StatsTab({ inventory }: StatsTabProps) {
  const { data: itemsData } = useGetInventoryItemsQuery({
    inventoryId: inventory.id,
    limit: 1000, // Get all items for stats
  })

  const items = itemsData?.items || []
  const activeFields = getActiveFields(inventory)

  // Basic Statistics
  const totalItems = items.length
  const recentItems = items.filter(item => 
    new Date(item.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length

  // Field Type Statistics
  const fieldStats = activeFields.map(field => {
    const values = items
      .map(item => item[`${field.type}${field.index}Value` as keyof typeof item])
      .filter(value => value !== undefined && value !== null && value !== '')
    
    return {
      name: field.name,
      type: field.type,
      filled: values.length,
      total: items.length,
      percentage: items.length > 0 ? (values.length / items.length) * 100 : 0,
    }
  })

  // Boolean Field Statistics
  const booleanFields = activeFields.filter(field => field.type === 'boolean')
  const booleanStats = booleanFields.map(field => {
    const values = items
      .map(item => item[`${field.type}${field.index}Value` as keyof typeof item])
      .filter(value => value !== undefined && value !== null)
    
    const trueCount = values.filter(value => value === true).length
    const falseCount = values.filter(value => value === false).length
    
    return {
      name: field.name,
      true: trueCount,
      false: falseCount,
      total: values.length,
    }
  })

  // Number Field Statistics
  const numberFields = activeFields.filter(field => field.type === 'number')
  const numberStats = numberFields.map(field => {
    const values = items
      .map(item => Number(item[`${field.type}${field.index}Value` as keyof typeof item]))
      .filter(value => !isNaN(value))
    
    const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0
    const min = values.length > 0 ? Math.min(...values) : 0
    const max = values.length > 0 ? Math.max(...values) : 0
    
    return {
      name: field.name,
      average: avg,
      min,
      max,
      count: values.length,
    }
  })

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Statistics</h2>
        <p className="text-muted-foreground">
          Analytics and insights for this inventory
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-3">
            <Package className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{totalItems}</p>
              <p className="text-sm text-muted-foreground">Total Items</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{recentItems}</p>
              <p className="text-sm text-muted-foreground">Last 7 Days</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-3">
            <Eye className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-2xl font-bold">{activeFields.length}</p>
              <p className="text-sm text-muted-foreground">Active Fields</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold">
                {Math.round(fieldStats.reduce((acc, stat) => acc + stat.percentage, 0) / (fieldStats.length || 1))}%
              </p>
              <p className="text-sm text-muted-foreground">Avg Completion</p>
            </div>
          </div>
        </div>
      </div>

      {/* Field Completion Chart */}
      {fieldStats.length > 0 && (
        <div className="rounded-lg border p-6">
          <h3 className="text-lg font-medium mb-4">Field Completion</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fieldStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, 'Completion']} />
                <Bar dataKey="percentage" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Boolean Field Stats */}
      {booleanStats.length > 0 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {booleanStats.map((stat, index) => (
            <div key={stat.name} className="rounded-lg border p-6">
              <h3 className="text-lg font-medium mb-4">{stat.name}</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'True', value: stat.true },
                        { name: 'False', value: stat.false },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill={COLORS[0]} />
                      <Cell fill={COLORS[1]} />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Number Field Stats */}
      {numberStats.length > 0 && (
        <div className="rounded-lg border p-6">
          <h3 className="text-lg font-medium mb-4">Numeric Field Statistics</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {numberStats.map((stat) => (
              <div key={stat.name} className="rounded-lg bg-gray-50 p-4">
                <h4 className="font-medium mb-2">{stat.name}</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Average:</span>
                    <span className="font-medium">{stat.average.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Min:</span>
                    <span className="font-medium">{stat.min.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Max:</span>
                    <span className="font-medium">{stat.max.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Values:</span>
                    <span className="font-medium">{stat.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {items.length === 0 && (
        <div className="rounded-lg border p-8 text-center">
          <div className="text-muted-foreground">
            No data available. Add some items to see statistics.
          </div>
        </div>
      )}
    </div>
  )
}