"use client"

import { useState } from "react"
import { Activity, AlertTriangle, Clock, HardDrive, Network, RefreshCw, Server, Terminal } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock data for server status
const mockServerStatus = {
  uptime: "15 days, 7 hours",
  version: "6.0.5",
  status: "healthy",
  connections: {
    current: 42,
    available: 1000,
    totalCreated: 8754,
  },
  operations: {
    insert: 245,
    query: 1876,
    update: 532,
    delete: 124,
    getmore: 89,
    command: 3421,
  },
  memory: {
    bits: 64,
    resident: 1024, // MB
    virtual: 2048, // MB
    mapped: 640, // MB
    mappedWithJournal: 1280, // MB
    usage: 68, // percentage
  },
  network: {
    bytesIn: 1256000,
    bytesOut: 4562000,
    numRequests: 12543,
  },
  replication: {
    isReplSet: true,
    setName: "rs0",
    isWritablePrimary: true,
    secondaryDelaySecs: 0,
  },
  logs: [
    { time: "2023-07-15 14:32:45", level: "INFO", message: "Connection accepted from 192.168.1.105:52431 #42" },
    { time: "2023-07-15 14:30:12", level: "INFO", message: "Successfully authenticated as admin on admin" },
    { time: "2023-07-15 14:28:56", level: "WARN", message: "Slow query: 2100ms, collection: users_db.profiles" },
    { time: "2023-07-15 14:25:33", level: "INFO", message: "Index build: users_db.sessions.created_at_-1" },
    { time: "2023-07-15 14:20:11", level: "INFO", message: "Connection accepted from 192.168.1.102:49876 #41" },
    { time: "2023-07-15 14:15:45", level: "ERROR", message: "Write conflict on collection: products_db.inventory" },
    { time: "2023-07-15 14:10:22", level: "INFO", message: "Replica set member rs0:2 is now in state SECONDARY" },
    { time: "2023-07-15 14:05:18", level: "INFO", message: "Connection accepted from 192.168.1.110:51234 #40" },
  ],
  alerts: [
    { id: 1, severity: "warning", message: "Slow query detected (>2000ms)", time: "14:28:56" },
    { id: 2, severity: "error", message: "Write conflict on collection", time: "14:15:45" },
    { id: 3, severity: "info", message: "Approaching connection limit (80%)", time: "13:45:12" },
  ],
}

