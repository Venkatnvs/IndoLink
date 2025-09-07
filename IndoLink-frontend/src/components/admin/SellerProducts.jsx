import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { ShoppingCart, Eye, Package } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';

export default function SellerProducts() {
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ['seller-products-for-admin'],
    queryFn: async () => {
      try {
        const response = await api.get('/products/seller-products/');
        return response.data;
      } catch (error) {
        console.error('Error fetching seller products:', error);
        // Return empty array if API fails
        return [];
      }
    },
    select: (data) => {
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.results)) return data.results;
      return [];
    },
  });

  const purchaseMutation = useMutation({
    mutationFn: async (productId) => {
      const response = await api.post(`/products/${productId}/admin-purchase/`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['seller-products-for-admin']);
      queryClient.invalidateQueries(['admin-products']);
      toast.success('Product purchased successfully!');
    },
    onError: (error) => {
      toast.error('Failed to purchase product');
      console.error('Error purchasing product:', error);
    },
  });

  const handlePurchase = (productId) => {
    if (window.confirm('Are you sure you want to purchase this product?')) {
      purchaseMutation.mutate(productId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Products from Sellers</CardTitle>
          <CardDescription>
            Browse and purchase products from farmers to re-list in the marketplace
          </CardDescription>
        </CardHeader>
        <CardContent>
          {products && products.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {product.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{product.seller_name}</TableCell>
                    <TableCell>{product.category_name}</TableCell>
                    <TableCell>₹{product.price}</TableCell>
                    <TableCell>{product.quantity}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => handlePurchase(product.id)}
                          disabled={purchaseMutation.isPending}
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Purchase
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products available</h3>
              <p className="text-gray-600">No seller products are currently available for purchase</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
