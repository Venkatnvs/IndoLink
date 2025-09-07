import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Package, Plus, BarChart3, Settings, Leaf, TrendingUp, DollarSign, Users, Eye, ShoppingCart, Star, Calendar, ArrowUp, ArrowDown, Activity } from 'lucide-react';
import ProductList from '../components/seller/ProductList';
import AddProduct from '../components/seller/AddProduct';
import EditProduct from '../components/seller/EditProduct';
import SellerOrders from '../components/seller/SellerOrders';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export default function SellerDashboard() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('products');

  const getTabFromPath = (pathname) => {
    if (pathname.includes('/add-product')) return 'add-product';
    if (pathname.includes('/edit-product')) return 'edit-product';
    if (pathname.includes('/orders')) return 'orders';
    return 'products';
  };

  // Fetch seller stats
  const { data: stats } = useQuery({
    queryKey: ['seller-stats'],
    queryFn: async () => {
      try {
        const response = await api.get('/products/seller/stats/');
        return response.data;
      } catch (error) {
        console.error('Error fetching seller stats:', error);
        // Return default stats if API fails
        return {
          total_products: 0,
          total_sales: 0,
          total_orders: 0,
          average_rating: 0,
          active_products: 0,
          sold_products: 0,
          recent_products: 0
        };
      }
    },
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Package className="h-8 w-8 text-secondary" />
                Seller Dashboard
              </h1>
              <p className="text-muted-foreground">Manage your products and track sales across all categories</p>
            </div>
            <div className="flex space-x-3">
              <Link to="/seller/add-product">
                <Button className="flex items-center space-x-2" size="lg">
                  <Plus className="h-4 w-4" />
                  <span>Add Product</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="gradient-card hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                  <p className="text-3xl font-bold text-foreground">{stats?.total_products || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats?.active_products || 0} active
                  </p>
                </div>
                <div className="p-3 bg-secondary/10 rounded-lg pulse-glow">
                  <Package className="h-6 w-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="gradient-card hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-3xl font-bold text-foreground">₹{stats?.total_sales || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    From {stats?.sold_products || 0} sold
                  </p>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="gradient-card hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Products</p>
                  <p className="text-3xl font-bold text-foreground">{stats?.active_products || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Currently listed
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Recent Activity</p>
                  <p className="text-3xl font-bold text-foreground">{stats?.recent_products || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Last 30 days
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <Tabs value={getTabFromPath(location.pathname)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-4">
            <TabsTrigger value="products" asChild>
              <Link to="/seller" className="flex items-center space-x-2">
                <Package className="h-4 w-4" />
                <span>My Products</span>
              </Link>
            </TabsTrigger>
            <TabsTrigger value="add-product" asChild>
              <Link to="/seller/add-product" className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add Product</span>
              </Link>
            </TabsTrigger>
            <TabsTrigger value="orders" asChild>
              <Link to="/seller/orders" className="flex items-center space-x-2">
                <ShoppingCart className="h-4 w-4" />
                <span>Orders</span>
              </Link>
            </TabsTrigger>
          </TabsList>

          {getTabFromPath(location.pathname) === 'products' && (
            <TabsContent value="products">
              <ProductList />
            </TabsContent>
          )}
          
          {getTabFromPath(location.pathname) === 'add-product' && (
            <TabsContent value="add-product">
              <AddProduct />
            </TabsContent>
          )}
          
          {getTabFromPath(location.pathname) === 'edit-product' && (
            <TabsContent value="edit-product">
              <EditProduct />
            </TabsContent>
          )}
          
          {getTabFromPath(location.pathname) === 'orders' && (
            <TabsContent value="orders">
              <SellerOrders />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