export default function ServerStatusView() {
  const [lastRefreshed, setLastRefreshed] = useState(new Date())

  const handleRefresh = () => {
    setLastRefreshed(new Date())
  }

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB"
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + " MB"
    else return (bytes / 1073741824).toFixed(2) + " GB"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Server Status</h2>
          <p className="text-sm text-muted-foreground">
            MongoDB {mockServerStatus.version} • Uptime: {mockServerStatus.uptime}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-xs text-muted-foreground">Last refreshed: {lastRefreshed.toLocaleTimeString()}</p>
          <Button size="sm" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <div className="text-2xl font-bold capitalize">{mockServerStatus.status}</div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">MongoDB {mockServerStatus.version}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Connections</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockServerStatus.connections.current}</div>
            <div className="mt-2">
              <Progress value={(mockServerStatus.connections.current / mockServerStatus.connections.available) * 100} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {((mockServerStatus.connections.current / mockServerStatus.connections.available) * 100).toFixed(1)}% of{" "}
              {mockServerStatus.connections.available} available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockServerStatus.memory.usage}%</div>
            <div className="mt-2">
              <Progress value={mockServerStatus.memory.usage} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {mockServerStatus.memory.resident} MB resident of {mockServerStatus.memory.virtual} MB virtual
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Operations</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(mockServerStatus.operations).reduce((a, b) => a + b, 0)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Total operations per second</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Overview</CardTitle>
              <CardDescription>General information about the MongoDB server</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="mb-2 text-sm font-medium">Server Information</h3>
                  <dl className="grid grid-cols-2 gap-1 text-sm">
                    <dt className="text-muted-foreground">Version:</dt>
                    <dd>{mockServerStatus.version}</dd>
                    <dt className="text-muted-foreground">Uptime:</dt>
                    <dd>{mockServerStatus.uptime}</dd>
                    <dt className="text-muted-foreground">Architecture:</dt>
                    <dd>{mockServerStatus.memory.bits}-bit</dd>
                  </dl>
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-medium">Replication Status</h3>
                  <dl className="grid grid-cols-2 gap-1 text-sm">
                    <dt className="text-muted-foreground">Replica Set:</dt>
                    <dd>{mockServerStatus.replication.isReplSet ? "Yes" : "No"}</dd>
                    <dt className="text-muted-foreground">Set Name:</dt>
                    <dd>{mockServerStatus.replication.setName}</dd>
                    <dt className="text-muted-foreground">Primary:</dt>
                    <dd>{mockServerStatus.replication.isWritablePrimary ? "Yes" : "No"}</dd>
                    <dt className="text-muted-foreground">Replication Lag:</dt>
                    <dd>{mockServerStatus.replication.secondaryDelaySecs}s</dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Alerts</CardTitle>
                <CardDescription>Recent system alerts and warnings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockServerStatus.alerts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No alerts at this time</p>
                  ) : (
                    mockServerStatus.alerts.map((alert) => (
                      <div key={alert.id} className="flex items-start gap-2">
                        <div className="mt-0.5">
                          {alert.severity === "error" ? (
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                          ) : alert.severity === "warning" ? (
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-blue-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <Badge
                              variant={alert.severity === "error" ? "destructive" : "outline"}
                              className={
                                alert.severity === "warning"
                                  ? "bg-amber-100 text-amber-800 hover:bg-amber-100 hover:text-amber-800"
                                  : ""
                              }
                            >
                              {alert.severity}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{alert.time}</span>
                          </div>
                          <p className="mt-1 text-sm">{alert.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Memory Details</CardTitle>
                <CardDescription>Memory allocation and usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span>Resident Memory</span>
                      <span className="font-medium">{mockServerStatus.memory.resident} MB</span>
                    </div>
                    <Progress value={(mockServerStatus.memory.resident / mockServerStatus.memory.virtual) * 100} />
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span>Virtual Memory</span>
                      <span className="font-medium">{mockServerStatus.memory.virtual} MB</span>
                    </div>
                    <Progress value={100} />
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span>Mapped Memory</span>
                      <span className="font-medium">{mockServerStatus.memory.mapped} MB</span>
                    </div>
                    <Progress value={(mockServerStatus.memory.mapped / mockServerStatus.memory.virtual) * 100} />
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span>Mapped with Journal</span>
                      <span className="font-medium">{mockServerStatus.memory.mappedWithJournal} MB</span>
                    </div>
                    <Progress
                      value={(mockServerStatus.memory.mappedWithJournal / mockServerStatus.memory.virtual) * 100}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="operations">
          <Card>
            <CardHeader>
              <CardTitle>Operation Statistics</CardTitle>
              <CardDescription>Breakdown of operations per second</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Queries</span>
                      <span className="text-sm">{mockServerStatus.operations.query}</span>
                    </div>
                    <Progress
                      value={
                        (mockServerStatus.operations.query /
                          Object.values(mockServerStatus.operations).reduce((a, b) => a + b, 0)) *
                        100
                      }
                      className="h-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Inserts</span>
                      <span className="text-sm">{mockServerStatus.operations.insert}</span>
                    </div>
                    <Progress
                      value={
                        (mockServerStatus.operations.insert /
                          Object.values(mockServerStatus.operations).reduce((a, b) => a + b, 0)) *
                        100
                      }
                      className="h-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Updates</span>
                      <span className="text-sm">{mockServerStatus.operations.update}</span>
                    </div>
                    <Progress
                      value={
                        (mockServerStatus.operations.update /
                          Object.values(mockServerStatus.operations).reduce((a, b) => a + b, 0)) *
                        100
                      }
                      className="h-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Deletes</span>
                      <span className="text-sm">{mockServerStatus.operations.delete}</span>
                    </div>
                    <Progress
                      value={
                        (mockServerStatus.operations.delete /
                          Object.values(mockServerStatus.operations).reduce((a, b) => a + b, 0)) *
                        100
                      }
                      className="h-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Getmore</span>
                      <span className="text-sm">{mockServerStatus.operations.getmore}</span>
                    </div>
                    <Progress
                      value={
                        (mockServerStatus.operations.getmore /
                          Object.values(mockServerStatus.operations).reduce((a, b) => a + b, 0)) *
                        100
                      }
                      className="h-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Commands</span>
                      <span className="text-sm">{mockServerStatus.operations.command}</span>
                    </div>
                    <Progress
                      value={
                        (mockServerStatus.operations.command /
                          Object.values(mockServerStatus.operations).reduce((a, b) => a + b, 0)) *
                        100
                      }
                      className="h-2"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 text-lg font-medium">Operation Latency</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Operation Type</TableHead>
                        <TableHead>Count</TableHead>
                        <TableHead>Avg. Latency</TableHead>
                        <TableHead>Max Latency</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Read</TableCell>
                        <TableCell>{mockServerStatus.operations.query + mockServerStatus.operations.getmore}</TableCell>
                        <TableCell>12ms</TableCell>
                        <TableCell>2100ms</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Write</TableCell>
                        <TableCell>
                          {mockServerStatus.operations.insert +
                            mockServerStatus.operations.update +
                            mockServerStatus.operations.delete}
                        </TableCell>
                        <TableCell>18ms</TableCell>
                        <TableCell>450ms</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Command</TableCell>
                        <TableCell>{mockServerStatus.operations.command}</TableCell>
                        <TableCell>5ms</TableCell>
                        <TableCell>120ms</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="network">
          <Card>
            <CardHeader>
              <CardTitle>Network Statistics</CardTitle>
              <CardDescription>Network traffic and connection details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Network In</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatBytes(mockServerStatus.network.bytesIn)}</div>
                      <p className="text-xs text-muted-foreground">Total bytes received</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Network Out</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatBytes(mockServerStatus.network.bytesOut)}</div>
                      <p className="text-xs text-muted-foreground">Total bytes sent</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{mockServerStatus.network.numRequests.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">Total requests processed</p>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h3 className="mb-4 text-lg font-medium">Connection Details</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Metric</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Current Connections</TableCell>
                        <TableCell>{mockServerStatus.connections.current}</TableCell>
                        <TableCell className="text-muted-foreground">Number of connections currently open</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Available Connections</TableCell>
                        <TableCell>{mockServerStatus.connections.available}</TableCell>
                        <TableCell className="text-muted-foreground">Number of unused connections available</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Total Created</TableCell>
                        <TableCell>{mockServerStatus.connections.totalCreated.toLocaleString()}</TableCell>
                        <TableCell className="text-muted-foreground">
                          Total connections created since server start
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Connection Utilization</TableCell>
                        <TableCell>
                          {(
                            (mockServerStatus.connections.current / mockServerStatus.connections.available) *
                            100
                          ).toFixed(1)}
                          %
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          Percentage of connection capacity in use
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Server Logs</CardTitle>
              <CardDescription>Recent log entries from the MongoDB server</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="bg-muted/50 p-2">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4" />
                    <span className="text-sm font-medium">Log Output</span>
                  </div>
                </div>
                <div className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[180px]">Timestamp</TableHead>
                        <TableHead className="w-[100px]">Level</TableHead>
                        <TableHead>Message</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockServerStatus.logs.map((log, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono text-xs">{log.time}</TableCell>
                          <TableCell>
                            <Badge
                              variant={log.level === "ERROR" ? "destructive" : "outline"}
                              className={
                                log.level === "WARN"
                                  ? "bg-amber-100 text-amber-800 hover:bg-amber-100 hover:text-amber-800"
                                  : log.level === "INFO"
                                    ? "bg-blue-100 text-blue-800 hover:bg-blue-100 hover:text-blue-800"
                                    : ""
                              }
                            >
                              {log.level}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{log.message}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <Button variant="outline" size="sm">
                  <Clock className="mr-2 h-4 w-4" />
                  Show Older Logs
                </Button>
                <Button variant="outline" size="sm">
                  Export Logs
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

