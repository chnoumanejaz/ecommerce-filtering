import { z } from 'zod';

export const AVAILABLE_SIZES = ['S', 'M', 'L'] as const;
export const AVAILABLE_COLORS = [
  'white',
  'beige',
  'green',
  'purple',
  'blue',
] as const;

export const AVAILABLE_SORTS = ['none', 'price-asc', 'price-desc'] as const;

export const productFilterSchema = z.object({
  size: z.array(z.enum(AVAILABLE_SIZES)),
  color: z.array(z.enum(AVAILABLE_COLORS)),
  sort: z.enum(AVAILABLE_SORTS),
  price: z.tuple([z.number(), z.number()]),
});

export type ProductState = Omit<
  z.infer<typeof productFilterSchema>,
  'price'
> & {
  price: { isCustom: boolean; range: [number, number] };
};
