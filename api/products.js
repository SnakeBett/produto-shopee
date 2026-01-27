import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res);
      case 'POST':
        return await handlePost(req, res);
      case 'PUT':
        return await handlePut(req, res);
      case 'DELETE':
        return await handleDelete(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

// GET - List all products or get by slug
async function handleGet(req, res) {
  const { slug, id, status } = req.query;

  if (slug) {
    // Get single product by slug
    const result = await sql`
      SELECT * FROM products WHERE slug = ${slug} LIMIT 1
    `;
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    return res.status(200).json(formatProduct(result[0]));
  }

  if (id) {
    // Get single product by id
    const result = await sql`
      SELECT * FROM products WHERE id = ${id} LIMIT 1
    `;
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    return res.status(200).json(formatProduct(result[0]));
  }

  // List all products
  let result;
  if (status) {
    result = await sql`
      SELECT * FROM products WHERE status = ${status} ORDER BY created_at DESC
    `;
  } else {
    result = await sql`
      SELECT * FROM products ORDER BY created_at DESC
    `;
  }

  return res.status(200).json(result.map(formatProduct));
}

// POST - Create new product
async function handlePost(req, res) {
  const data = req.body;

  if (!data.title || !data.slug) {
    return res.status(400).json({ error: 'Title and slug are required' });
  }

  // Check for duplicate slug
  const existing = await sql`
    SELECT id FROM products WHERE slug = ${data.slug}
  `;

  if (existing.length > 0) {
    return res.status(400).json({ error: 'Slug already exists' });
  }

  const id = 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

  await sql`
    INSERT INTO products (
      id, slug, status, title, price_original, price_promo, discount,
      installments, sold, checkout_url, desc_title, description,
      specs, ideal_for, usage, includes, seller_logo, seller_name,
      seller_location, images, reviews
    ) VALUES (
      ${id},
      ${data.slug},
      ${data.status || 'draft'},
      ${data.title},
      ${data.priceOriginal || null},
      ${data.pricePromo || null},
      ${data.discount || null},
      ${data.installments || 3},
      ${data.sold || 0},
      ${data.checkoutUrl || null},
      ${data.descTitle || null},
      ${data.description || null},
      ${data.specs || null},
      ${data.idealFor || null},
      ${data.usage || null},
      ${data.includes || null},
      ${data.sellerLogo || null},
      ${data.sellerName || 'Shopee Brasil'},
      ${data.sellerLocation || null},
      ${JSON.stringify(data.images || [])},
      ${JSON.stringify(data.reviews || [])}
    )
  `;

  return res.status(201).json({ success: true, id, slug: data.slug });
}

// PUT - Update product
async function handlePut(req, res) {
  const data = req.body;

  if (!data.id) {
    return res.status(400).json({ error: 'Product ID is required' });
  }

  // Check if product exists
  const existing = await sql`
    SELECT id FROM products WHERE id = ${data.id}
  `;

  if (existing.length === 0) {
    return res.status(404).json({ error: 'Product not found' });
  }

  // Check for duplicate slug (excluding current product)
  if (data.slug) {
    const slugExists = await sql`
      SELECT id FROM products WHERE slug = ${data.slug} AND id != ${data.id}
    `;
    if (slugExists.length > 0) {
      return res.status(400).json({ error: 'Slug already exists' });
    }
  }

  await sql`
    UPDATE products SET
      slug = COALESCE(${data.slug}, slug),
      status = COALESCE(${data.status}, status),
      title = COALESCE(${data.title}, title),
      price_original = ${data.priceOriginal || null},
      price_promo = ${data.pricePromo || null},
      discount = ${data.discount || null},
      installments = COALESCE(${data.installments}, installments),
      sold = COALESCE(${data.sold}, sold),
      checkout_url = ${data.checkoutUrl || null},
      desc_title = ${data.descTitle || null},
      description = ${data.description || null},
      specs = ${data.specs || null},
      ideal_for = ${data.idealFor || null},
      usage = ${data.usage || null},
      includes = ${data.includes || null},
      seller_logo = ${data.sellerLogo || null},
      seller_name = COALESCE(${data.sellerName}, seller_name),
      seller_location = ${data.sellerLocation || null},
      images = ${JSON.stringify(data.images || [])},
      reviews = ${JSON.stringify(data.reviews || [])},
      updated_at = NOW()
    WHERE id = ${data.id}
  `;

  return res.status(200).json({ success: true, id: data.id });
}

// DELETE - Delete product
async function handleDelete(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Product ID is required' });
  }

  const result = await sql`
    DELETE FROM products WHERE id = ${id} RETURNING id
  `;

  if (result.length === 0) {
    return res.status(404).json({ error: 'Product not found' });
  }

  return res.status(200).json({ success: true, deleted: id });
}

// Format product from DB to frontend format
function formatProduct(row) {
  return {
    id: row.id,
    slug: row.slug,
    status: row.status,
    title: row.title,
    priceOriginal: row.price_original,
    pricePromo: row.price_promo,
    discount: row.discount,
    installments: row.installments,
    sold: row.sold,
    checkoutUrl: row.checkout_url,
    descTitle: row.desc_title,
    description: row.description,
    specs: row.specs,
    idealFor: row.ideal_for,
    usage: row.usage,
    includes: row.includes,
    sellerLogo: row.seller_logo,
    sellerName: row.seller_name,
    sellerLocation: row.seller_location,
    images: row.images || [],
    reviews: row.reviews || [],
    createdAt: row.created_at
  };
}
