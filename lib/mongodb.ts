import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface MongoDBDatabase {
  name: string
  sizeOnDisk: number
  empty: boolean
  status: 'active' | 'inactive'
  collections?: MongoDBCollection[]
}

export interface MongoDBCollection {
  name: string
  documents: number
  size: number
  indexes: number
  indexesSize: number
  nameIndexesSize: number
  createdAtIndexesSize: number
}

export interface MongoDBConnection {
  id: string
  name: string
  uri: string
  isActive: boolean
  status: 'connected' | 'disconnected' | 'connecting' | 'error'
  error?: string
  lastConnected?: string
  activeConnections: number
  operationsPerSecond: number
  storageUsed: number
  storageLimit: number
  avgResponseTime: number
}

interface MongoDBState {
  connections: MongoDBConnection[]
  activeConnection: MongoDBConnection | null
  databases: MongoDBDatabase[]
  addConnection: (connection: MongoDBConnection) => void
  removeConnection: (id: string) => void
  setActiveConnection: (id: string | null) => void
  setDatabases: (databases: MongoDBDatabase[]) => void
  updateCollections: (dbName: string, collections: MongoDBCollection[]) => void
  updateConnectionStatus: (id: string, status: MongoDBConnection['status'], error?: string) => void
  editConnection: (id: string, updates: Partial<MongoDBConnection>) => void
}

export const useMongoDBStore = create<MongoDBState>()(
  persist(
    (set) => ({
      connections: [],
      activeConnection: null,
      databases: [],
      addConnection: (connection) =>
        set((state) => ({
          connections: [...state.connections, connection],
          activeConnection: connection,
        })),
      removeConnection: (id) =>
        set((state) => ({
          connections: state.connections.filter((conn) => conn.id !== id),
          activeConnection: state.activeConnection?.id === id ? null : state.activeConnection,
          databases: state.activeConnection?.id === id ? [] : state.databases,
        })),
      setActiveConnection: (id) =>
        set((state) => ({
          activeConnection: id ? state.connections.find((conn) => conn.id === id) || null : null,
          databases: id ? state.databases : [],
        })),
      setDatabases: (databases) =>
        set(() => ({
          databases,
        })),
      updateCollections: (dbName, collections) =>
        set((state) => ({
          databases: state.databases.map((db) =>
            db.name === dbName ? { ...db, collections } : db
          ),
        })),
      updateConnectionStatus: (id, status, error) =>
        set((state) => ({
          connections: state.connections.map((conn) =>
            conn.id === id
              ? {
                  ...conn,
                  status,
                  error,
                  lastConnected: status === 'connected' ? new Date().toISOString() : conn.lastConnected,
                }
              : conn
          ),
          activeConnection:
            state.activeConnection?.id === id
              ? {
                  ...state.activeConnection,
                  status,
                  error,
                  lastConnected: status === 'connected' ? new Date().toISOString() : state.activeConnection.lastConnected,
                }
              : state.activeConnection,
        })),
      editConnection: (id, updates) =>
        set((state) => ({
          connections: state.connections.map((conn) =>
            conn.id === id ? { ...conn, ...updates } : conn
          ),
          activeConnection:
            state.activeConnection?.id === id
              ? { ...state.activeConnection, ...updates }
              : state.activeConnection,
        })),
    }),
    {
      name: 'mongodb-store',
      version: 1,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    }
  )
)

// Helper function to format bytes to human readable format
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

// Helper function to format numbers with commas
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
} 