import { MongoClient } from 'mongodb'

export async function GET(
  req: Request,
  { params }: { params: { dbName: string; collName: string } }
) {
  const { searchParams } = new URL(req.url)
  const uri = searchParams.get('uri')
  const search = searchParams.get('search') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('pageSize') || '10')

  if (!uri) {
    return Response.json({ success: false, message: 'MongoDB URI is required' }, { status: 400 })
  }

  const client = new MongoClient(uri)

  try {
    await client.connect()
    const db = client.db(params.dbName)
    const collection = db.collection(params.collName)

    // Build query based on search
    const query = search ? { $text: { $search: search } } : {}

    // Get total count
    const total = await collection.countDocuments(query)

    // Get paginated documents
    const documents = await collection
      .find(query)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray()

    return Response.json({
      success: true,
      documents,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    })

  } catch (error) {
    console.error('Error fetching documents:', error)
    return Response.json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to fetch documents' 
    }, { status: 500 })

  } finally {
    await client.close()
  }
} 