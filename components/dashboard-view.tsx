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
import { useMongoDBStore, formatBytes, formatNumber, type MongoDBDatabase, type MongoDBCollection, type MongoDBConnection, type ConnectionStatus } from "@/lib/mongodb"
import React from "react"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useRouter, usePathname, useSearchParams } from "next/navigation"

interface SavedConnection {
  id: string
  name: string
  uri: string
  status: 'connected' | 'connecting' | 'disconnected' | 'error'
  lastConnected?: string
  params?: Record<string, any>
  isActive: boolean
}

// Add a helper function to render connection status indicator
const ConnectionStatusIndicator = ({ status }: { status: SavedConnection['status'] }) => {
  switch (status) {
    case 'connected':
      return <div className="h-2 w-2 rounded-full bg-[#00ED64] opacity-80" />
    case 'connecting':
      return <Loader2 className="h-4 w-4 animate-spin text-[#00ED64]" />
    case 'error':
      return <div className="h-2 w-2 rounded-full bg-red-500/80" />
    case 'disconnected':
      return <div className="h-2 w-2 rounded-full bg-gray-500" />
    default:
      return null
  }
}

export default function DashboardView() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const [mounted, setMounted] = React.useState(false)
  const [selectedDatabase, setSelectedDatabase] = useState<string | null>(null)
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null)
  const [selectedView, setSelectedView] = useState<"dashboard" | "server-status" | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [documentSearchQuery, setDocumentSearchQuery] = useState("")
  const [documents, setDocuments] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalDocuments, setTotalDocuments] = useState(0)
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false)
  const [connectionToDelete, setConnectionToDelete] = useState<string | null>(null)
  const { activeConnection, connections, databases, setDatabases, updateCollections, removeConnection, setActiveConnection, updateConnectionStatus } = useMongoDBStore()
  const [collectionInfo, setCollectionInfo] = useState<{ indexes: any[]; schema: any } | null>(null)
  const [expandedDocuments, setExpandedDocuments] = useState<Set<string>>(new Set(['0'])) // First document expanded by default

  // Parse URL parameters on initial load and route changes
  useEffect(() => {
    if (!mounted) return
    
    const db = searchParams.get('db')
    const collection = searchParams.get('collection')
    const view = searchParams.get('view')
    
    if (view === 'server-status') {
      setSelectedView('server-status')
      setSelectedDatabase(null)
      setSelectedCollection(null)
    } else if (view === 'dashboard') {
      setSelectedView('dashboard')
      setSelectedDatabase(null)
      setSelectedCollection(null)
    } else if (db) {
      setSelectedDatabase(db)
      setSelectedView(null)
      
      if (collection) {
        setSelectedCollection(collection)
      }
    }
  }, [searchParams, mounted])

  // Handle hydration
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setSelectedDatabase(null)
      setSelectedCollection(null)
      setSelectedView(null)
      setSearchQuery("")
      setDocumentSearchQuery("")
      setDocuments([])
      setPage(1)
      setPageSize(10)
      setTotalDocuments(0)
      setIsLoadingDocuments(false)
    }
  }, [])

  // Reset selections when connection changes
  useEffect(() => {
    if (!activeConnection) {
      setSelectedDatabase(null)
      setSelectedCollection(null)
      setSelectedView(null)
      setDatabases([])
    }
  }, [activeConnection, setDatabases])

  // Fetch databases when connection changes or reconnects
  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      if (!activeConnection || !mounted) return

      if (activeConnection.status === 'connected') {
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
          if (data.success && isMounted) {
            setDatabases(data.databases)
          } else {
            throw new Error(data.message || 'Failed to fetch databases')
          }
        } catch (error) {
          console.error('Failed to fetch databases:', error)
          if (isMounted) {
            updateConnectionStatus(activeConnection.id, 'error', 'Failed to fetch databases')
          }
        }
      } else if (activeConnection.status === 'error') {
        // Clear databases on error
        setDatabases([])
      }
    }

    fetchData()
    return () => {
      isMounted = false
    }
  }, [activeConnection?.id, activeConnection?.status, activeConnection?.uri, mounted])

  // Update URL when selections change
  useEffect(() => {
    if (!mounted) return
    
    // Build the new URL based on selections
    let url = '/dashboard'
    const params = new URLSearchParams()
    
    if (selectedView === 'server-status') {
      params.set('view', 'server-status')
    } else if (selectedView === 'dashboard') {
      params.set('view', 'dashboard')
    } else if (selectedDatabase) {
      params.set('db', selectedDatabase)
      
      if (selectedCollection) {
        params.set('collection', selectedCollection)
      }
    }
    
    const queryString = params.toString()
    if (queryString) {
      url += `?${queryString}`
    }
    
    // Replace the current URL without forcing a navigation
    router.replace(url, { scroll: false })
  }, [selectedDatabase, selectedCollection, selectedView, mounted, router])

  // Fetch collections when database is selected
  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      if (!activeConnection || !selectedDatabase || activeConnection.status !== 'connected') return

      try {
        const response = await fetch(
          `/api/mongodb/databases/${selectedDatabase}/collections?uri=${encodeURIComponent(activeConnection.uri)}`
        )

        const data = await response.json()
        if (data.success && isMounted) {
          updateCollections(selectedDatabase, data.collections)
        }
      } catch (error) {
        console.error('Failed to fetch collections:', error)
      }
    }

    fetchData()
    return () => {
      isMounted = false
    }
  }, [activeConnection?.id, selectedDatabase, activeConnection?.status])

  // Fetch documents when collection is selected or search/pagination changes
  useEffect(() => {
    let isMounted = true

    const fetchDocuments = async () => {
      if (!activeConnection || !selectedDatabase || !selectedCollection || activeConnection.status !== 'connected') return

      setIsLoadingDocuments(true)
      try {
        const response = await fetch(
          `/api/mongodb/databases/${selectedDatabase}/collections/${selectedCollection}/documents?` + new URLSearchParams({
            uri: activeConnection.uri,
            search: documentSearchQuery,
            page: page.toString(),
            pageSize: pageSize.toString()
          })
        )

        const data = await response.json()
        if (data.success && isMounted) {
          setDocuments(data.documents)
          setTotalDocuments(data.total)
        }
      } catch (error) {
        console.error('Failed to fetch documents:', error)
      } finally {
        if (isMounted) {
          setIsLoadingDocuments(false)
        }
      }
    }

    fetchDocuments()
    return () => {
      isMounted = false
    }
  }, [activeConnection?.id, selectedDatabase, selectedCollection, documentSearchQuery, page, pageSize])

  const totalPages = Math.ceil(totalDocuments / pageSize)

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
  const filteredDatabases = React.useMemo(() =>
    databases.filter(db =>
      db.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [databases, searchQuery]
  )

  // Get the current database and collection
  const currentDatabase = React.useMemo(() =>
    databases.find(db => db.name === selectedDatabase),
    [databases, selectedDatabase]
  )

  const currentCollection = React.useMemo(() =>
    currentDatabase?.collections?.find(coll => coll.name === selectedCollection),
    [currentDatabase, selectedCollection]
  )

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

  // Add disconnect handler
  const handleDisconnect = () => {
    if (activeConnection) {
      updateConnectionStatus(activeConnection.id, 'disconnected')
      setActiveConnection(null)
      setDatabases([])
      setSelectedDatabase(null)
      setSelectedCollection(null)
      setSelectedView(null)
      // Navigate back to the base dashboard
      router.push('/dashboard')
    }
  }

  const handleHomeClick = () => {
    setSelectedDatabase(null)
    setSelectedCollection(null)
    setSelectedView(null)
    setSearchQuery("")
    // Navigate to the base dashboard URL
    router.push('/dashboard')
  }

  const toggleDocument = (index: string) => {
    setExpandedDocuments(prev => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  if (!mounted) {
    return null
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <Sidebar>
          <SidebarHeader className="border-b">
            <button
              onClick={handleHomeClick}
              className="flex items-center gap-2 px-4 py-2 w-full hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <Database className="h-4 w-4 text-[#00ED64]" />
                <span className="font-medium text-sm">MongoDB MGR</span>
            </div>
              <div className="ml-auto text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                Return home
              </div>
            </button>
          </SidebarHeader>
          <SidebarContent>
            {!activeConnection ? (
              <div className="flex flex-col items-center justify-center p-4 space-y-4">
                <div className="relative w-24 h-24">
                  {/* Animated rings */}
                  <div className="absolute inset-0 animate-ping-slow rounded-full bg-primary/10" />
                  <div className="absolute inset-2 animate-ping-slower rounded-full bg-primary/20" />
                  <div className="absolute inset-4 animate-ping-slowest rounded-full bg-primary/30" />
                  {/* Center MongoDB logo */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-12 h-12 bg-background rounded-full shadow-lg flex items-center justify-center">
                      <Database className="w-6 h-6 text-primary animate-pulse" />
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Not connected</p>
                  <MongoDBConnectDialog onConnect={handleConnect}>
                    <Button variant="outline" size="sm" className="mt-2 w-full">
                      Connect
                    </Button>
                  </MongoDBConnectDialog>
                </div>
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
          <SidebarFooter className="border-t">
            <div className="p-4 space-y-3">
              {activeConnection ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ConnectionStatusIndicator status={activeConnection.status} />
                    <span className="text-sm font-medium truncate">
                      {activeConnection.name}
                    </span>
                  </div>
                  <div className="text-xs space-y-1 text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Server className="h-3 w-3" />
                      <span className="truncate">{activeConnection.uri.split('@')[1]?.split('/')[0] || 'Local Server'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Database className="h-3 w-3" />
                      <span>{databases.length} databases</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#00ED64]/70">
                      <div className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                      <span>Connected</span>
                      <span className="text-muted-foreground/50 text-[10px] ml-auto">
                        {activeConnection.lastConnected ? new Date(activeConnection.lastConnected).toLocaleTimeString() : ''}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-gray-500" />
                  <span className="text-sm">Not connected</span>
                </div>
              )}
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
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="glassmorphism-button border-border/50 bg-background/50">
                        <div className="flex items-center gap-2">
                          <ConnectionStatusIndicator status={activeConnection.status} />
                          {activeConnection?.name}
                          <ChevronDown className="h-4 w-4" />
                        </div>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] bg-background/95 backdrop-blur-sm border-none shadow-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                          <Database className="h-5 w-5 text-[#00ED64]" />
                          {activeConnection.name}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">
                          Manage your MongoDB connection
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <button
                          onClick={() => handleDisconnect()}
                          className="group relative overflow-hidden rounded-lg p-6 glassmorphism-card hover:shadow-lg transition-all duration-300"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-[#00ED64]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="relative flex items-center gap-4">
                            <div className="p-3 rounded-full bg-[#00ED64]/10">
                              <Database className="h-6 w-6 text-[#00ED64]" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">Disconnect</h3>
                              <p className="text-sm text-muted-foreground">Close the current connection</p>
                            </div>
                          </div>
                        </button>

                        <MongoDBConnectDialog mode="edit" existingConnection={activeConnection}>
                          <button
                            className="group relative overflow-hidden rounded-lg p-6 glassmorphism-card hover:shadow-lg transition-all duration-300"
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative flex items-center gap-4">
                              <div className="p-3 rounded-full bg-blue-500/10">
                                <Pencil className="h-6 w-6 text-blue-500" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg">Edit Connection</h3>
                                <p className="text-sm text-muted-foreground">Modify connection settings</p>
                              </div>
                            </div>
                          </button>
                        </MongoDBConnectDialog>

                        <button
                          onClick={() => setConnectionToDelete(activeConnection.id)}
                          className="group relative overflow-hidden rounded-lg p-6 glassmorphism-card hover:shadow-lg transition-all duration-300"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="relative flex items-center gap-4">
                            <div className="p-3 rounded-full bg-red-500/10">
                              <Trash2 className="h-6 w-6 text-red-500" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">Delete Connection</h3>
                              <p className="text-sm text-muted-foreground">Remove this connection</p>
                            </div>
                          </div>
                        </button>
                      </div>
                    </DialogContent>
                  </Dialog>
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
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-4 md:p-6 bg-gradient-to-b from-background to-background/95">
            {!activeConnection ? (
              <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] space-y-8">
                <div className="relative w-32 h-32 mb-4">
                  {/* Animated rings */}
                  <div className="absolute inset-0 animate-ping-slow rounded-full bg-[#00ED64]/10" />
                  <div className="absolute inset-2 animate-ping-slower rounded-full bg-[#00ED64]/20" />
                  <div className="absolute inset-4 animate-ping-slowest rounded-full bg-[#00ED64]/30" />
                  {/* Center MongoDB logo */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-16 h-16 bg-background rounded-full shadow-lg flex items-center justify-center">
                      <Database className="w-8 h-8 text-[#00ED64]" />
                    </div>
                  </div>
                </div>
                <div className="text-center space-y-4 max-w-md mx-auto">
                  <h2 className="text-3xl font-bold text-[#00ED64]">
                    Welcome to MongoDB MGR
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    Connect to your MongoDB instance to explore and manage your databases with ease
                  </p>
                </div>
                <div className="flex flex-col items-center gap-6 w-full max-w-md">
                  <MongoDBConnectDialog onConnect={handleConnect}>
                    <Button size="lg" className="w-full px-8 py-6 text-lg bg-[#00ED64] hover:bg-[#00ED64]/90 text-black font-medium">
                      <Plus className="mr-2 h-5 w-5" />
                      <span className="relative">New Connection</span>
                    </Button>
                  </MongoDBConnectDialog>

                  {connections.length > 0 && (
                    <div className="w-full space-y-4">
                      <div className="text-sm font-medium text-muted-foreground text-center">Recent Connections</div>
                      <div className="grid gap-2">
                        {connections.map((conn) => (
                          <ContextMenu key={conn.id}>
                            <ContextMenuTrigger>
                              <Button
                                variant="outline"
                                className="w-full flex items-center justify-between py-4 px-4 hover:border-[#00ED64]/50 group relative"
                                onClick={() => setActiveConnection(conn.id)}
                              >
                                <div className="flex items-center gap-3">
                                  <Database className="h-4 w-4 text-[#00ED64]" />
                                  <div className="text-left">
                                    <div className="font-medium">{conn.name}</div>
                                    <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                      {conn.lastConnected ? `Last connected: ${new Date(conn.lastConnected).toLocaleString()}` : 'Never connected'}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                    Right-click for more options
                                  </span>
                                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                </div>
                              </Button>
                            </ContextMenuTrigger>
                            <ContextMenuContent>
                              <ContextMenuItem onClick={() => setActiveConnection(conn.id)}>
                                <Database className="h-4 w-4 mr-2" />
                                Connect
                              </ContextMenuItem>
                              <ContextMenuItem onSelect={(e) => e.preventDefault()}>
                                <MongoDBConnectDialog mode="edit" existingConnection={conn}>
                                  <div className="flex items-center">
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Edit Connection
                                  </div>
                                </MongoDBConnectDialog>
                              </ContextMenuItem>
                              <ContextMenuSeparator />
                              <ContextMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={() => setConnectionToDelete(conn.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Connection
                              </ContextMenuItem>
                            </ContextMenuContent>
                          </ContextMenu>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Delete confirmation dialog */}
                  <AlertDialog open={!!connectionToDelete} onOpenChange={(open) => !open && setConnectionToDelete(null)}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Connection</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete the connection "
                          {connections.find(c => c.id === connectionToDelete)?.name}"? 
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setConnectionToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700 text-white"
                          onClick={() => {
                            if (connectionToDelete) {
                              removeConnection(connectionToDelete)
                              setConnectionToDelete(null)
                            }
                          }}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <p className="text-sm text-muted-foreground text-center">
                    Your connection details are securely stored locally
                  </p>
                </div>
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
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card className="glassmorphism-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Databases</CardTitle>
                      <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                          <div className="text-2xl font-bold">{databases.length}</div>
                          <p className="text-xs text-muted-foreground">
                            {databases.reduce((total, db) => total + (db.collections?.length || 0), 0)} collections total
                          </p>
                    </CardContent>
                  </Card>

                  <Card className="glassmorphism-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <CardTitle className="text-sm font-medium">Total Size</CardTitle>
                      <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                          <div className="text-2xl font-bold">
                            {formatBytes(databases.reduce((total, db) => total + db.sizeOnDisk, 0))}
                      </div>
                          <p className="text-xs text-muted-foreground">Combined database size</p>
                    </CardContent>
                  </Card>

                  <Card className="glassmorphism-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <CardTitle className="text-sm font-medium">Connection Status</CardTitle>
                      <Server className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                          <div className="flex items-center gap-2">
                            <ConnectionStatusIndicator status={activeConnection.status} />
                            <span className="text-sm font-medium capitalize">{activeConnection.status}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Last connected: {activeConnection.lastConnected ? new Date(activeConnection.lastConnected).toLocaleString() : 'Never'}
                          </p>
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
                                      className="bg-[#00ED64]/5 text-[#00ED64] border-[#00ED64]/20 hover:bg-[#00ED64]/10"
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
                          <Button className="bg-[#00ED64] hover:bg-[#00ED64]/90 text-black font-medium">Query Collection</Button>
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
                                      value={documentSearchQuery}
                                      onChange={(e) => setDocumentSearchQuery(e.target.value)}
                                  />
                                  <Button variant="outline" size="sm" className="glassmorphism-button">
                                    Filter
                                  </Button>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <div className="rounded-md border glassmorphism-code-block overflow-x-auto">
                                    {isLoadingDocuments ? (
                                      <div className="flex items-center justify-center p-8">
                                        <Loader2 className="h-8 w-8 animate-spin" />
                                  </div>
                                    ) : documents.length === 0 ? (
                                      <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
                                        <Database className="h-12 w-12 mb-4 opacity-50" />
                                        <p>No documents found</p>
                                        {documentSearchQuery && (
                                          <p className="text-sm mt-2">Try adjusting your search query</p>
                                        )}
                                  </div>
                                    ) : (
                                      documents.map((doc, index) => (
                                        <div key={doc._id} className={index > 0 ? "border-t" : ""}>
                                          <div 
                                            className="p-4 flex items-center gap-2 cursor-pointer hover:bg-muted/50"
                                            onClick={() => toggleDocument(index.toString())}
                                          >
                                            <ChevronRight 
                                              className={`h-4 w-4 transition-transform ${
                                                expandedDocuments.has(index.toString()) ? 'rotate-90' : ''
                                              }`}
                                            />
                                            <span className="font-mono text-xs">
                                              {doc._id}
                                            </span>
                                  </div>
                                          {expandedDocuments.has(index.toString()) && (
                                            <div className="px-4 pb-4">
                                              <pre className="text-xs whitespace-pre-wrap sm:whitespace-pre overflow-x-auto">
                                                {JSON.stringify(doc, null, 2)}
                                              </pre>
                                </div>
                                          )}
                                        </div>
                                      ))
                                    )}
                                  </div>
                                  <div className="mt-4 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                  <div className="text-sm text-muted-foreground">
                                        Showing {documents.length} of {formatNumber(totalDocuments)} documents
                                  </div>
                                  <div className="flex items-center gap-2">
                                        <select
                                          className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                                          value={pageSize}
                                          onChange={(e) => {
                                            setPageSize(Number(e.target.value))
                                            setPage(1)
                                          }}
                                        >
                                          <option value="5">5 per page</option>
                                          <option value="10">10 per page</option>
                                          <option value="20">20 per page</option>
                                          <option value="50">50 per page</option>
                                          <option value="100">100 per page</option>
                                        </select>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={page === 1}
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        className="glassmorphism-button"
                                      >
                                      Previous
                                    </Button>
                                      <span className="text-sm text-muted-foreground">
                                        Page {page} of {totalPages}
                                      </span>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={page >= totalPages}
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        className="glassmorphism-button"
                                      >
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
                                      {collectionInfo?.indexes.map((index) => (
                                        <TableRow key={index.name} className="hover:bg-background/40">
                                          <TableCell className="font-medium">{index.name}</TableCell>
                                          <TableCell>{Object.entries(index.key).map(([field, dir]) => `${field}:${dir}`).join(', ')}</TableCell>
                                          <TableCell>{index.unique ? 'Unique' : 'Standard'}</TableCell>
                                          <TableCell className="hidden md:table-cell">{formatBytes(index.size || 0)}</TableCell>
                                    </TableRow>
                                      ))}
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
                                    <pre className="text-xs whitespace-pre-wrap">
                                      {JSON.stringify(collectionInfo?.schema || {}, null, 2)}
                                    </pre>
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
                            <Button className="bg-[#00ED64] hover:bg-[#00ED64]/90 text-black font-medium">Create Collection</Button>
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
                                <div className="h-2 w-2 rounded-full bg-[#00ED64] opacity-80"></div>
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

