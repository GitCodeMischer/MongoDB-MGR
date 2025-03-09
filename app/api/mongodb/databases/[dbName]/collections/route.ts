import { MongoClient } from 'mongodb'

export async function GET(
  req: Request,
  { params }: { params: { dbName: string } }
) {
  const { searchParams } = new URL(req.url)
  const uri = searchParams.get('uri')

  if (!uri) {
    return Response.json({ success: false, message: 'MongoDB URI is required' }, { status: 400 })
  }

  const client = new MongoClient(uri)

  try {
    await client.connect()
    const db = client.db(params.dbName)

    // Get collections
    const collections = await db.listCollections().toArray()

    // Get collection stats
    const collectionStats = await Promise.all(
      collections.map(async (coll) => {
        const stats = await db.command({ collStats: coll.name })
        return {
          name: coll.name,
          type: coll.type,
          size: stats.size,
          count: stats.count,
          avgObjSize: stats.avgObjSize,
          storageSize: stats.storageSize,
          indexes: stats.nindexes,
          totalIndexSize: stats.totalIndexSize,
          documents: stats.count
        }
      })
    )

    return Response.json({
      success: true,
      collections: collectionStats
    })

  } catch (error) {
    console.error('Error fetching collections:', error)
    return Response.json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to fetch collections' 
    }, { status: 500 })

  } finally {
    await client.close()
  }
} 