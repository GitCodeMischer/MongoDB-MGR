import { MongoClient } from 'mongodb'
import { NextResponse } from 'next/server'
import { generateUUID } from '@/utils/uuid'

export async function POST(request: Request) {
  try {
    const { uri } = await request.json()

    // Create a new MongoDB client
    const client = new MongoClient(uri)

    // Test the connection
    await client.connect()

    // Get list of databases
    const databases = await client.db().admin().listDatabases()

    // Close the connection
    await client.close()

    // Return success with connection details
    return NextResponse.json({
      success: true,
      connectionId: generateUUID(),
      databases: databases.databases
    })
  } catch (error) {
    console.error('MongoDB connection error:', error)
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to connect to MongoDB' },
      { status: 500 }
    )
  }
} 