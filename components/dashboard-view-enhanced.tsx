"use client"

import { useState } from "react"
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Database,
  FileText,
  HardDrive,
  LineChart,
  ShieldAlert,
  Zap,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock data for dashboard
const mockDashboardData = {
  summary: {
    totalDatabases: 12,
    totalCollections: 87,
    totalDocuments: 24568921,
    totalIndexes: 156,
    storageSize: 5.8, // GB
    dataSize: 4.2, // GB
    indexSize: 1.6, // GB
  },
  performance: {
    queriesPerSecond: 1243,
    writeOpsPerSecond: 532,
    avgQueryTime: 42, // ms
    slowQueries: 3, // last hour
    indexHitRatio: 98.5, // percentage
  },
  topCollections: [
    { database: "users_db", collection: "sessions", size: "1.2GB", documents: 12500000, avgObjSize: 102 },
    { database: "analytics_db", collection: "events", size: "950MB", documents: 1250000, avgObjSize: 800 },
    { database: "products_db", collection: "inventory", size: "350MB", documents: 8700, avgObjSize: 42000 },
    { database: "users_db", collection: "users", size: "240MB", documents: 12500, avgObjSize: 20000 },
    { database: "users_db", collection: "profiles", size: "180MB", documents: 12350, avgObjSize: 15000 },
  ],
  recentActivity: [
    { time: "14:32:45", operation: "INSERT", collection: "users_db.sessions", count: 1250 },
    { time: "14:30:12", operation: "QUERY", collection: "products_db.inventory", count: 87 },
    { time: "14:28:56", operation: "UPDATE", collection: "users_db.profiles", count: 15 },
    { time: "14:25:33", operation: "INDEX", collection: "users_db.sessions", count: 1 },
    { time: "14:20:11", operation: "DELETE", collection: "analytics_db.events", count: 5000 },
    { time: "14:15:45", operation: "QUERY", collection: "products_db.inventory", count: 120 },
    { time: "14:10:22", operation: "UPDATE", collection: "users_db.users", count: 35 },
  ],
  healthChecks: [
    { name: "Primary Connectivity", status: "healthy", latency: "2ms" },
    { name: "Secondary Replication", status: "healthy", latency: "5ms" },
    { name: "Disk Space", status: "warning", details: "75% used" },
    { name: "Memory Usage", status: "healthy", details: "45% used" },
    { name: "Connection Pool", status: "healthy", details: "42/1000 used" },
    { name: "Index Coverage", status: "healthy", details: "98.5% queries use indexes" },
  ],
}

