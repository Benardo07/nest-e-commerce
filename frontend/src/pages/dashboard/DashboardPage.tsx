import { gql, useQuery } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

const RECENT_ORDERS_QUERY = gql`
  query RecentOrders {
    myOrders(as: SELLER, offset: 0, limit: 5) {
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

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { data, loading } = useQuery(RECENT_ORDERS_QUERY);
  const orders = data?.myOrders.items ?? [];

  return (
    <div className="space-y-8">
      <section className="grid gap-6 md:grid-cols-3">
        <Card>
          <h3 className="text-sm font-medium text-slate-500">Active Listings</h3>
          <p className="mt-2 text-3xl font-semibold text-slate-900">--</p>
          <p className="mt-2 text-xs text-slate-500">
            Manage the products you are currently selling.
          </p>
          <Button className="mt-4" variant="ghost" onClick={() => navigate('/products')}>
            Manage products
          </Button>
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-slate-500">Pending Orders</h3>
          <p className="mt-2 text-3xl font-semibold text-slate-900">--</p>
          <p className="mt-2 text-xs text-slate-500">Orders awaiting your confirmation or shipment.</p>
          <Button className="mt-4" variant="ghost" onClick={() => navigate('/orders')}>
            View orders
          </Button>
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-slate-500">Open Chats</h3>
          <p className="mt-2 text-3xl font-semibold text-slate-900">--</p>
          <p className="mt-2 text-xs text-slate-500">Connect with buyers in real time.</p>
          <Button className="mt-4" variant="ghost" onClick={() => navigate('/chat')}>
            Head to inbox
          </Button>
        </Card>
      </section>
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Recent orders</h2>
          <Button variant="ghost" onClick={() => navigate('/orders')}>
            See all orders
          </Button>
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
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-6 py-6 text-center text-slate-500" colSpan={4}>
                    Loading orders…
                  </td>
                </tr>
              ) : orders.length ? (
                orders.map((order: any) => (
                  <tr key={order.id} className="border-t border-slate-100">
                    <td className="px-6 py-4 font-mono text-xs text-slate-600">{order.id}</td>
                    <td className="px-6 py-4 text-slate-600">{order.productId}</td>
                    <td className="px-6 py-4 capitalize text-slate-700">{order.status}</td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-6 py-6 text-center text-slate-500" colSpan={4}>
                    Your recent orders will show up here once you start selling.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
