'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { QueryResult } from '@upstash/vector';
import axios from 'axios';
import { ChevronDown, Filter } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Product } from './db';
import ProductCard from '@/components/products/ProductCard';
import ProductSkeleton from '@/components/products/ProductSkeleton';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ProductState } from '@/lib/schemas/product-schema';
import { Slider } from '@/components/ui/slider';
import debounce from 'lodash.debounce';
import EmptyState from '@/components/products/EmptyState';

const SORT_OPTIONS = [
  { name: 'None', value: 'none' },
  { name: 'Price: Low to High', value: 'price-asc' },
  { name: 'Price: High to Low', value: 'price-desc' },
] as const;

const COLOR_FILTERS = {
  id: 'color',
  name: 'Color',
  options: [
    { value: 'white', label: 'White' },
    { value: 'beige', label: 'Beige' },
    { value: 'blue', label: 'Blue' },
    { value: 'green', label: 'Green' },
    { value: 'purple', label: 'Purple' },
  ] as const,
};

const SIZE_FILTERS = {
  id: 'size',
  name: 'Size',
  options: [
    { value: 'S', label: 'Small' },
    { value: 'M', label: 'Medium' },
    { value: 'L', label: 'Large' },
  ],
} as const;

const PRICE_FILTERS = {
  id: 'price',
  name: 'Price',
  options: [
    { value: [0, 100], label: 'Any price' },
    { value: [0, 20], label: 'Under $20' },
    { value: [0, 40], label: 'Under $40' },
  ],
} as const;

const SUB_CATEGORIES = [
  { name: 'T-Shirts', selected: true, href: '#' },
  { name: 'Hoodies', selected: false, href: '#' },
  { name: 'Sweatshirts', selected: false, href: '#' },
  { name: 'Accessories', selected: false, href: '#' },
] as const;

const DEFAULT_CUSTOM_PRICE = [0, 100] as [number, number];