export default function DashboardViewEnhanced() {
  const [lastRefreshed, setLastRefreshed] = useState(new Date())

  const handleRefresh = () => {
    setLastRefreshed(new Date())
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">MongoDB Dashboard</h2>
          <p className="text-sm text-muted-foreground">Overview of your MongoDB deployment</p>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-xs text-muted-foreground">Last refreshed: {lastRefreshed.toLocaleTimeString()}</p>
          <Button size="sm" onClick={handleRefresh}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Databases</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockDashboardData.summary.totalDatabases}</div>
            <p className="text-xs text-muted-foreground">
              {mockDashboardData.summary.totalCollections} collections total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(mockDashboardData.summary.totalDocuments / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground">{mockDashboardData.summary.totalIndexes} indexes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Storage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockDashboardData.summary.storageSize} GB</div>
            <div className="mt-2">
              <Progress value={(mockDashboardData.summary.dataSize / mockDashboardData.summary.storageSize) * 100} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {mockDashboardData.summary.dataSize} GB data, {mockDashboardData.summary.indexSize} GB indexes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockDashboardData.performance.avgQueryTime} ms</div>
            <p className="text-xs text-muted-foreground">Average query response time</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Top Collections by Size</CardTitle>
                <CardDescription>Collections using the most storage space</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Database</TableHead>
                      <TableHead>Collection</TableHead>
                      <TableHead className="hidden md:table-cell">Documents</TableHead>
                      <TableHead className="hidden md:table-cell">Avg. Size</TableHead>
                      <TableHead>Total Size</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockDashboardData.topCollections.map((collection, index) => (
                      <TableRow key={index}>
                        <TableCell>{collection.database}</TableCell>
                        <TableCell className="font-medium">{collection.collection}</TableCell>
                        <TableCell className="hidden md:table-cell">{collection.documents.toLocaleString()}</TableCell>
                        <TableCell className="hidden md:table-cell">{collection.avgObjSize} bytes</TableCell>
                        <TableCell>{collection.size}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest operations on your databases</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockDashboardData.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="mt-0.5">
                        {activity.operation === "INSERT" ? (
                          <Database className="h-4 w-4 text-green-500" />
                        ) : activity.operation === "QUERY" ? (
                          <FileText className="h-4 w-4 text-blue-500" />
                        ) : activity.operation === "UPDATE" ? (
                          <Zap className="h-4 w-4 text-amber-500" />
                        ) : activity.operation === "DELETE" ? (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        ) : (
                          <Activity className="h-4 w-4 text-purple-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{activity.operation}</Badge>
                          <span className="text-xs text-muted-foreground">{activity.time}</span>
                        </div>
                        <p className="mt-1 text-sm">{activity.collection}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.count.toLocaleString()} {activity.operation === "INDEX" ? "created" : "documents"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Current performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span>Queries Per Second</span>
                      <span className="font-medium">{mockDashboardData.performance.queriesPerSecond}</span>
                    </div>
                    <Progress value={80} />
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span>Write Ops Per Second</span>
                      <span className="font-medium">{mockDashboardData.performance.writeOpsPerSecond}</span>
                    </div>
                    <Progress value={40} />
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span>Index Hit Ratio</span>
                      <span className="font-medium">{mockDashboardData.performance.indexHitRatio}%</span>
                    </div>
                    <Progress value={mockDashboardData.performance.indexHitRatio} />
                  </div>

                  <div className="rounded-md border p-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-medium">Slow Queries</span>
                    </div>
                    <p className="mt-1 text-sm">
                      {mockDashboardData.performance.slowQueries} slow queries detected in the last hour
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analysis</CardTitle>
              <CardDescription>Detailed performance metrics and analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Query Throughput</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{mockDashboardData.performance.queriesPerSecond}</div>
                      <p className="text-xs text-muted-foreground">Queries per second</p>
                      <div className="mt-4 h-[80px] w-full rounded-md border p-2">
                        <div className="flex h-full items-end gap-1">
                          {Array.from({ length: 12 }).map((_, i) => (
                            <div
                              key={i}
                              className="bg-primary w-full"
                              style={{
                                height: `${Math.max(15, Math.min(100, Math.random() * 100))}%`,
                                opacity: 0.7 + i / 40,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Write Throughput</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{mockDashboardData.performance.writeOpsPerSecond}</div>
                      <p className="text-xs text-muted-foreground">Write operations per second</p>
                      <div className="mt-4 h-[80px] w-full rounded-md border p-2">
                        <div className="flex h-full items-end gap-1">
                          {Array.from({ length: 12 }).map((_, i) => (
                            <div
                              key={i}
                              className="bg-blue-500"
                              style={{
                                height: `${Math.max(10, Math.min(100, Math.random() * 60))}%`,
                                opacity: 0.7 + i / 40,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{mockDashboardData.performance.avgQueryTime} ms</div>
                      <p className="text-xs text-muted-foreground">Average query response time</p>
                      <div className="mt-4 h-[80px] w-full rounded-md border p-2">
                        <div className="flex h-full items-end gap-1">
                          {Array.from({ length: 12 }).map((_, i) => (
                            <div
                              key={i}
                              className="bg-green-500"
                              style={{
                                height: `${Math.max(20, Math.min(100, Math.random() * 70))}%`,
                                opacity: 0.7 + i / 40,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h3 className="mb-4 text-lg font-medium">Query Performance</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Collection</TableHead>
                        <TableHead>Query Type</TableHead>
                        <TableHead>Avg. Time</TableHead>
                        <TableHead>Index Used</TableHead>
                        <TableHead>Documents Scanned</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">users_db.users</TableCell>
                        <TableCell>find</TableCell>
                        <TableCell>12ms</TableCell>
                        <TableCell>Yes (email_1)</TableCell>
                        <TableCell>1</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">products_db.inventory</TableCell>
                        <TableCell>find</TableCell>
                        <TableCell>45ms</TableCell>
                        <TableCell>Yes (category_1_price_1)</TableCell>
                        <TableCell>87</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">analytics_db.events</TableCell>
                        <TableCell>aggregate</TableCell>
                        <TableCell>2100ms</TableCell>
                        <TableCell>Partial (timestamp_1)</TableCell>
                        <TableCell>250000</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">users_db.sessions</TableCell>
                        <TableCell>find</TableCell>
                        <TableCell>5ms</TableCell>
                        <TableCell>Yes (token_1)</TableCell>
                        <TableCell>1</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">products_db.reviews</TableCell>
                        <TableCell>find</TableCell>
                        <TableCell>28ms</TableCell>
                        <TableCell>Yes (product_id_1)</TableCell>
                        <TableCell>24</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage">
          <Card>
            <CardHeader>
              <CardTitle>Storage Analysis</CardTitle>
              <CardDescription>Database and collection storage metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="mb-4 text-lg font-medium">Storage Distribution</h3>
                    <div className="rounded-md border p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Total Storage: {mockDashboardData.summary.storageSize} GB
                        </span>
                      </div>
                      <div className="mb-6 h-4 overflow-hidden rounded-full">
                        <div className="flex h-full">
                          <div
                            className="bg-blue-500"
                            style={{
                              width: `${(mockDashboardData.summary.dataSize / mockDashboardData.summary.storageSize) * 100}%`,
                            }}
                          />
                          <div
                            className="bg-amber-500"
                            style={{
                              width: `${(mockDashboardData.summary.indexSize / mockDashboardData.summary.storageSize) * 100}%`,
                            }}
                          />
                          <div
                            className="bg-gray-200 dark:bg-gray-700"
                            style={{
                              width: `${100 - ((mockDashboardData.summary.dataSize + mockDashboardData.summary.indexSize) / mockDashboardData.summary.storageSize) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-sm">
                        <div>
                          <div className="mb-1 h-2 w-full rounded bg-blue-500" />
                          <span className="text-xs">Data ({mockDashboardData.summary.dataSize} GB)</span>
                        </div>
                        <div>
                          <div className="mb-1 h-2 w-full rounded bg-amber-500" />
                          <span className="text-xs">Indexes ({mockDashboardData.summary.indexSize} GB)</span>
                        </div>
                        <div>
                          <div className="mb-1 h-2 w-full rounded bg-gray-200 dark:bg-gray-700" />
                          <span className="text-xs">Free Space</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-4 text-lg font-medium">Database Sizes</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span>users_db</span>
                          <span className="font-medium">1.8 GB</span>
                        </div>
                        <Progress value={31} />
                      </div>

                      <div>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span>analytics_db</span>
                          <span className="font-medium">2.2 GB</span>
                        </div>
                        <Progress value={38} />
                      </div>

                      <div>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span>products_db</span>
                          <span className="font-medium">1.2 GB</span>
                        </div>
                        <Progress value={21} />
                      </div>

                      <div>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span>logs_db</span>
                          <span className="font-medium">0.6 GB</span>
                        </div>
                        <Progress value={10} />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 text-lg font-medium">Storage Recommendations</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-amber-500" />
                          <CardTitle className="text-sm font-medium">Index Optimization</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">
                          Consider removing unused indexes in <span className="font-medium">analytics_db.events</span>{" "}
                          to save approximately 250MB of storage.
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <LineChart className="h-4 w-4 text-blue-500" />
                          <CardTitle className="text-sm font-medium">Data Compression</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">
                          Enable WiredTiger compression on <span className="font-medium">users_db.sessions</span> to
                          reduce storage by up to 60%.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health">
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>Health checks and system status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  {mockDashboardData.healthChecks.map((check, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-medium">{check.name}</CardTitle>
                          {check.status === "healthy" ? (
                            <ShieldAlert className="h-4 w-4 text-green-500" />
                          ) : check.status === "warning" ? (
                            <ShieldAlert className="h-4 w-4 text-amber-500" />
                          ) : (
                            <ShieldAlert className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={check.status === "healthy" ? "outline" : "destructive"}
                            className={
                              check.status === "warning"
                                ? "bg-amber-100 text-amber-800 hover:bg-amber-100 hover:text-amber-800"
                                : ""
                            }
                          >
                            {check.status}
                          </Badge>
                          {check.latency && <span className="text-xs">{check.latency}</span>}
                        </div>
                        {check.details && <p className="mt-2 text-sm text-muted-foreground">{check.details}</p>}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div>
                  <h3 className="mb-4 text-lg font-medium">Health Recommendations</h3>
                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-500" />
                          <div>
                            <p className="font-medium">Disk Space Warning</p>
                            <p className="text-sm text-muted-foreground">
                              Your disk usage is at 75%. Consider adding more storage or implementing data archiving
                              strategies.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <AlertTriangle className="mt-0.5 h-4 w-4 text-blue-500" />
                          <div>
                            <p className="font-medium">Index Coverage</p>
                            <p className="text-sm text-muted-foreground">
                              Your index coverage is excellent at 98.5%. Continue monitoring for any slow queries.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <AlertTriangle className="mt-0.5 h-4 w-4 text-green-500" />
                          <div>
                            <p className="font-medium">Replication Health</p>
                            <p className="text-sm text-muted-foreground">
                              Replication is functioning normally with minimal lag (5ms).
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

