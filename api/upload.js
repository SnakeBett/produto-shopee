import { put, del } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Check if BLOB_READ_WRITE_TOKEN is configured
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(500).json({ 
      error: 'Storage not configured',
      details: 'BLOB_READ_WRITE_TOKEN environment variable is not set. Please configure it in Vercel project settings.'
    });
  }

  if (req.method === 'POST') {
    return await handleUpload(req, res);
  }

  if (req.method === 'DELETE') {
    return await handleDelete(req, res);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

async function handleUpload(req, res) {
  try {
    const contentType = req.headers['content-type'] || '';
    
    // Handle multipart form data
    if (contentType.includes('multipart/form-data')) {
      const chunks = [];
      
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      
      const buffer = Buffer.concat(chunks);
      const boundary = contentType.split('boundary=')[1];
      
      if (!boundary) {
        return res.status(400).json({ error: 'No boundary found' });
      }
      
      // Parse multipart data
      const parts = parseMultipart(buffer, boundary);
      const filePart = parts.find(p => p.filename);
      
      if (!filePart) {
        return res.status(400).json({ error: 'No file found' });
      }
      
      // Generate unique filename
      const ext = filePart.filename.split('.').pop() || 'jpg';
      const filename = `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;
      
      // Upload to Vercel Blob
      const blob = await put(filename, filePart.data, {
        access: 'public',
        contentType: filePart.contentType || 'image/jpeg',
      });
      
      return res.status(200).json({ 
        success: true, 
        url: blob.url,
        filename: filename
      });
    }
    
    return res.status(400).json({ error: 'Invalid content type' });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Upload failed', details: error.message });
  }
}

async function handleDelete(req, res) {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    await del(url);
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return res.status(500).json({ error: 'Delete failed', details: error.message });
  }
}

// Parse multipart form data
function parseMultipart(buffer, boundary) {
  const parts = [];
  const boundaryBuffer = Buffer.from(`--${boundary}`);
  const endBoundary = Buffer.from(`--${boundary}--`);
  
  let start = 0;
  let idx = buffer.indexOf(boundaryBuffer, start);
  
  while (idx !== -1) {
    const nextIdx = buffer.indexOf(boundaryBuffer, idx + boundaryBuffer.length);
    if (nextIdx === -1) break;
    
    const partBuffer = buffer.slice(idx + boundaryBuffer.length, nextIdx);
    const part = parsePart(partBuffer);
    if (part) parts.push(part);
    
    idx = nextIdx;
  }
  
  return parts;
}

function parsePart(buffer) {
  // Find header/body separator
  const separator = Buffer.from('\r\n\r\n');
  const sepIdx = buffer.indexOf(separator);
  
  if (sepIdx === -1) return null;
  
  const headerStr = buffer.slice(0, sepIdx).toString('utf8');
  let body = buffer.slice(sepIdx + 4);
  
  // Remove trailing \r\n
  if (body[body.length - 2] === 0x0d && body[body.length - 1] === 0x0a) {
    body = body.slice(0, -2);
  }
  
  // Parse headers
  const headers = {};
  headerStr.split('\r\n').forEach(line => {
    const match = line.match(/^([^:]+):\s*(.+)$/);
    if (match) {
      headers[match[1].toLowerCase()] = match[2];
    }
  });
  
  // Extract filename and content type
  const disposition = headers['content-disposition'] || '';
  const filenameMatch = disposition.match(/filename="([^"]+)"/);
  const filename = filenameMatch ? filenameMatch[1] : null;
  
  return {
    headers,
    filename,
    contentType: headers['content-type'],
    data: body
  };
}