export default function Home() {
  const [filter, setFilter] = useState<ProductState>({
    sort: 'none',
    color: ['beige', 'blue', 'green', 'purple', 'white'],
    size: ['S', 'M', 'L'],
    price: { isCustom: false, range: DEFAULT_CUSTOM_PRICE },
  });

  const {
    data: products,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await axios.post<QueryResult<Product>[]>(
        'https://advance-filtering-nouman.netlify.app/api/products',
        {
          filter: {
            sort: filter.sort,
            color: filter.color,
            price: filter.price.range,
            size: filter.size,
          },
        }
      );

      return data;
    },
  });

  const debouncedRefetch = debounce(refetch, 400);
  const _debouncedRefetch = useCallback(debouncedRefetch, []);

  const handleSort = (option: { name: string; value: string }) => {
    setFilter(prev => ({
      ...prev,
      sort: option.value as 'none' | 'price-asc' | 'price-desc',
    }));

    _debouncedRefetch();
  };

  const applyArrayFilter = ({
    category,
    value,
  }: {
    category: keyof Omit<typeof filter, 'price' | 'sort'>;
    value: string;
  }) => {
    const isFilterApplied = filter[category].includes(value as never);

    if (isFilterApplied) {
      setFilter(prev => ({
        ...prev,
        [category]: prev[category].filter(v => v !== value),
      }));
    } else {
      setFilter(prev => ({
        ...prev,
        [category]: [...prev[category], value],
      }));
    }

    _debouncedRefetch();
  };

  const minPrice = Math.min(filter.price.range[0], filter.price.range[1]);
  const maxPrice = Math.max(filter.price.range[0], filter.price.range[1]);

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex items-baseline justify-between border-b border-gray-200 pb-6 pt-24 ">
        <div className="flex flex-col">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            High quality shirts collection
          </h1>
          <p className="text-muted-foreground">
            Get your right now by placing an order
          </p>
        </div>

        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
              Sort
              <ChevronDown className="-mr-1 ml-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              {SORT_OPTIONS.map(option => (
                <button
                  key={option.name}
                  onClick={() => handleSort(option)}
                  className={cn(
                    'text-left w-full block px-4 py-2 text-sm rounded',
                    {
                      'text-gray-900 bg-gray-100': option.value === filter.sort,
                      'text-gray-500': option.value !== filter.sort,
                    }
                  )}>
                  {option.name}
                </button>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <button className="-m-2 ml-4 p-2 text-gray-400 hover:text-gray-500 sm:ml-6 lg:hidden">
            <Filter className="h-5 w-5" />
          </button>
        </div>
      </div>

      <section className="pb-24 pt-6 ">
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
          {/* filters */}
          <div className="hidden lg:block ">
            <ul className="space-y-4 border-b border-gray-200 pb-6 text-sm font-medium text-gray-900">
              {SUB_CATEGORIES.map(subCategory => (
                <li key={subCategory.name}>
                  <button
                    className="disabled:cursor-not-allowed disabled:opacity-60 "
                    disabled={!subCategory.selected}>
                    {subCategory.name}
                  </button>
                </li>
              ))}
            </ul>

            <Accordion type="multiple" className="animate-none">
              {/* Color filter */}

              <AccordionItem value="color">
                <AccordionTrigger className="py-2 text-sm text-gray-400 hover:text-gray-500">
                  <span className="font-medium text-gray-900 ">Color</span>
                </AccordionTrigger>

                <AccordionContent className="pt-3 animate-none">
                  <ul className="space-y-4">
                    {COLOR_FILTERS.options.map((option, idx) => (
                      <li key={option.value} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`color-${idx}`}
                          onChange={() =>
                            applyArrayFilter({
                              category: 'color',
                              value: option.value,
                            })
                          }
                          checked={filter.color.includes(option.value)}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 cursor-pointer focus:ring-indigo-500"
                        />
                        <label
                          htmlFor={`color-${idx}`}
                          className="ml-3 text-sm text-gray-600  cursor-pointer">
                          {option.label}
                        </label>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              {/* Size FIlter */}
              <AccordionItem value="size">
                <AccordionTrigger className="py-2 text-sm text-gray-400 hover:text-gray-500">
                  <span className="font-medium text-gray-900 ">Size</span>
                </AccordionTrigger>

                <AccordionContent className="pt-3 animate-none">
                  <ul className="space-y-4">
                    {SIZE_FILTERS.options.map((option, idx) => (
                      <li key={option.value} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`size-${idx}`}
                          onChange={() =>
                            applyArrayFilter({
                              category: 'size',
                              value: option.value,
                            })
                          }
                          checked={filter.size.includes(option.value)}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 cursor-pointer focus:ring-indigo-500"
                        />
                        <label
                          htmlFor={`size-${idx}`}
                          className="ml-3 text-sm text-gray-600  cursor-pointer">
                          {option.label}
                        </label>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              {/* Price Filter */}
              <AccordionItem value="price">
                <AccordionTrigger className="py-2 text-sm text-gray-400 hover:text-gray-500">
                  <span className="font-medium text-gray-900 ">price</span>
                </AccordionTrigger>

                <AccordionContent className="pt-3 animate-none">
                  <ul className="space-y-4">
                    {PRICE_FILTERS.options.map((option, idx) => (
                      <li key={option.label} className="flex items-center">
                        <input
                          type="radio"
                          id={`price-${idx}`}
                          onChange={() => {
                            setFilter(prev => ({
                              ...prev,
                              price: {
                                isCustom: false,
                                range: [...option.value],
                              },
                            }));
                            _debouncedRefetch();
                          }}
                          checked={
                            !filter.price.isCustom &&
                            filter.price.range[0] === option.value[0] &&
                            filter.price.range[1] === option.value[1]
                          }
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 cursor-pointer focus:ring-indigo-500"
                        />
                        <label
                          htmlFor={`price-${idx}`}
                          className="ml-3 text-sm text-gray-600  cursor-pointer">
                          {option.label}
                        </label>
                      </li>
                    ))}
                    <li className="flex justify-center flex-col gap-2">
                      <div>
                        <input
                          type="radio"
                          id={`price-${PRICE_FILTERS.options.length}`}
                          onChange={() => {
                            setFilter(prev => ({
                              ...prev,
                              price: {
                                isCustom: true,
                                range: [0, 100],
                              },
                            }));
                            _debouncedRefetch();
                          }}
                          checked={filter.price.isCustom}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 cursor-pointer focus:ring-indigo-500"
                        />
                        <label
                          htmlFor={`price-${PRICE_FILTERS.options.length}`}
                          className="ml-3 text-sm text-gray-600  cursor-pointer">
                          Custom
                        </label>
                      </div>

                      <div className="flex justify-between">
                        <p className="font-medium">Price</p>
                        <div>
                          {filter.price.isCustom
                            ? minPrice.toFixed(0)
                            : filter.price.range[0].toFixed(0)}
                          $ -{' '}
                          {filter.price.isCustom
                            ? maxPrice.toFixed(0)
                            : filter.price.range[1].toFixed(0)}{' '}
                          $
                        </div>
                      </div>

                      <Slider
                        className={cn({
                          'opacity-50': !filter.price.isCustom,
                        })}
                        disabled={!filter.price.isCustom}
                        onValueChange={range => {
                          const [newMin, newMax] = range;

                          setFilter(prev => ({
                            ...prev,
                            price: {
                              isCustom: true,
                              range: [newMin, newMax],
                            },
                          }));

                          _debouncedRefetch();
                        }}
                        value={
                          filter.price.isCustom
                            ? filter.price.range
                            : DEFAULT_CUSTOM_PRICE
                        }
                        min={DEFAULT_CUSTOM_PRICE[0]}
                        max={DEFAULT_CUSTOM_PRICE[1]}
                        step={5}
                        defaultValue={DEFAULT_CUSTOM_PRICE}
                      />
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Products  */}

          <ul
            className={cn(
              'lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 duration-500',
              {
                'animate-pulse': isRefetching,
              }
            )}>
            {products && products.length === 0 ? (
              <EmptyState />
            ) : products ? (
              products.map(product => (
                <ProductCard product={product.metadata!} key={product.id} />
              ))
            ) : (
              new Array(12)
                .fill(null)
                .map((_, idx) => <ProductSkeleton key={idx} />)
            )}
          </ul>
        </div>
      </section>
    </main>
  );
}
