import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Trash2, ShoppingBag, CreditCard } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';

export default function Cart() {
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingPhone, setShippingPhone] = useState('');
  const queryClient = useQueryClient();

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const response = await api.get('/orders/cart/');
      return response.data;
    },
  });

  const updateCartItemMutation = useMutation({
    mutationFn: async ({ itemId, quantity }) => {
      const response = await api.put(`/orders/cart/items/${itemId}/`, {
        quantity: quantity
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['cart']);
    },
    onError: (error) => {
      toast.error('Failed to update cart item');
      console.error('Error updating cart item:', error);
    },
  });

  const removeCartItemMutation = useMutation({
    mutationFn: async (itemId) => {
      const response = await api.delete(`/orders/cart/items/${itemId}/`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['cart']);
      toast.success('Item removed from cart');
    },
    onError: (error) => {
      toast.error('Failed to remove item from cart');
      console.error('Error removing cart item:', error);
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: async (checkoutData) => {
      const response = await api.post('/orders/checkout/', checkoutData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['cart']);
      queryClient.invalidateQueries(['orders']);
      toast.success('Order placed successfully!');
    },
    onError: (error) => {
      toast.error('Failed to place order');
      console.error('Error placing order:', error);
    },
  });

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeCartItemMutation.mutate(itemId);
    } else {
      updateCartItemMutation.mutate({ itemId, quantity: newQuantity });
    }
  };

  const handleCheckout = () => {
    if (!shippingAddress || !shippingPhone) {
      toast.error('Please provide shipping address and phone number');
      return;
    }

    checkoutMutation.mutate({
      shipping_address: shippingAddress,
      shipping_phone: shippingPhone
    });
  };

  const totalAmount = cart?.items?.reduce((total, item) => {
    return total + (item.product.relist_price * item.quantity);
  }, 0) || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShoppingBag className="h-5 w-5" />
            <span>Shopping Cart</span>
          </CardTitle>
          <CardDescription>
            Review your items before checkout
          </CardDescription>
        </CardHeader>
        <CardContent>
          {cart?.items && cart.items.length > 0 ? (
            <div className="space-y-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.product.name}</div>
                          <div className="text-sm text-gray-500">
                            {item.product.category_name}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>₹{item.product.relist_price}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          >
                            +
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>₹{item.product.relist_price * item.quantity}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeCartItemMutation.mutate(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total Amount:</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-600">Add some products to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Checkout Section */}
      {cart?.items && cart.items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Checkout</CardTitle>
            <CardDescription>
              Provide shipping details to complete your order
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shipping Address
              </label>
              <Input
                placeholder="Enter your shipping address"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <Input
                placeholder="Enter your phone number"
                value={shippingPhone}
                onChange={(e) => setShippingPhone(e.target.value)}
              />
            </div>
            <Button 
              className="w-full" 
              size="lg"
              onClick={handleCheckout}
              disabled={checkoutMutation.isPending}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {checkoutMutation.isPending ? 'Processing...' : 'Proceed to Payment'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
