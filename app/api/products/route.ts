import { db } from '@/app/db';
import { productFilterSchema } from '@/lib/schemas/product-schema';
import { NextRequest } from 'next/server';

class Filter {
  private filter: Map<string, string[]> = new Map();

  hasFilter() {
    return this.filter.size > 0;
  }

  add(key: string, operator: string, value: string | number) {
    const filter = this.filter.get(key) || [];

    filter.push(
      `${key} ${operator} ${typeof value === 'string' ? `"${value}"` : value}`
    );

    this.filter.set(key, filter);
  }

  addRaw(key: string, rawFilter: string) {
    this.filter.set(key, [rawFilter]);
  }

  get() {
    const parts: string[] = [];

    this.filter.forEach(filter => {
      const joined = filter.join(' OR ');

      parts.push(`(${joined})`);
    });

    return parts.join(' AND ');
  }
}

const AVG_PRODUCT_PRICE = 25;
const MAX_PRODUCT_PRICE = 50;

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();

    const { color, price, size, sort } = productFilterSchema.parse(body.filter);

    const filter = new Filter();

    if (color.length > 0) color.forEach(c => filter.add('color', '=', c));
    else if (color.length === 0) filter.addRaw('color', 'color = ""');

    if (size.length > 0) size.forEach(s => filter.add('size', '=', s));
    else if (size.length === 0) filter.addRaw('size', 'size = ""');

    filter.addRaw('price', `price >= ${price[0]} AND price <= ${price[1]}`);

    const products = await db.query({
      topK: 30,
      vector: [
        0,
        0,
        sort === 'none'
          ? AVG_PRODUCT_PRICE
          : sort === 'price-asc'
          ? 0
          : MAX_PRODUCT_PRICE,
      ],
      includeMetadata: true,
      filter: filter.hasFilter() ? filter.get() : undefined,
    });

    return new Response(JSON.stringify(products));
  } catch (error) {
    console.error(error);

    return new Response(
      JSON.stringify({ message: 'Internal Server error occurred' }),
      {
        status: 500,
      }
    );
  }
};
