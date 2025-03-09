import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

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

// Define the possible connection statuses as a const array
const CONNECTION_STATUSES = ['connected', 'disconnected', 'connecting', 'error'] as const;
export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

export interface MongoDBConnection {
  id: string
  name: string
  uri: string
  isActive: boolean
  status: ConnectionStatus
  error?: string
  lastConnected?: string
  params?: Record<string, any>
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
  updateConnectionStatus: (id: string, status: ConnectionStatus, error?: string) => void
  editConnection: (id: string, updates: Partial<MongoDBConnection>) => void
  cleanup: () => void
}

export const useMongoDBStore = create<MongoDBState>()(
  persist(
    (set) => ({
      connections: [],
      activeConnection: null,
      databases: [],
      addConnection: (connection) =>
        set((state) => ({
          connections: [...state.connections.slice(-4), connection],
          activeConnection: connection,
        })),
      removeConnection: (id) =>
        set((state) => ({
          connections: state.connections.filter((conn) => conn.id !== id),
          activeConnection: state.activeConnection?.id === id ? null : state.activeConnection,
          databases: state.activeConnection?.id === id ? [] : state.databases,
        })),
      setActiveConnection: (id) =>
        set((state) => {
          const connection = id ? state.connections.find((conn) => conn.id === id) : null
          return {
            activeConnection: connection ? { ...connection, status: 'connected' } : null,
            databases: [],
          }
        }),
      setDatabases: (databases) =>
        set(() => ({
          databases: databases.map(db => ({
            ...db,
            collections: db.collections?.slice(0, 50)
          })),
        })),
      updateCollections: (dbName, collections) =>
        set((state) => ({
          databases: state.databases.map((db) =>
            db.name === dbName ? { ...db, collections: collections.slice(0, 50) } : db
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
      cleanup: () =>
        set(() => ({
          connections: [],
          activeConnection: null,
          databases: [],
        })),
    }),
    {
      name: 'mongodb-store',
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Persist both connections and active connection
        connections: state.connections.map(conn => ({
          id: conn.id,
          name: conn.name,
          uri: conn.uri,
          status: conn.status,
          lastConnected: conn.lastConnected,
          params: conn.params,
          isActive: conn.isActive
        })),
        activeConnection: state.activeConnection ? {
          id: state.activeConnection.id,
          name: state.activeConnection.name,
          uri: state.activeConnection.uri,
          status: state.activeConnection.status,
          lastConnected: state.activeConnection.lastConnected,
          params: state.activeConnection.params,
          isActive: true
        } : null
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        // If there was an active connection, try to reconnect
        if (state.activeConnection) {
          const reconnect = async () => {
            try {
              const response = await fetch('/api/mongodb/connect', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  uri: state.activeConnection!.uri,
                })
              });

              const data = await response.json();
              
              if (response.ok && data.success) {
                state.activeConnection!.status = 'connected';
                state.activeConnection!.lastConnected = new Date().toISOString();
              } else {
                state.activeConnection!.status = 'error';
                state.activeConnection!.error = 'Failed to reconnect';
              }
            } catch (error) {
              state.activeConnection!.status = 'error';
              state.activeConnection!.error = 'Failed to reconnect';
            }
          };

          // Set initial connecting state
          state.activeConnection.status = 'connecting';
          
          // Attempt to reconnect
          reconnect();
        }

        // Update all other connections to disconnected
        state.connections = state.connections.map(conn => ({
          ...conn,
          status: conn.id === state.activeConnection?.id ? conn.status : 'disconnected',
          error: undefined
        }));
      }
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
export function formatNumber(num: number | undefined | null): string {
  if (num === undefined || num === null) return '0'
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
} 