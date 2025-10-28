// frontend/src/pages/Home/Home.tsx
import { Link } from 'react-router-dom'
import { useGetPopularInventoriesQuery } from '@/features/inventory/inventoryApi'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export default function Home() {
  const { data: popularInventories, isLoading } = useGetPopularInventoriesQuery(5)

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Manage Your Inventory
          <span className="block text-primary">With Ease</span>
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
          Create custom inventories, manage items with flexible fields, and collaborate with your team in real-time.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            to="/dashboard"
            className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-secondary shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="text-sm font-semibold leading-6 text-foreground"
          >
            Sign In <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      {/* Popular Inventories */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Popular Inventories</h2>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularInventories?.map((inventory) => (
              <div
                key={inventory.id}
                className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <h3 className="font-semibold text-lg mb-2">{inventory.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {inventory.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {inventory.category}
                  </span>
                  <Link
                    to={`/inventory/${inventory.id}`}
                    className="text-primary hover:underline text-sm"
                  >
                    View Inventory
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}