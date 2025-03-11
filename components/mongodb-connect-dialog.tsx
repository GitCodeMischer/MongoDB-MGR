import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { 
  Database, 
  Server, 
  Globe, 
  Container, 
  User, 
  Key, 
  Shield, 
  Lock,
  RefreshCw,
  Link as LinkIcon,
  Loader2,
  AlertCircle,
  Pencil,
  Trash2
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useMongoDBStore, type MongoDBConnection } from "@/lib/mongodb"
import { generateUUID } from '@/utils/uuid'

interface MongoDBConnectDialogProps {
  children: React.ReactNode
  onConnect?: (connection: MongoDBConnection) => void
  mode?: 'create' | 'edit'
  existingConnection?: MongoDBConnection
}

interface ConnectionParams {
  host: string
  port: string
  username: string
  password: string
  database: string
  authSource: string
  ssl: boolean
}

const DEFAULT_PARAMS: ConnectionParams = {
  host: "localhost",
  port: "27017",
  username: "",
  password: "",
  database: "",
  authSource: "admin",
  ssl: false,
}

const CONNECTION_PRESETS = {
  local: {
    name: "Local MongoDB",
    connectionString: "mongodb://localhost:27017",
    params: {
      ...DEFAULT_PARAMS,
    },
  },
  atlas: {
    name: "MongoDB Atlas",
    connectionString: "mongodb+srv://username:password@cluster.mongodb.net/database",
    params: {
      ...DEFAULT_PARAMS,
      host: "cluster.mongodb.net",
      port: "",
      ssl: true,
    },
  },
  docker: {
    name: "Docker Container",
    connectionString: "mongodb://localhost:27017",
    params: {
      ...DEFAULT_PARAMS,
    },
  },
}

