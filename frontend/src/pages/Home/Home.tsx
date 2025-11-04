// frontend/src/pages/Home/Home.tsx
import { Link } from 'react-router-dom'
import { useGetPopularInventoriesQuery, useGetInventoriesQuery, useGetAllPublicInventoryTagsQuery } from '@/features/inventory/inventoryApi'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { useAppSelector } from '@/app/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function Home() {
  const { user } = useAppSelector((state) => state.auth)
  const { data: popularInventories, isLoading: isLoadingPopular } = useGetPopularInventoriesQuery(5)
  const { data: latestInventoriesData, isLoading: isLoadingLatest } = useGetInventoriesQuery({
    limit: 10,
    page: 1,
  })
  const { data: tagsData, isLoading: isLoadingTags } = useGetAllPublicInventoryTagsQuery()

  const latestInventories = latestInventoriesData?.inventories || []
  const tags = tagsData || []

  // Quick stats data
  const quickStats = [
    { label: 'Total Inventories', value: '1,200+' },
    { label: 'Items Tracked', value: '50,000+' },
    { label: 'Active Users', value: '500+' },
  ]

  const features = [
    {
      title: 'Custom Fields',
      description: 'Define exactly what data you need to track with flexible field types',
      icon: '📊'
    },
    {
      title: 'Real-time Collaboration',
      description: 'Work with your team with live updates and discussions',
      icon: '👥'
    },
    {
      title: 'Smart Search',
      description: 'Find anything instantly with powerful full-text search',
      icon: '🔍'
    },
    {
      title: 'Custom IDs',
      description: 'Create your own inventory numbering system',
      icon: '🏷️'
    },
  ]

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center py-16 bg-gradient-to-b from-background to-muted/30 rounded-3xl">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Manage Your Inventory
            <span className="block text-primary mt-2">With Ultimate Flexibility</span>
          </h1>
          <p className="mt-6 text-xl leading-8 text-muted-foreground max-w-3xl mx-auto">
            Create custom inventories with your own fields, collaborate with your team in real-time, 
            and find anything instantly with powerful search. Perfect for offices, libraries, stores, and more.
          </p>
          
          {/* Quick Stats */}
          <div className="mt-12 flex justify-center gap-8">
            {quickStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-12 flex items-center justify-center gap-x-6 flex-wrap gap-y-4">
            {user ? (
              <>
                <Button asChild size="lg">
                  <Link to="/dashboard">Go to Dashboard</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/inventory/new">Create Inventory</Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild size="lg">
                  <Link to="/register">Get Started Free</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/inventory">Explore Public Inventories</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Why Choose Our Inventory Manager?</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Built for flexibility and collaboration, with features that adapt to your needs
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-all duration-300">
              <CardContent className="pt-6">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="font-semibold text-lg mb-3">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <div className="flex flex-col gap-8">
        {/* Latest Inventories Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Latest Inventories</CardTitle>
                  <CardDescription>Recently created inventories</CardDescription>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link to="/inventory?sort=newest">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingLatest ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Creator</TableHead>
                      <TableHead>Items</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {latestInventories.slice(0, 5).map((inventory) => (
                      <TableRow key={inventory.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell>
                          <Link to={`/inventory/${inventory.id}`} className="font-medium hover:text-primary">
                            {inventory.title}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px] truncate text-sm text-muted-foreground">
                            {inventory.description || 'No description'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{inventory.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={inventory.creator?.avatar} />
                              <AvatarFallback className="text-xs">
                                {getInitials(inventory.creator?.name || 'UU')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{inventory.creator?.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {inventory._count?.items || 0}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

 {/* Popular Inventories Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Popular Inventories</CardTitle>
                  <CardDescription>Most items</CardDescription>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link to="/inventory?sort=popular">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingPopular ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Creator</TableHead>
                      <TableHead>Items</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {popularInventories?.map((inventory) => (
                      <TableRow key={inventory.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell>
                          <Link to={`/inventory/${inventory.id}`} className="font-medium hover:text-primary">
                            {inventory.title}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px] truncate text-sm text-muted-foreground">
                            {inventory.description || 'No description'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{inventory.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={inventory.creator?.avatar} />
                              <AvatarFallback className="text-xs">
                                {getInitials(inventory.creator?.name || 'UU')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{inventory.creator?.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {inventory._count?.items || 0}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tag Cloud Section */}
      <Card>
        <CardHeader>
          <CardTitle>Explore by Tags</CardTitle>
          <CardDescription>Click on a tag to find related inventories</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingTags ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Button
                  key={tag.name}
                  asChild
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                >
                  <Link to={`/inventory?tag=${encodeURIComponent(tag.name)}`}>
                    {tag.name}
                    <Badge variant="secondary" className="ml-2">
                      {tag.count}
                    </Badge>
                  </Link>
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Final CTA Section */}
      <section className="text-center py-16 bg-primary/5 rounded-3xl">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join thousands of users who are already managing their inventories with ease
        </p>
        {!user ? (
          <div className="flex items-center justify-center gap-x-6">
            <Button asChild size="lg">
              <Link to="/register">Create Your Account</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/inventory">
                Browse Public Inventories <span aria-hidden="true">→</span>
              </Link>
            </Button>
          </div>
        ) : (
          <Button asChild size="lg">
            <Link to="/inventory/new">Create Your First Inventory</Link>
          </Button>
        )}
      </section>
    </div>
  )
}