import { db } from '@/app/db';

export const POST = async () => {
  const products = await db.query({
    topK: 30,
    vector: [0, 0, 0],
    includeMetadata: true,
  });

  return new Response(JSON.stringify(products));
};
