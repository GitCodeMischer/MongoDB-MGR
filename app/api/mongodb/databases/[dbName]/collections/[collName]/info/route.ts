import { MongoClient } from 'mongodb'

export async function GET(
  req: Request,
  { params }: { params: { dbName: string; collName: string } }
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
    const collection = db.collection(params.collName)

    // Get collection stats
    const stats = await db.command({ collStats: params.collName })

    // Get indexes
    const indexes = await collection.indexes()

    // Sample documents to infer schema
    const sampleDocs = await collection.find().limit(100).toArray()
    const schema = inferSchema(sampleDocs)

    return Response.json({
      success: true,
      stats,
      indexes,
      schema
    })

  } catch (error) {
    console.error('Error fetching collection info:', error)
    return Response.json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to fetch collection info' 
    }, { status: 500 })

  } finally {
    await client.close()
  }
}

function inferSchema(documents: any[]) {
  if (documents.length === 0) return {}

  const schema: Record<string, Set<string>> = {}
  
  documents.forEach(doc => {
    Object.entries(doc).forEach(([key, value]) => {
      if (!schema[key]) {
        schema[key] = new Set()
      }
      schema[key].add(typeof value)
    })
  })

  return Object.fromEntries(
    Object.entries(schema).map(([key, types]) => [key, Array.from(types)])
  )
} 