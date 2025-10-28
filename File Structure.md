```rust
backend/
├── 📁 prisma/                          # Database schema and migrations
│   ├── schema.prisma                   # Main database schema
│   └── 📁 migrations/                  # Generated migration files
│       ├── 20240101000000_init/
│       └── 20240102000000_add_custom_fields/
│
├── 📁 src/                             # Source code
│   ├── 🟣 index.ts                     # Application entry point
│   ├── 🟣 app.ts                       # Express app configuration
│   │
│   ├── 📁 config/                      # Configuration files
│   │   ├── 🟢 database.ts              # Database configuration
│   │   ├── 🟢 passport.ts              # Passport strategies (Google, Facebook)
│   │   ├── 🟢 constants.ts             # Application constants
│   │   └── 🟢 environment.ts           # Environment validation
│   │
│   ├── 📁 middleware/                  # Custom middleware
│   │   ├── 🟢 auth.ts                  # Authentication middleware
│   │   ├── 🟢 inventory.ts             # Inventory access control
│   │   ├── 🟢 validation.ts            # Request validation
│   │   ├── 🟢 errorHandler.ts          # Global error handling
│   │   └── 🟢 rateLimit.ts             # Rate limiting
│   │
│   ├── 📁 routes/                      # API route handlers
│   │   ├── 🟢 index.ts                 # Route aggregator
│   │   ├── 🟢 auth.ts                  # Authentication routes
│   │   ├── 🟢 users.ts                 # User management routes
│   │   ├── 🟢 inventories.ts           # Inventory CRUD routes
│   │   ├── 🟢 items.ts                 # Item management routes
│   │   ├── 🟢 search.ts                # Search endpoints
│   │   └── 🟢 posts.ts                 # Discussion posts routes
│   │
│   ├── 📁 controllers/                 # Request handlers
│   │   ├── 🟢 BaseController.ts        # Base controller class
│   │   ├── 🟢 AuthController.ts        # Authentication logic
│   │   ├── 🟢 UserController.ts        # User management
│   │   ├── 🟢 InventoryController.ts   # Inventory operations
│   │   ├── 🟢 ItemController.ts        # Item operations
│   │   ├── 🟢 SearchController.ts      # Search functionality
│   │   └── 🟢 PostController.ts        # Discussion posts
│   │
│   ├── 📁 services/                    # Business logic layer
│   │   ├── 🟢 BaseService.ts           # Base service class
│   │   ├── 🟢 AuthService.ts           # Authentication logic
│   │   ├── 🟢 UserService.ts           # User management
│   │   ├── 🟢 InventoryService.ts      # Inventory business logic
│   │   ├── 🟢 ItemService.ts           # Item business logic
│   │   ├── 🟢 SearchService.ts         # Search functionality
│   │   ├── 🟢 FieldConfigService.ts    # Custom field management
│   │   ├── 🟢 CustomIdService.ts       # Custom ID generation
│   │   ├── 🟢 AccessService.ts         # Access control logic
│   │   ├── 🟢 StatisticsService.ts     # Inventory statistics
│   │   └── 🟢 SocketService.ts         # Real-time functionality
│   │
│   ├── 📁 repositories/                # Data access layer
│   │   ├── 🟢 BaseRepository.ts        # Base repository class
│   │   ├── 🟢 UserRepository.ts        # User data operations
│   │   ├── 🟢 InventoryRepository.ts   # Inventory data operations
│   │   ├── 🟢 ItemRepository.ts        # Item data operations
│   │   ├── 🟢 AccessRepository.ts      # Access control data
│   │   ├── 🟢 PostRepository.ts        # Discussion posts data
│   │   └── 🟢 LikeRepository.ts        # Like data operations
│   │
│   ├── 📁 factories/                   # Factory patterns
│   │   ├── 🟢 CustomIdGeneratorFactory.ts  # ID generator factory
│   │   ├── 🟢 FieldConfigFactory.ts    # Field configuration factory
│   │   └── 🟢 ServiceFactory.ts        # Service instantiation
│   │
│   ├── 📁 utils/                       # Utility functions
│   │   ├── 🟢 helpers.ts               # General helper functions
│   │   ├── 🟢 validation.ts            # Validation utilities
│   │   ├── 🟢 fieldConfig.ts           # Custom field management
│   │   ├── 🟢 idGeneration.ts          # ID generation utilities
│   │   ├── 🟢 searchUtils.ts           # Search helper functions
│   │   ├── 🟢 socketEvents.ts          # Socket.io event handlers
│   │   └── 🟢 aggregation.ts           # Data aggregation helpers
│   │
│   ├── 📁 types/                       # TypeScript type definitions
│   │   ├── 🟢 index.ts                 # Main type exports
│   │   ├── 🟢 requests.ts              # Request DTOs
│   │   ├── 🟢 responses.ts             # Response DTOs
│   │   ├── 🟢 database.ts              # Database entity types
│   │   └── 🟢 customIds.ts             # Custom ID format types
│   │
│   ├── 📁 lib/                         # Third-party lib configurations
│   │   ├── 🟢 prisma.ts                # Prisma client instance
│   │   ├── 🟢 socket.ts                # Socket.io setup
│   │   ├── 🟢 container.ts             # Dependency injection container
│   │   └── 🟢 cache.ts                 # Redis cache (optional)
│   │
│   ├── 📁 errors/                      # Custom error classes
│   │   ├── 🟢 AppError.ts              # Base error class
│   │   ├── 🟢 ValidationError.ts       # Validation errors
│   │   ├── 🟢 AuthError.ts             # Authentication errors
│   │   ├── 🟢 PermissionError.ts       # Access denied errors
│   │   └── 🟢 OptimisticLockError.ts   # Optimistic locking errors
│   │
│   └── 📁 events/                      # Event handlers
│       ├── 🟢 EventEmitter.ts          # Custom event emitter
│       ├── 🟢 InventoryEvents.ts       # Inventory-related events
│       ├── 🟢 ItemEvents.ts            # Item-related events
│       └── 🟢 PostEvents.ts            # Post-related events
│
├── 📁 tests/                           # Test files
│   ├── 📁 unit/
│   │   ├── 📁 services/
│   │   ├── 📁 controllers/
│   │   └── 📁 repositories/
│   ├── 📁 integration/
│   │   ├── 📁 api/
│   │   └── 📁 database/
│   └── 📁 fixtures/                    # Test data
│
├── 📁 docs/                            # Documentation
│   ├── 🟡 API.md                       # API documentation
│   ├── 🟡 SETUP.md                     # Setup instructions
│   └── 🟡 DEPLOYMENT.md                # Deployment guide
│
├── 🟡 .env.example                     # Environment variables template
├── 🟡 .env                             # Environment variables (ignored in git)
├── 🟡 package.json                     # Dependencies and scripts
├── 🟡 tsconfig.json                    # TypeScript configuration
├── 🟡 docker-compose.yml               # Docker setup for development
└── 🟡 README.md                        # Project overview
```

