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
import { useState } from 'react';
import { Product } from './db';
import ProductCard from '@/components/products/ProductCard';
import ProductSkeleton from '@/components/products/ProductSkeleton';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

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

const SUB_CATEGORIES = [
  { name: 'T-Shirts', selected: true, href: '#' },
  { name: 'Hoodies', selected: false, href: '#' },
  { name: 'Sweatshirts', selected: false, href: '#' },
  { name: 'Accessories', selected: false, href: '#' },
] as const;

export default function Home() {
  const [filter, setFilter] = useState({
    sort: 'none',
  });

  const handleSort = (option: { name: string; value: string }) => {
    setFilter(prev => ({
      ...prev,
      sort: option.value,
    }));
  };

  const {
    data: products,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await axios.post<QueryResult<Product>[]>(
        'http://localhost:3000/api/products',
        {
          filter: {
            sort: filter.sort,
          },
        }
      );

      return data;
    },
  });

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex items-baseline justify-between border-b border-gray-200 pb-6 pt-24 ">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          High quality cotton selections
        </h1>

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
            </Accordion>
          </div>

          {/* Products  */}

          <ul className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {!products
              ? new Array(12)
                  .fill(null)
                  .map((_, idx) => <ProductSkeleton key={idx} />)
              : products.map(product => (
                  <ProductCard product={product.metadata!} key={product.id} />
                ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
