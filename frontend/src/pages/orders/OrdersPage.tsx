import { useState } from 'react';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { Button } from '../../components/ui/button';

const MY_ORDERS_QUERY = gql`
  query MyOrders($role: OrderRole!, $offset: Int!, $limit: Int!) {
    myOrders(as: $role, offset: $offset, limit: $limit) {
      items {
        id
        productId
        status
        createdAt
      }
      total
    }
  }
`;

const roles = [
  { value: 'buyer', label: 'As Buyer' },
  { value: 'seller', label: 'As Seller' },
] as const;

type OrderRole = (typeof roles)[number]['value'];

type Order = {
  id: string;
  productId: string;
  status: string;
  createdAt: string;
};

type OrdersResponse = {
  myOrders: {
    items: Order[];
    total: number;
  };
};

export const OrdersPage = () => {
  const [role, setRole] = useState<OrderRole>('seller');

  const { data, loading, refetch } = useQuery<OrdersResponse>(MY_ORDERS_QUERY, {
    variables: { role: role === 'seller' ? 'SELLER' : 'BUYER', offset: 0, limit: 25 },
  });

  const items = data?.myOrders.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Orders</h1>
          <p className="text-sm text-slate-600">Manage orders across every status.</p>
        </div>
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 text-sm font-medium text-slate-600">
          {roles.map((r) => (
            <button
              key={r.value}
              onClick={() => {
                setRole(r.value);
                refetch({ role: r.value === 'seller' ? 'SELLER' : 'BUYER', offset: 0, limit: 25 });
              }}
              className={`rounded-md px-3 py-1 transition ${
                role === r.value ? 'bg-indigo-600 text-white shadow' : 'hover:bg-slate-100'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left uppercase tracking-wide text-xs text-slate-500">
            <tr>
              <th className="px-6 py-3">Order ID</th>
              <th className="px-6 py-3">Product</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td className="px-6 py-6 text-center text-slate-500" colSpan={4}>
                  Loading orders...
                </td>
              </tr>
            ) : items.length ? (
              items.map((order: Order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 font-mono text-xs text-slate-600">{order.id}</td>
                  <td className="px-6 py-4 text-slate-600">{order.productId}</td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-700">
                      {order.status.toLowerCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-6 py-6 text-center text-slate-500" colSpan={4}>
                  No orders found for this role yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Button variant="secondary" onClick={() => refetch()} disabled={loading}>
        Refresh
      </Button>
    </div>
  );
};
