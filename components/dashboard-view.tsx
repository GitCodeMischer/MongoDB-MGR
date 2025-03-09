"use client"

import { useEffect, useState } from "react"
import { Database, Server, LayoutDashboard, ChevronDown, ChevronRight, Plus, Pencil, Trash2, Loader2, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarTrigger,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import ServerStatusView from "@/components/server-status-view"
import DashboardViewEnhanced from "@/components/dashboard-view-enhanced"
import { MongoDBConnectDialog } from "@/components/mongodb-connect-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useMongoDBStore, formatBytes, formatNumber, type MongoDBDatabase, type MongoDBCollection } from "@/lib/mongodb"

interface SavedConnection {
  id: string
  name: string
  connectionString: string
  params: any
  preset?: string
  createdAt: string
  lastUsed?: string
}

export default function DashboardView() {
  const [selectedDatabase, setSelectedDatabase] = useState<string | null>(null)
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null)
  const [selectedView, setSelectedView] = useState<"dashboard" | "server-status" | null>("dashboard")
  const [searchQuery, setSearchQuery] = useState("")
  const { activeConnection, databases, setDatabases, updateCollections, removeConnection } = useMongoDBStore()

  // Fetch databases when connection changes
  useEffect(() => {
    if (activeConnection) {
      fetchDatabases()
    }
  }, [activeConnection])

  // Fetch collections when database is selected
  useEffect(() => {
    if (activeConnection && selectedDatabase) {
      fetchCollections(selectedDatabase)
    }
  }, [activeConnection, selectedDatabase])

  const fetchDatabases = async () => {
    if (!activeConnection) return

    try {
      const response = await fetch('/api/mongodb/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uri: activeConnection.uri,
        })
      })

      const data = await response.json()
      if (data.success) {
        setDatabases(data.databases)
      }
    } catch (error) {
      console.error('Failed to fetch databases:', error)
    }
  }

  const fetchCollections = async (dbName: string) => {
    if (!activeConnection) return

    try {
      const response = await fetch(
        `/api/mongodb/databases/${dbName}/collections?uri=${encodeURIComponent(activeConnection.uri)}`
      )

      const data = await response.json()
      if (data.success) {
        updateCollections(dbName, data.collections)
      }
    } catch (error) {
      console.error('Failed to fetch collections:', error)
    }
  }

  const handleConnect = async (connection: any) => {
    // Connection handling is managed by the MongoDBConnectDialog
  }

  const handleDatabaseSelect = (dbName: string) => {
    setSelectedDatabase(dbName)
    setSelectedCollection(null)
    setSelectedView(null)
  }

  const handleCollectionSelect = (collectionName: string) => {
    setSelectedCollection(collectionName)
    setSelectedView(null)
  }

  // Filter databases based on search query
  const filteredDatabases = databases.filter(db =>
    db.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Get the current database and collection
  const currentDatabase = databases.find(db => db.name === selectedDatabase)
  const currentCollection = currentDatabase?.collections?.find(coll => coll.name === selectedCollection)

  // Format the path segments for breadcrumb style navigation
  const getPathSegments = () => {
    if (selectedView === "server-status") return [{ label: "Server Status", type: "view" }]
    if (selectedView === "dashboard") return [{ label: "Dashboard", type: "view" }]
    if (selectedCollection) {
      return [
        { label: selectedDatabase as string, type: "database" },
        { label: selectedCollection, type: "collection" },
      ]
    }
    if (selectedDatabase) return [{ label: selectedDatabase as string, type: "database" }]
    return [{ label: "MongoDB Overview", type: "home" }]
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <Sidebar>
          <SidebarHeader className="border-b">
            <div className="flex items-center gap-2 px-4 py-2">
              <Database className="h-6 w-6" />
              <span className="font-semibold">MongoDB Dashboard</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            {!activeConnection ? (
              <div className="flex flex-col items-center justify-center p-4 space-y-4">
                <p className="text-sm text-muted-foreground">Not connected to MongoDB</p>
                <MongoDBConnectDialog onConnect={handleConnect}>
                  <Button variant="outline" size="sm">Connect to MongoDB</Button>
                </MongoDBConnectDialog>
              </div>
            ) : (
              <>
                <div className="px-4 py-2">
                  <Input 
                    placeholder="Search databases..." 
                    className="h-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <SidebarGroup>
                  <SidebarGroupLabel>Databases</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {filteredDatabases.map((db) => (
                        <SidebarMenuItem key={db.name}>
                          <SidebarMenuButton
                            isActive={selectedDatabase === db.name}
                            onClick={() => handleDatabaseSelect(db.name)}
                          >
                            <Database className="h-4 w-4" />
                            <span>{db.name}</span>
                            <ChevronDown className="ml-auto h-4 w-4" />
                          </SidebarMenuButton>
                          {selectedDatabase === db.name && db.collections && (
                            <SidebarMenuSub>
                              {db.collections.map((coll) => (
                                <SidebarMenuSubItem key={coll.name}>
                                  <SidebarMenuSubButton
                                    isActive={selectedCollection === coll.name}
                                    onClick={() => handleCollectionSelect(coll.name)}
                                  >
                                    {coll.name}
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          )}
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
                <SidebarSeparator />
                <SidebarGroup>
                  <SidebarGroupLabel>System</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          isActive={selectedView === "server-status"}
                          onClick={() => setSelectedView("server-status")}
                        >
                          <Server className="h-4 w-4" />
                          <span>Server Status</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          isActive={selectedView === "dashboard"}
                          onClick={() => setSelectedView("dashboard")}
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          <span>Dashboard</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </>
            )}
          </SidebarContent>
          <SidebarFooter className="border-t p-4">
            <div className="text-xs text-muted-foreground">
              {activeConnection ? `Connected to ${activeConnection.name}` : "Not connected"}
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Enhanced Glassmorphism Header with fixed height */}
          <header className="sticky top-0 z-10 glassmorphism-header shadow-lg">
            {/* Top row with main controls - fixed height */}
            <div className="h-14 flex items-center gap-4 px-4 lg:px-6">
              <SidebarTrigger className="glassmorphism-button" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="glassmorphism-badge bg-primary/10 dark:bg-primary/20 rounded-md px-2 py-1 text-xs font-medium text-primary/70 dark:text-primary/80 font-f1 uppercase tracking-wider">
                    MongoDB
                  </span>
                  {activeConnection && (
                    <span className="hidden sm:inline-flex glassmorphism-badge bg-background/50 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground font-f1 uppercase tracking-wider">
                      {activeConnection.name}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                {activeConnection ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="glassmorphism-button border-border/50 bg-background/50">
                        <div className="flex items-center gap-2">
                          {activeConnection.status === 'connected' && (
                            <div className="h-2 w-2 rounded-full bg-green-500 glow-effect-green" />
                          )}
                          {activeConnection.status === 'connecting' && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          )}
                          {activeConnection.status === 'error' && (
                            <div className="h-2 w-2 rounded-full bg-red-500 glow-effect-red" />
                          )}
                          {activeConnection.name}
                          <ChevronDown className="h-4 w-4" />
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <MongoDBConnectDialog mode="edit" existingConnection={activeConnection}>
                          <div className="flex items-center gap-2">
                            <Pencil className="h-4 w-4" />
                            <span>Edit Connection</span>
                          </div>
                        </MongoDBConnectDialog>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={() => {
                          removeConnection(activeConnection.id)
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Trash2 className="h-4 w-4" />
                          <span>Delete Connection</span>
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <MongoDBConnectDialog onConnect={handleConnect}>
                    <Button
                      size="sm"
                      className="glassmorphism-primary-button shadow-md bg-gradient-to-r from-primary to-primary/90"
                    >
                      Connect
                    </Button>
                  </MongoDBConnectDialog>
                )}
                {activeConnection && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Implement disconnect logic
                    }}
                    className="glassmorphism-button border-border/50 bg-background/50"
                  >
                    Disconnect
                  </Button>
                )}
              </div>
            </div>

            {/* Bottom row with fixed height for title/breadcrumb */}
            <div className="h-10 flex items-center px-6 pb-2">
              <div className="w-full overflow-hidden">
                {getPathSegments().length === 1 ? (
                  // Single title for simple paths
                  <h1 className="text-base font-f1 font-bold truncate">{getPathSegments()[0].label}</h1>
                ) : (
                  // Responsive breadcrumb for complex paths
                  <div className="flex items-center gap-1 w-full overflow-hidden">
                    {getPathSegments().map((segment, index, array) => (
                      <div key={index} className="flex items-center min-w-0">
                        {index > 0 && <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground flex-shrink-0" />}
                        <div
                          className={`
                            font-f1 font-bold truncate
                            ${
                              index === array.length - 1
                                ? "text-foreground"
                                : "text-muted-foreground hover:text-foreground cursor-pointer"
                            }
                            ${segment.type === "database" ? "text-blue-600 dark:text-blue-400" : ""}
                            ${segment.type === "collection" ? "text-amber-600 dark:text-amber-400" : ""}
                            ${index === 0 ? "max-w-[120px] sm:max-w-[200px]" : "max-w-[100px] sm:max-w-[150px] md:max-w-[200px]"}
                          `}
                          onClick={() => {
                            if (segment.type === "database" && index !== array.length - 1) {
                              setSelectedCollection(null)
                            } else if (segment.type === "home") {
                              setSelectedDatabase(null)
                              setSelectedCollection(null)
                              setSelectedView(null)
                            }
                          }}
                        >
                          {segment.label}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6 bg-gradient-to-b from-background to-background/95">
            {!activeConnection ? (
              <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] space-y-4">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-semibold">Welcome to MongoDB Dashboard</h2>
                  <p className="text-muted-foreground">Connect to your MongoDB instance to get started</p>
                </div>
                <MongoDBConnectDialog onConnect={handleConnect}>
                  <Button size="lg">Connect to MongoDB</Button>
                </MongoDBConnectDialog>
              </div>
            ) : activeConnection.status === 'error' ? (
              <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] space-y-4">
                <div className="text-center space-y-2">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold text-red-500">Connection Error</h2>
                  <p className="text-muted-foreground">{activeConnection.error || 'Failed to connect to MongoDB'}</p>
                </div>
                <div className="flex gap-2">
                  <MongoDBConnectDialog mode="edit" existingConnection={activeConnection}>
                    <Button variant="outline">Edit Connection</Button>
                  </MongoDBConnectDialog>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      removeConnection(activeConnection.id)
                    }}
                  >
                    Remove Connection
                  </Button>
                </div>
              </div>
            ) : activeConnection.status === 'connecting' ? (
              <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] space-y-4">
                <div className="text-center space-y-2">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold">Connecting to MongoDB</h2>
                  <p className="text-muted-foreground">Please wait while we establish the connection...</p>
                </div>
              </div>
            ) : (
              <div>
                {selectedView === "server-status" ? (
                  <ServerStatusView />
                ) : selectedView === "dashboard" ? (
                  <DashboardViewEnhanced />
                ) : !selectedDatabase ? (
                  <>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <Card className="glassmorphism-card">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <CardTitle className="text-sm font-medium">Databases</CardTitle>
                          <Database className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{databases.length}</div>
                          <p className="text-xs text-muted-foreground">{databases.reduce((total, db) => total + (db.collections?.length || 0), 0)} collections total</p>
                        </CardContent>
                      </Card>

                      <Card className="glassmorphism-card">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
                          <Server className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{activeConnection.activeConnections}</div>
                          <p className="text-xs text-muted-foreground">{activeConnection.operationsPerSecond} ops/sec</p>
                        </CardContent>
                      </Card>

                      <Card className="glassmorphism-card">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                          <Database className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{formatBytes(activeConnection.storageUsed)}</div>
                          <div className="mt-2">
                            <Progress
                              value={(activeConnection.storageUsed / activeConnection.storageLimit) * 100}
                              className="glassmorphism-progress"
                            />
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {((activeConnection.storageUsed / activeConnection.storageLimit) * 100).toFixed(1)}% of{" "}
                            {formatBytes(activeConnection.storageLimit)} limit
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="glassmorphism-card">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                          <Server className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{activeConnection.avgResponseTime} ms</div>
                          <p className="text-xs text-muted-foreground">Average query response time</p>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="mt-6">
                      <Card className="glassmorphism-card">
                        <CardHeader>
                          <CardTitle>Databases</CardTitle>
                          <CardDescription>Overview of all MongoDB databases</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Table className="responsive-table">
                            <TableHeader>
                              <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Collections</TableHead>
                                <TableHead className="hidden md:table-cell">Size</TableHead>
                                <TableHead className="hidden md:table-cell">Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {databases.map((db) => (
                                <TableRow key={db.name} className="hover:bg-background/40">
                                  <TableCell className="font-medium">{db.name}</TableCell>
                                  <TableCell>{db.collections?.length || 0}</TableCell>
                                  <TableCell className="hidden md:table-cell">{formatBytes(db.sizeOnDisk)}</TableCell>
                                  <TableCell className="hidden md:table-cell">
                                    <Badge
                                      variant="outline"
                                      className="glassmorphism-badge bg-green-50/80 text-green-700 hover:bg-green-50/90 hover:text-green-700"
                                    >
                                      {db.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDatabaseSelect(db.name)}
                                      className="glassmorphism-button"
                                    >
                                      View
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    </div>
                  </>
                ) : selectedCollection ? (
                  // Collection view
                  <div>
                    {currentCollection && (
                      <div>
                        <div className="mb-6 flex items-center justify-between">
                          <div>
                            <h2 className="text-2xl font-bold font-f1">{currentCollection.name}</h2>
                            <p className="text-sm text-muted-foreground">Collection in {selectedDatabase}</p>
                          </div>
                          <Button className="glassmorphism-primary-button">Query Collection</Button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                          <Card className="glassmorphism-card">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium">Documents</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold">{formatNumber(currentCollection.documents)}</div>
                            </CardContent>
                          </Card>

                          <Card className="glassmorphism-card">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium">Size</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold">{formatBytes(currentCollection.size)}</div>
                            </CardContent>
                          </Card>

                          <Card className="glassmorphism-card">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium">Indexes</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold">{currentCollection.indexes}</div>
                            </CardContent>
                          </Card>
                        </div>

                        <div className="mt-6">
                          <Tabs defaultValue="documents" className="glassmorphism-tabs">
                            <TabsList className="glassmorphism-tabslist">
                              <TabsTrigger value="documents">Documents</TabsTrigger>
                              <TabsTrigger value="indexes">Indexes</TabsTrigger>
                              <TabsTrigger value="schema">Schema</TabsTrigger>
                            </TabsList>
                            <TabsContent value="documents" className="mt-4">
                              <Card className="glassmorphism-card">
                                <CardHeader className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                                  <CardTitle>Documents</CardTitle>
                                  <div className="flex w-full flex-col space-y-2 sm:w-auto sm:flex-row sm:space-x-2 sm:space-y-0">
                                    <Input
                                      placeholder="Search documents..."
                                      className="w-full sm:w-[250px] glassmorphism-input"
                                    />
                                    <Button variant="outline" size="sm" className="glassmorphism-button">
                                      Filter
                                    </Button>
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  <div className="rounded-md border glassmorphism-code-block overflow-x-auto">
                                    <div className="p-4">
                                      <pre className="text-xs whitespace-pre-wrap sm:whitespace-pre overflow-x-auto">{`{ "_id": "507f1f77bcf86cd799439011", "name": "John Doe", "email": "john@example.com", "created_at": "2023-01-15T12:00:00Z" }`}</pre>
                                    </div>
                                    <div className="border-t p-4">
                                      <pre className="text-xs whitespace-pre-wrap sm:whitespace-pre overflow-x-auto">{`{ "_id": "507f1f77bcf86cd799439012", "name": "Jane Smith", "email": "jane@example.com", "created_at": "2023-02-20T14:30:00Z" }`}</pre>
                                    </div>
                                    <div className="border-t p-4">
                                      <pre className="text-xs whitespace-pre-wrap sm:whitespace-pre overflow-x-auto">{`{ "_id": "507f1f77bcf86cd799439013", "name": "Robert Johnson", "email": "robert@example.com", "created_at": "2023-03-05T09:15:00Z" }`}</pre>
                                    </div>
                                  </div>
                                  <div className="mt-4 flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                                    <div className="text-sm text-muted-foreground">
                                      Showing 3 of {formatNumber(currentCollection.documents)} documents
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button variant="outline" size="sm" disabled className="glassmorphism-button">
                                        Previous
                                      </Button>
                                      <Button variant="outline" size="sm" className="glassmorphism-button">
                                        Next
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </TabsContent>
                            <TabsContent value="indexes">
                              <Card className="glassmorphism-card">
                                <CardHeader>
                                  <CardTitle>Indexes</CardTitle>
                                  <CardDescription>Collection indexes for {currentCollection.name}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                  <Table className="responsive-table">
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Fields</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead className="hidden md:table-cell">Size</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      <TableRow className="hover:bg-background/40">
                                        <TableCell className="font-medium">_id_</TableCell>
                                        <TableCell>_id</TableCell>
                                        <TableCell>Default</TableCell>
                                        <TableCell className="hidden md:table-cell">{formatBytes(currentCollection.indexesSize)}</TableCell>
                                      </TableRow>
                                      <TableRow className="hover:bg-background/40">
                                        <TableCell className="font-medium">name_1</TableCell>
                                        <TableCell>name</TableCell>
                                        <TableCell>Single field</TableCell>
                                        <TableCell className="hidden md:table-cell">{formatBytes(currentCollection.nameIndexesSize)}</TableCell>
                                      </TableRow>
                                      <TableRow className="hover:bg-background/40">
                                        <TableCell className="font-medium">created_at_-1</TableCell>
                                        <TableCell>created_at</TableCell>
                                        <TableCell>Single field</TableCell>
                                        <TableCell className="hidden md:table-cell">{formatBytes(currentCollection.createdAtIndexesSize)}</TableCell>
                                      </TableRow>
                                    </TableBody>
                                  </Table>
                                </CardContent>
                              </Card>
                            </TabsContent>
                            <TabsContent value="schema">
                              <Card className="glassmorphism-card">
                                <CardHeader>
                                  <CardTitle>Schema Analysis</CardTitle>
                                  <CardDescription>Inferred schema from document sampling</CardDescription>
                                </CardHeader>
                                <CardContent>
                                  <div className="rounded-md border p-4 glassmorphism-code-block">
                                    <pre className="text-xs whitespace-pre-wrap">{`{
  "_id": { "bsonType": "objectId" },
  "name": { "bsonType": "string" },
  "email": { "bsonType": "string" },
  "created_at": { "bsonType": "date" },
  "profile": {
    "bsonType": "object",
    "properties": {
      "address": { "bsonType": "string" },
      "phone": { "bsonType": "string" }
    }
  },
  "tags": { "bsonType": "array" }
}`}</pre>
                                  </div>
                                </CardContent>
                              </Card>
                            </TabsContent>
                          </Tabs>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Database view
                  <div>
                    {currentDatabase && (
                      <div>
                        <div className="mb-6 flex items-center justify-between">
                          <div>
                            <h2 className="text-2xl font-bold font-f1">{currentDatabase.name}</h2>
                            <p className="text-sm text-muted-foreground">
                              {currentDatabase.collections?.length || 0} collections • {formatBytes(currentDatabase.sizeOnDisk)} total
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" className="glassmorphism-button">
                              Export
                            </Button>
                            <Button className="glassmorphism-primary-button">Create Collection</Button>
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                          <Card className="glassmorphism-card">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium">Collections</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold">{currentDatabase.collections?.length || 0}</div>
                            </CardContent>
                          </Card>

                          <Card className="glassmorphism-card">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium">Size</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold">{formatBytes(currentDatabase.sizeOnDisk)}</div>
                            </CardContent>
                          </Card>

                          <Card className="glassmorphism-card">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium">Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-green-500 glow-effect-green"></div>
                                <span className="text-sm font-medium">{currentDatabase.status}</span>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        <div className="mt-6">
                          <Card className="glassmorphism-card">
                            <CardHeader>
                              <CardTitle>Collections</CardTitle>
                              <CardDescription>All collections in {currentDatabase.name}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <Table className="responsive-table">
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Documents</TableHead>
                                    <TableHead className="hidden md:table-cell">Size</TableHead>
                                    <TableHead className="hidden md:table-cell">Indexes</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {currentDatabase.collections?.map((collection) => (
                                    <TableRow key={collection.name} className="hover:bg-background/40">
                                      <TableCell className="font-medium">{collection.name}</TableCell>
                                      <TableCell>{formatNumber(collection.documents)}</TableCell>
                                      <TableCell className="hidden md:table-cell">{formatBytes(collection.size)}</TableCell>
                                      <TableCell className="hidden md:table-cell">{collection.indexes}</TableCell>
                                      <TableCell className="text-right">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleCollectionSelect(collection.name)}
                                          className="glassmorphism-button"
                                        >
                                          View
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

