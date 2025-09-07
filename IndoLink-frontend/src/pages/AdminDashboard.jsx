import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { BarChart3, Package, ShoppingCart, Brain, TrendingUp, DollarSign, Users, Activity, AlertTriangle, CheckCircle, Clock, ArrowUp, ArrowDown, Eye, Star, Calendar, Settings } from 'lucide-react';
import SellerProducts from '../components/admin/SellerProducts';
import AdminProducts from '../components/admin/AdminProducts';
import AdminAnalytics from '../components/admin/AdminAnalytics';
import GeminiAnalysis from '../components/admin/GeminiAnalysis';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

function getTabFromPath(pathname) {
  if (pathname.includes('/my-products')) return 'my-products';
  if (pathname.includes('/analytics')) return 'analytics';
  if (pathname.includes('/gemini')) return 'gemini';
  return 'seller-products';
}

export default function AdminDashboard() {
  const location = useLocation();

  // Fetch admin stats
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const response = await api.get('/admin/stats/');
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
                <TrendingUp className="h-8 w-8 text-primary" />
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">Manage marketplace and analyze trends with AI across all categories</p>
            </div>
            <div className="flex space-x-3">
              <Link to="/admin/analytics">
                <Button variant="outline" className="flex items-center space-x-2" size="lg">
                  <BarChart3 className="h-4 w-4" />
                  <span>Analytics</span>
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
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                    <p className="text-2xl font-bold text-foreground">{stats?.total_products || 0}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-green-600">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">+18%</span>
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
                  <div className="p-2 bg-secondary/10 rounded-lg">
                    <Users className="h-6 w-6 text-secondary" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Active Sellers</p>
                    <p className="text-2xl font-bold text-foreground">{stats?.active_sellers || 0}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-green-600">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">+5%</span>
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
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Platform Revenue</p>
                    <p className="text-2xl font-bold text-foreground">₹{stats?.revenue || 0}</p>
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
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Activity className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                    <p className="text-2xl font-bold text-foreground">{stats?.total_orders || 0}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-green-600">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">+22%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">vs last month</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Overview Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Activity className="h-5 w-5 mr-2 text-green-600" />
                System Health
              </CardTitle>
              <CardDescription>Platform status and performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Server Status</span>
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Online
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Database</span>
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Healthy
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">API Response</span>
                <span className="text-sm font-medium text-green-600">245ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Uptime</span>
                <span className="text-sm font-medium">99.9%</span>
              </div>
            </CardContent>
          </Card>

          {/* Pending Approvals */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Clock className="h-5 w-5 mr-2 text-orange-600" />
                Pending Approvals
              </CardTitle>
              <CardDescription>Items requiring admin attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">New Seller Applications</p>
                    <p className="text-xs text-muted-foreground">3 pending review</p>
                  </div>
                  <Badge variant="outline" className="bg-orange-100 text-orange-800">
                    3
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Product Moderation</p>
                    <p className="text-xs text-muted-foreground">7 products need review</p>
                  </div>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800">
                    7
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Dispute Reports</p>
                    <p className="text-xs text-muted-foreground">2 disputes need resolution</p>
                  </div>
                  <Badge variant="outline" className="bg-red-100 text-red-800">
                    2
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Performing Products */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Star className="h-5 w-5 mr-2 text-yellow-600" />
                Top Products
              </CardTitle>
              <CardDescription>Best performing products this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "Organic Tomatoes", sales: 156, revenue: "₹23,400" },
                  { name: "Fresh Carrots", sales: 134, revenue: "₹18,900" },
                  { name: "Green Peppers", sales: 98, revenue: "₹14,700" }
                ].map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.sales} sales</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{product.revenue}</p>
                      <div className="flex items-center text-yellow-600">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        <span className="text-xs">4.8</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <Tabs value={getTabFromPath(location.pathname)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="seller-products" asChild>
              <Link to="/admin" className="flex items-center space-x-2">
                <Package className="h-4 w-4" />
                <span>Seller Products</span>
              </Link>
            </TabsTrigger>
            <TabsTrigger value="my-products" asChild>
              <Link to="/admin/my-products" className="flex items-center space-x-2">
                <ShoppingCart className="h-4 w-4" />
                <span>My Products</span>
              </Link>
            </TabsTrigger>
            <TabsTrigger value="analytics" asChild>
              <Link to="/admin/analytics" className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Analytics</span>
              </Link>
            </TabsTrigger>
            <TabsTrigger value="gemini" asChild>
              <Link to="/admin/gemini" className="flex items-center space-x-2">
                <Brain className="h-4 w-4" />
                <span>AI Analysis</span>
              </Link>
            </TabsTrigger>
          </TabsList>

          {getTabFromPath(location.pathname) === 'seller-products' && (
            <TabsContent value="seller-products">
              <SellerProducts />
            </TabsContent>
          )}
          
          {getTabFromPath(location.pathname) === 'my-products' && (
            <TabsContent value="my-products">
              <AdminProducts />
            </TabsContent>
          )}
          
          {getTabFromPath(location.pathname) === 'analytics' && (
            <TabsContent value="analytics">
              <AdminAnalytics />
            </TabsContent>
          )}
          
          {getTabFromPath(location.pathname) === 'gemini' && (
            <TabsContent value="gemini">
              <GeminiAnalysis />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