export function MongoDBConnectDialog({ 
  children, 
  onConnect, 
  mode = 'create',
  existingConnection 
}: MongoDBConnectDialogProps) {
  const [mounted, setMounted] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [connectionName, setConnectionName] = React.useState("")
  const [connectionString, setConnectionString] = React.useState("")
  const [connectionParams, setConnectionParams] = React.useState<ConnectionParams>(DEFAULT_PARAMS)
  const [selectedPreset, setSelectedPreset] = React.useState<string>("")
  const { addConnection, editConnection, updateConnectionStatus } = useMongoDBStore()

  const resetForm = React.useCallback(() => {
    setConnectionName("")
    setConnectionString("")
    setConnectionParams(DEFAULT_PARAMS)
    setSelectedPreset("")
    setError(null)
    setIsLoading(false)
  }, [])

  // Handle hydration
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Reset form when dialog opens with existing connection
  React.useEffect(() => {
    if (mounted && open && existingConnection) {
      setConnectionName(existingConnection.name)
      setConnectionString(existingConnection.uri)
      setConnectionParams({
        ...DEFAULT_PARAMS,
        ...existingConnection.params,
      })
      setError(null)
    } else if (!open) {
      resetForm()
    }
  }, [open, existingConnection, mounted, resetForm])

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      resetForm()
    }
  }, [resetForm])

  if (!mounted) {
    return null
  }

  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset)
    if (preset in CONNECTION_PRESETS) {
      const presetConfig = CONNECTION_PRESETS[preset as keyof typeof CONNECTION_PRESETS]
      setConnectionString(presetConfig.connectionString)
      setConnectionParams(presetConfig.params)
    }
  }

  const buildConnectionString = () => {
    const {
      username,
      password,
      host,
      port,
      database,
      authSource,
      ssl,
    } = connectionParams

    let str = "mongodb://"

    // Add authentication if username is provided
    if (username) {
      str += `${encodeURIComponent(username)}`
      if (password) {
        str += `:${encodeURIComponent(password)}`
      }
      str += "@"
    }

    // Add host and port
    str += host
    if (port) {
      str += `:${port}`
    }

    // Add database if specified
    if (database) {
      str += `/${database}`
    }

    // Add query parameters
    const params = new URLSearchParams()
    if (authSource) {
      params.append("authSource", authSource)
    }
    if (ssl) {
      params.append("ssl", "true")
    }

    const queryString = params.toString()
    if (queryString) {
      str += `?${queryString}`
    }

    return str
  }

  const handleConnect = async () => {
    if (!connectionName.trim()) {
      setError("Please provide a name for the connection")
      return
    }

    const finalConnectionString = connectionString || buildConnectionString()

    if (!finalConnectionString.startsWith('mongodb://') && !finalConnectionString.startsWith('mongodb+srv://')) {
      setError("Invalid connection string format")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const connectionId = existingConnection?.id || generateUUID()
      
      // Update connection status to connecting
      updateConnectionStatus(connectionId, 'connecting')

      // Test the connection
      const response = await fetch('/api/mongodb/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uri: finalConnectionString,
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to connect to MongoDB')
      }

      const connection: MongoDBConnection = {
        id: connectionId,
        name: connectionName,
        uri: finalConnectionString,
        isActive: true,
        status: 'connected',
        lastConnected: new Date().toISOString(),
        params: {
          host: connectionParams.host,
          port: connectionParams.port,
          database: connectionParams.database,
          ssl: connectionParams.ssl,
        }
      }

      if (mode === 'edit' && existingConnection) {
        editConnection(existingConnection.id, connection)
      } else {
        addConnection(connection)
      }

      if (onConnect) {
        onConnect(connection)
      }

      setOpen(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect to MongoDB'
      setError(errorMessage)
      if (existingConnection) {
        updateConnectionStatus(existingConnection.id, 'error', errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!isLoading) {
        setOpen(newOpen)
      }
    }}>
      <DialogTrigger asChild>
        <div onClick={() => setOpen(true)}>
          {children}
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] dialog-content mongodb-dialog-content">
        <DialogHeader className="mongodb-dialog-header">
          <div className="flex items-center gap-2">
            <Database className={cn(
              "h-6 w-6 text-primary",
              isLoading && "animate-pulse"
            )} />
            <DialogTitle>
              {mode === 'edit' ? 'Edit MongoDB Connection' : 'Connect to MongoDB'}
            </DialogTitle>
          </div>
          <DialogDescription>
            {mode === 'edit' 
              ? 'Edit your MongoDB connection details.'
              : 'Choose a connection method below to connect to your MongoDB database.'
            }
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 py-4 mongodb-input-group">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="connection-name">Connection Name</Label>
            </div>
            <Input
              id="connection-name"
              placeholder="My MongoDB Connection"
              value={connectionName}
              onChange={(e) => setConnectionName(e.target.value)}
              className="glassmorphism-input"
              disabled={isLoading}
            />
          </div>
        </div>

        <Tabs defaultValue="connection-string" className="flex-1">
          <TabsList className="grid w-full grid-cols-2 glassmorphism-tabs">
            <TabsTrigger value="connection-string" className="flex items-center gap-2" disabled={isLoading}>
              <Globe className="h-4 w-4" />
              Connection String
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2" disabled={isLoading}>
              <Server className="h-4 w-4" />
              Advanced
            </TabsTrigger>
          </TabsList>
          <div className="mt-4 relative flex-1">
            <TabsContent value="connection-string" className="space-y-4 mt-0 mongodb-tab-content">
              <div className="grid gap-2">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="connection-string">Connection String</Label>
                </div>
                <Input
                  id="connection-string"
                  placeholder="mongodb://localhost:27017"
                  value={connectionString}
                  onChange={(e) => setConnectionString(e.target.value)}
                  className="glassmorphism-input font-mono text-sm"
                  disabled={isLoading}
                />
              </div>
              {mode === 'create' && (
                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <Label>Quick Connect</Label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {Object.entries(CONNECTION_PRESETS).map(([key, preset]) => (
                      <Button
                        key={key}
                        variant="outline"
                        className={cn(
                          "justify-start gap-2 transition-all mongodb-preset-button",
                          selectedPreset === key && "border-primary bg-primary/5 selected"
                        )}
                        onClick={() => handlePresetChange(key)}
                        disabled={isLoading}
                      >
                        {key === 'local' && <Server className="h-4 w-4" />}
                        {key === 'atlas' && <Globe className="h-4 w-4" />}
                        {key === 'docker' && <Container className="h-4 w-4" />}
                        {preset.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
            <TabsContent value="advanced" className="space-y-4 mt-0 mongodb-tab-content">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="adv-host">Host</Label>
                  </div>
                  <Input
                    id="adv-host"
                    value={connectionParams.host}
                    onChange={(e) =>
                      setConnectionParams({ ...connectionParams, host: e.target.value })
                    }
                    className="glassmorphism-input"
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="adv-port">Port</Label>
                  </div>
                  <Input
                    id="adv-port"
                    value={connectionParams.port}
                    onChange={(e) =>
                      setConnectionParams({ ...connectionParams, port: e.target.value })
                    }
                    className="glassmorphism-input"
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="adv-database">Database</Label>
                  </div>
                  <Input
                    id="adv-database"
                    value={connectionParams.database}
                    onChange={(e) =>
                      setConnectionParams({ ...connectionParams, database: e.target.value })
                    }
                    className="glassmorphism-input"
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="adv-username">Username</Label>
                  </div>
                  <Input
                    id="adv-username"
                    value={connectionParams.username}
                    onChange={(e) =>
                      setConnectionParams({ ...connectionParams, username: e.target.value })
                    }
                    className="glassmorphism-input"
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="adv-password">Password</Label>
                  </div>
                  <Input
                    id="adv-password"
                    type="password"
                    value={connectionParams.password}
                    onChange={(e) =>
                      setConnectionParams({ ...connectionParams, password: e.target.value })
                    }
                    className="glassmorphism-input"
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="adv-auth-source">Auth Source</Label>
                  </div>
                  <Input
                    id="adv-auth-source"
                    value={connectionParams.authSource}
                    onChange={(e) =>
                      setConnectionParams({ ...connectionParams, authSource: e.target.value })
                    }
                    className="glassmorphism-input"
                    disabled={isLoading}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="adv-ssl">Use SSL/TLS</Label>
                  </div>
                  <Switch
                    id="adv-ssl"
                    checked={connectionParams.ssl}
                    onCheckedChange={(checked) =>
                      setConnectionParams({ ...connectionParams, ssl: checked })
                    }
                    disabled={isLoading}
                  />
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="mt-6 mongodb-dialog-footer">
          <Button 
            variant="outline" 
            type="button" 
            onClick={resetForm}
            className="gap-2 mongodb-preset-button"
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4" />
            Reset
          </Button>
          <Button 
            onClick={handleConnect} 
            type="submit"
            className="gap-2 glassmorphism-primary-button mongodb-connect-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Database className="h-4 w-4" />
                {mode === 'edit' ? 'Save Changes' : 'Connect'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 