import { MongoClient } from 'mongodb'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { dbName: string } }
) {
  const { searchParams } = new URL(request.url)
  const uri = searchParams.get('uri')

  if (!uri) {
    return NextResponse.json(
      { success: false, message: 'MongoDB URI is required' },
      { status: 400 }
    )
  }

  try {
    const client = new MongoClient(uri)
    await client.connect()

    const db = client.db(params.dbName)
    const collections = await db.listCollections().toArray()

    // Get additional stats for each collection
    const collectionsWithStats = await Promise.all(
      collections.map(async (collection) => {
        const stats = await db.command({ collStats: collection.name })
        return {
          name: collection.name,
          documents: stats.count,
          size: stats.size,
          indexes: stats.nindexes,
        }
      })
    )

    await client.close()

    return NextResponse.json({
      success: true,
      collections: collectionsWithStats
    })
  } catch (error) {
    console.error('MongoDB collections error:', error)
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to fetch collections' },
      { status: 500 }
    )
  }
} 