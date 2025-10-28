import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import InventoryForm from '@/components/inventory/InventoryForm'

export default function CreateInventory() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Create New Inventory</h1>
        <p className="text-muted-foreground">
          Set up a new inventory with custom fields and access controls.
        </p>
      </div>

      {/* Form */}
      <InventoryForm />
    </div>
  )
}