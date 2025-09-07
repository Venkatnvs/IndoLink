import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { ShoppingCart, Package, History, CreditCard, Star, Heart, Eye, TrendingUp, ArrowUp, ArrowDown, Clock, CheckCircle, Truck, Bell, Gift, Search, Filter } from 'lucide-react';
import ProductCatalog from '../components/buyer/ProductCatalog';
import Cart from '../components/buyer/Cart';
import OrderHistory from '../components/buyer/OrderHistory';
import { useQuery } from '@tanstack/react-query';
import { useCart } from '../contexts/CartContext';
import api from '../lib/api';

function getTabFromPath(pathname) {
  if (pathname.includes('/cart')) return 'cart';
  if (pathname.includes('/orders')) return 'orders';
  return 'products';
}

export default function BuyerDashboard() {
  const location = useLocation();
  const { cartItems, cartTotal } = useCart();
  
  // Ensure cartTotal and cartItems have default values
  const safeCartTotal = cartTotal || 0;
  const safeCartItems = cartItems || [];

  // Fetch buyer stats
  const { data: stats } = useQuery({
    queryKey: ['buyer-stats'],
    queryFn: async () => {
      const response = await api.get('/buyer/stats/');
      return response.data;
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
                <ShoppingCart className="h-8 w-8 text-purple-600" />
                Buyer Dashboard
              </h1>
              <p className="text-muted-foreground">Browse and purchase quality products across all categories</p>
            </div>
            <div className="flex space-x-3">
              <Link to="/buyer/cart">
                <Button variant="outline" className="flex items-center space-x-2" size="lg">
                  <ShoppingCart className="h-4 w-4" />
                  <span>Cart</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <ShoppingCart className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Cart Items</p>
                    <p className="text-2xl font-bold text-foreground">{safeCartItems.length}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">₹{safeCartTotal.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Total value</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Package className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                    <p className="text-2xl font-bold text-foreground">{stats?.total_orders || 0}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-green-600">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">+15%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">vs last month</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Heart className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Wishlist</p>
                    <p className="text-2xl font-bold text-foreground">{stats?.wishlist_count || 0}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-green-600">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">+8%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">vs last month</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Star className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Reviews</p>
                    <p className="text-2xl font-bold text-foreground">{stats?.reviews_count || 0}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-green-600">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">+12%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">vs last month</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions and Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>Common shopping tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Search className="h-4 w-4 mr-2" />
                Search Products
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Heart className="h-4 w-4 mr-2" />
                View Wishlist
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <History className="h-4 w-4 mr-2" />
                Order History
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Orders</CardTitle>
              <CardDescription>Your latest purchases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { id: 1, product: "Organic Tomatoes", status: "Delivered", date: "2 days ago", amount: "₹450" },
                  { id: 2, product: "Fresh Carrots", status: "Shipped", date: "5 days ago", amount: "₹320" },
                  { id: 3, product: "Green Peppers", status: "Processing", date: "1 week ago", amount: "₹280" }
                ].map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{order.product}</p>
                      <p className="text-xs text-muted-foreground">{order.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{order.amount}</p>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Shopping Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Shopping Progress</CardTitle>
              <CardDescription>Your shopping journey</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Cart Value</span>
                  <span>₹{safeCartTotal.toFixed(2)}</span>
                </div>
                <Progress value={(safeCartTotal / 1000) * 100} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {safeCartTotal < 1000 ? `₹${(1000 - safeCartTotal).toFixed(2)} more for free shipping` : 'Free shipping unlocked!'}
                </p>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Loyalty Points</span>
                  <span>{stats?.loyalty_points || 0}</span>
                </div>
                <div className="flex items-center text-green-600 text-sm">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  +50 points this month
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Savings This Month</span>
                  <span className="text-green-600">₹{stats?.savings || 0}</span>
                </div>
                <div className="flex items-center text-green-600 text-sm">
                  <Gift className="h-3 w-3 mr-1" />
                  Great savings!
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={getTabFromPath(location.pathname)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products" asChild>
              <Link to="/buyer" className="flex items-center space-x-2">
                <Package className="h-4 w-4" />
                <span>Products</span>
              </Link>
            </TabsTrigger>
            <TabsTrigger value="cart" asChild>
              <Link to="/buyer/cart" className="flex items-center space-x-2">
                <ShoppingCart className="h-4 w-4" />
                <span>Cart</span>
              </Link>
            </TabsTrigger>
            <TabsTrigger value="orders" asChild>
              <Link to="/buyer/orders" className="flex items-center space-x-2">
                <History className="h-4 w-4" />
                <span>Orders</span>
              </Link>
            </TabsTrigger>
          </TabsList>

          {getTabFromPath(location.pathname) === 'products' && (
            <TabsContent value="products">
              <ProductCatalog />
            </TabsContent>
          )}
          
          {getTabFromPath(location.pathname) === 'cart' && (
            <TabsContent value="cart">
              <Cart />
            </TabsContent>
          )}
          
          {getTabFromPath(location.pathname) === 'orders' && (
            <TabsContent value="orders">
              <OrderHistory />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
