import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Edit, Eye, TrendingUp } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';

export default function AdminProducts() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [relistPrice, setRelistPrice] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const response = await api.get('/products/');
      return response.data.results || response.data;
    },
  });

  const relistMutation = useMutation({
    mutationFn: async ({ productId, price }) => {
      const response = await api.post(`/products/${productId}/admin-relist/`, {
        relist_price: price
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-products']);
      toast.success('Product re-listed successfully!');
      setIsDialogOpen(false);
      setRelistPrice('');
    },
    onError: (error) => {
      toast.error('Failed to re-list product');
      console.error('Error re-listing product:', error);
    },
  });

  const handleRelist = (product) => {
    setSelectedProduct(product);
    setRelistPrice(product.relist_price || product.price);
    setIsDialogOpen(true);
  };

  const handleRelistSubmit = () => {
    if (selectedProduct && relistPrice) {
      relistMutation.mutate({
        productId: selectedProduct.id,
        price: parseFloat(relistPrice)
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800';
      case 'SOLD':
        return 'bg-blue-100 text-blue-800';
      case 'INACTIVE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
          <CardTitle>My Products</CardTitle>
          <CardDescription>
            Manage products you've purchased and re-listed for buyers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {products && products.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Original Seller</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Purchase Price</TableHead>
                  <TableHead>Re-list Price</TableHead>
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
                    <TableCell>
                      {product.relist_price ? `₹${product.relist_price}` : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(product.status)}>
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
                          variant="outline"
                          onClick={() => handleRelist(product)}
                        >
                          <TrendingUp className="h-4 w-4 mr-1" />
                          Re-list
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
              <p className="text-gray-600">Purchase products from sellers to start re-listing them</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Re-list Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Re-list Product</DialogTitle>
            <DialogDescription>
              Set the re-listing price for {selectedProduct?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="relist-price">Re-list Price (₹)</Label>
              <Input
                id="relist-price"
                type="number"
                step="0.01"
                value={relistPrice}
                onChange={(e) => setRelistPrice(e.target.value)}
                placeholder="Enter re-list price"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleRelistSubmit}
                disabled={relistMutation.isPending || !relistPrice}
              >
                {relistMutation.isPending ? 'Re-listing...' : 'Re-list Product'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
