import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { gql, useQuery as useApolloQuery } from '@apollo/client';
import { httpClient } from '../../lib/http';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

const MY_PRODUCTS_QUERY = gql`
  query MyProducts {
    myProducts {
      id
      name
      description
      price
      stock
      createdAt
    }
  }
`;

const productSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  price: z.coerce.number().positive(),
  stock: z.coerce.number().int().positive(),
});

type ProductForm = z.infer<typeof productSchema>;

type Product = {
  id: string;
  name: string;
  description: string;
  price: number | string;
  stock: number;
  createdAt: string;
};

export const ProductsPage = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { data, loading, refetch } = useApolloQuery<{ myProducts: Product[] }>(
    MY_PRODUCTS_QUERY,
  );

  const { register, handleSubmit, formState, reset } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
  });

  const mutation = useMutation({
    mutationFn: async (payload: ProductForm) => {
      const response = await httpClient.post('/products', payload);
      return response.data as Product;
    },
    onSuccess: () => {
      setIsCreating(false);
      reset();
      refetch();
    },
  });

  const onSubmit = handleSubmit((values) => {
    mutation.mutate(values);
  });

  const products = data?.myProducts ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">My products</h1>
          <p className="text-sm text-slate-600">Create listings and track inventory in real time.</p>
        </div>
        <Button onClick={() => setIsCreating(true)}>New product</Button>
      </div>

      {isCreating ? (
        <Card className="max-w-xl">
          <h2 className="text-lg font-semibold text-slate-900">Create product</h2>
          <form onSubmit={onSubmit} className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Name</label>
              <Input placeholder="Product name" {...register('name')} error={formState.errors.name?.message} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Description</label>
              <textarea
                className="h-24 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Describe the product"
                {...register('description')}
              />
              {formState.errors.description ? (
                <p className="text-xs text-rose-600">{formState.errors.description.message}</p>
              ) : null}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">Price</label>
                <Input type="number" step="0.01" {...register('price')} error={formState.errors.price?.message} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Stock</label>
                <Input type="number" {...register('stock')} error={formState.errors.stock?.message} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Saving…' : 'Save product'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <p className="text-sm text-slate-500">Loading your listings…</p>
        ) : products.length ? (
          products.map((product) => {
            const price = Number(product.price);
            return (
              <Card key={product.id}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
                    <p className="mt-1 text-sm text-slate-600">{product.description}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {product.stock} in stock
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                  <span className="text-lg font-semibold text-slate-900">${price.toFixed(2)}</span>
                  <span>{new Date(product.createdAt).toLocaleDateString()}</span>
                </div>
              </Card>
            );
          })
        ) : (
          <p className="text-sm text-slate-500">
            No products yet. Start by creating your first listing.
          </p>
        )}
      </div>
    </div>
  );
};