```rust
frontend/
├── 📁 public/
│   ├── 🟢 favicon.ico
│   ├── 🟢 logo.png
│   └── 🟢 manifest.json
│
├── 📁 src/
│   ├── 🟣 main.tsx                     # App entry point with Redux provider
│   ├── 🟣 App.tsx                      # Root app component
│   │
│   ├── 📁 app/                         # Redux store configuration
│   │   ├── 🟢 store.ts                 # Main store configuration
│   │   ├── 🟢 rootReducer.ts           # Combined reducers
│   │   └── 🟢 hooks.ts                 # Typed Redux hooks
│   │
│   ├── 📁 features/                    # Redux feature-based structure
│   │   ├── 📁 auth/                    # Authentication feature
│   │   │   ├── 🟢 authSlice.ts         # Auth state slice
│   │   │   ├── 🟢 authApi.ts           # Auth API endpoints (RTK Query)
│   │   │   └── 🟢 authSelectors.ts     # Auth selectors
│   │   │
│   │   ├── 📁 inventory/               # Inventory feature
│   │   │   ├── 🟢 inventorySlice.ts    # Inventory state
│   │   │   ├── 🟢 inventoryApi.ts      # Inventory API endpoints
│   │   │   ├── 🟢 inventorySelectors.ts
│   │   │   └── 🟢 inventoryThunks.ts   # Async thunks (if needed)
│   │   │
│   │   ├── 📁 items/                   # Items feature
│   │   │   ├── 🟢 itemsSlice.ts
│   │   │   ├── 🟢 itemsApi.ts
│   │   │   └── 🟢 itemsSelectors.ts
│   │   │
│   │   ├── 📁 search/                  # Search feature
│   │   │   ├── 🟢 searchSlice.ts
│   │   │   ├── 🟢 searchApi.ts
│   │   │   └── 🟢 searchSelectors.ts
│   │   │
│   │   ├── 📁 ui/                      # UI state feature
│   │   │   ├── 🟢 uiSlice.ts           # Loading, modals, notifications
│   │   │   └── 🟢 uiSelectors.ts
│   │   │
│   │   └── 📁 theme/                   # Theme feature
│   │       ├── 🟢 themeSlice.ts        # Light/dark theme
│   │       └── 🟢 themeSelectors.ts
│   │
│   ├── 📁 components/                  # Reusable UI components
│   │   ├── 📁 ui/                      # shadcn/ui components
│   │   │   ├── 🟢 button.tsx
│   │   │   ├── 🟢 input.tsx
│   │   │   ├── 🟢 table.tsx
│   │   │   ├── 🟢 dialog.tsx
│   │   │   ├── 🟢 select.tsx
│   │   │   └── 🟢 ... (other shadcn components)
│   │   │
│   │   ├── 📁 common/                  # Common application components
│   │   │   ├── 🟢 Header.tsx           # App header with search
│   │   │   ├── 🟢 Sidebar.tsx          # Navigation sidebar
│   │   │   ├── 🟢 DataTable/           # Reusable table component
│   │   │   │   ├── 🟢 DataTable.tsx
│   │   │   │   ├── 🟢 TableToolbar.tsx
│   │   │   │   └── 🟢 ColumnHeader.tsx
│   │   │   ├── 🟢 SearchBox.tsx        # Global search component
│   │   │   ├── 🟢 LanguageSelector.tsx
│   │   │   ├── 🟢 ThemeToggle.tsx
│   │   │   └── 🟢 LoadingSpinner.tsx
│   │   │
│   │   ├── 📁 inventory/               # Inventory-specific components
│   │   │   ├── 🟢 InventoryForm.tsx    # Create/edit inventory
│   │   │   ├── 🟢 InventoryCard.tsx    # Inventory preview card
│   │   │   ├── 🟢 FieldManager/        # Custom field management
│   │   │   │   ├── 🟢 FieldManager.tsx
│   │   │   │   ├── 🟢 FieldItem.tsx
│   │   │   │   ├── 🟢 FieldToolbar.tsx
│   │   │   │   └── 🟢 FieldConfig.tsx
│   │   │   ├── 🟢 CustomIdBuilder/     # Custom ID format editor
│   │   │   │   ├── 🟢 CustomIdBuilder.tsx
│   │   │   │   ├── 🟢 IdElement.tsx
│   │   │   │   └── 🟢 IdPreview.tsx
│   │   │   ├── 🟢 InventoryTable/      # Items table with selection
│   │   │   │   ├── 🟢 InventoryTable.tsx
│   │   │   │   ├── 🟢 TableActions.tsx
│   │   │   │   └── 🟢 RowActions.tsx
│   │   │   ├── 🟢 AccessManager/       # User access control
│   │   │   │   ├── 🟢 AccessManager.tsx
│   │   │   │   ├── 🟢 UserSearch.tsx
│   │   │   │   └── 🟢 AccessList.tsx
│   │   │   └── 🟢 InventoryStats/      # Statistics display
│   │   │       ├── 🟢 StatsOverview.tsx
│   │   │       └── 🟢 FieldStats.tsx
│   │   │
│   │   ├── 📁 item/                    # Item-specific components
│   │   │   ├── 🟢 ItemForm.tsx         # Dynamic form based on field config
│   │   │   ├── 🟢 ItemView.tsx         # Read-only item display
│   │   │   ├── 🟢 ItemCard.tsx         # Item preview card
│   │   │   └── 🟢 ItemActions.tsx      # Item action buttons
│   │   │
│   │   ├── 📁 discussion/              # Discussion components
│   │   │   ├── 🟢 DiscussionThread.tsx # Real-time discussion
│   │   │   ├── 🟢 PostList.tsx         # Posts list
│   │   │   ├── 🟢 PostItem.tsx         # Single post display
│   │   │   └── 🟢 PostForm.tsx         # New post input
│   │   │
│   │   └── 📁 forms/                   # Form components
│   │       ├── 🟢 DynamicForm.tsx      # Form generator for custom fields
│   │       ├── 🟢 FieldRenderer.tsx    # Renders field based on type
│   │       └── 🟢 FormValidation.tsx   # Form validation logic
│   │
│   ├── 📁 pages/                       # Page components
│   │   ├── 🟢 Layout.tsx               # Main app layout
│   │   ├── 🟢 Home/                    # Landing page
│   │   │   ├── 🟢 Home.tsx
│   │   │   ├── 🟢 PopularInventories.tsx
│   │   │   └── 🟢 TagCloud.tsx
│   │   ├── 🟢 Dashboard/               # User personal page
│   │   │   ├── 🟢 Dashboard.tsx
│   │   │   ├── 🟢 MyInventories.tsx
│   │   │   └── 🟢 AccessibleInventories.tsx
│   │   ├── 🟢 Inventory/               # Inventory details page
│   │   │   ├── 🟢 InventoryPage.tsx
│   │   │   ├── 🟢 InventoryTabs.tsx
│   │   │   ├── 🟢 ItemsTab.tsx
│   │   │   ├── 🟢 DiscussionTab.tsx
│   │   │   ├── 🟢 SettingsTab.tsx
│   │   │   └── 🟢 StatsTab.tsx
│   │   ├── 🟢 Admin/                   # Admin user management
│   │   │   ├── 🟢 Admin.tsx
│   │   │   └── 🟢 UserManagement.tsx
│   │   ├── 🟢 Search/                  # Search results page
│   │   │   ├── 🟢 SearchPage.tsx
│   │   │   └── 🟢 SearchResults.tsx
│   │   ├── 🟢 Auth/                    # Authentication pages
│   │   │   ├── 🟢 Login.tsx
│   │   │   ├── 🟢 Register.tsx
│   │   │   └── 🟢 SocialAuth.tsx
│   │   └── 🟢 Error/                   # Error pages
│   │       ├── 🟢 NotFound.tsx
│   │       └── 🟢 Unauthorized.tsx
│   │
│   ├── 📁 hooks/                       # Custom React hooks
│   │   ├── 🟢 useAuth.ts               # Authentication hook (uses Redux)
│   │   ├── 🟢 useOptimisticLock.ts     # Optimistic locking helper
│   │   ├── 🟢 useAutoSave.ts           # Auto-save functionality
│   │   ├── 🟢 useWebSocket.ts          # Real-time connections
│   │   ├── 🟢 useDebounce.ts           # Debounce utility
│   │   └── 🟢 useLocalStorage.ts       # Local storage helper
│   │
│   ├── 📁 lib/                         # Utility libraries
│   │   ├── 🟢 api.ts                   # Axios instance configuration
│   │   ├── 🟢 utils.ts                 # General utilities
│   │   ├── 🟢 validation.ts            # Validation schemas (Zod)
│   │   ├── 🟢 i18n.ts                  # Internationalization
│   │   ├── 🟢 socket.ts                # Socket.io client
│   │   └── 🟢 constants.ts             # Application constants
│   │
│   ├── 📁 types/                       # TypeScript types
│   │   ├── 🟢 index.ts                 # Main type exports
│   │   ├── 🟢 api.ts                   # API response types
│   │   ├── 🟢 inventory.ts             # Inventory-related types
│   │   ├── 🟢 item.ts                  # Item-related types
│   │   ├── 🟢 form.ts                  # Form types
│   │   └── 🟢 redux.ts                 # Redux-specific types
│   │
│   ├── 📁 styles/                      # Styling
│   │   ├── 🟢 globals.css              # Global styles
│   │   └── 🟢 components.css           # Component-specific styles
│   │
│   └── 📁 assets/                      # Static assets
│       ├── 📁 icons/                   # SVG icons
│       └── 📁 images/                  # Images
│
├── 🟡 tailwind.config.js               # Tailwind CSS configuration
├── 🟡 components.json                  # shadcn/ui configuration
├── 🟡 vite.config.ts                   # Vite configuration
├── 🟡 tsconfig.json                    # TypeScript configuration
├── 🟡 package.json                     # Dependencies and scripts
└── 🟡 README.md                        # Frontend documentation
```