import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import ImageUpload from '../ui/ImageUpload';
import api from '../../lib/api';

export default function EditProduct() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    quantity: '',
    status: 'ACTIVE'
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch product details
  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await api.get(`/products/${id}/`);
      return response.data;
    },
    enabled: !!id,
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const response = await api.get('/products/categories/');
        return response.data;
      } catch (error) {
        console.error('Error fetching categories:', error);
        return [
          { id: 1, name: 'Electronics' },
          { id: 2, name: 'Clothing' },
          { id: 3, name: 'Home & Garden' },
          { id: 4, name: 'Sports' },
          { id: 5, name: 'Books' },
          { id: 6, name: 'Health & Beauty' },
          { id: 7, name: 'Automotive' },
          { id: 8, name: 'Toys' }
        ];
      }
    },
    select: (data) => {
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.results)) return data.results;
      if (data && Array.isArray(data.categories)) return data.categories;
      return [];
    },
  });

  // Update form data when product is loaded
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        category: (product.category?._id || product.category || '').toString(),
        price: product.price?.toString() || '',
        quantity: product.quantity?.toString() || '',
        status: product.status || 'ACTIVE'
      });

      // Convert product images to the format expected by ImageUpload
      if (product.images && product.images.length > 0) {
        const formattedImages = product.images.map((img, index) => ({
          id: img.id || `existing-${index}`,
          preview: img.image,
          isPrimary: img.is_primary || false,
          isUploading: false,
          isExisting: true
        }));
        setImages(formattedImages);
      }
    }
  }, [product]);

  const updateProductMutation = useMutation({
    mutationFn: async (productData) => {
      const formData = new FormData();
      
      // Add basic product data
      Object.keys(productData).forEach(key => {
        if (key !== 'images' && productData[key] !== null && productData[key] !== undefined) {
          formData.append(key, productData[key]);
        }
      });
      
      // Add primary image if exists and is new
      const primaryImage = images.find(img => img.isPrimary && !img.isExisting);
      if (primaryImage && primaryImage.file) {
        formData.append('image', primaryImage.file);
      }
      
      const response = await api.patch(`/products/${id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Upload new images
      const newImages = images.filter(img => img.file && !img.isExisting);
      for (const image of newImages) {
        const imageFormData = new FormData();
        imageFormData.append('image', image.file);
        imageFormData.append('is_primary', image.isPrimary.toString());
        
        try {
          await api.post(`/products/${id}/images/`, imageFormData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        } catch (error) {
          console.warn('Failed to upload additional image:', error);
        }
      }
      
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['seller-products']);
      queryClient.invalidateQueries(['seller-stats']);
      queryClient.invalidateQueries(['product', id]);
      toast.success('Product updated successfully!');
      navigate('/seller');
    },
    onError: (error) => {
      toast.error('Failed to update product');
      console.error('Error updating product:', error);
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: async (imageId) => {
      await api.delete(`/products/${id}/images/${imageId}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['product', id]);
      toast.success('Image deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete image');
      console.error('Error deleting image:', error);
    },
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCategoryChange = (value) => {
    setFormData({
      ...formData,
      category: value,
    });
  };

  const handleImageChange = (newImages) => {
    setImages(newImages);
  };

  const handleDeleteImage = (imageId) => {
    const image = images.find(img => img.id === imageId);
    if (image && image.isExisting) {
      deleteImageMutation.mutate(imageId);
    }
    setImages(images.filter(img => img.id !== imageId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Product description is required');
      return;
    }
    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }
    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    setLoading(true);

    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity),
      images: images,
    };

    updateProductMutation.mutate(productData);
  };

  if (productLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Product not found</p>
        <Button onClick={() => navigate('/seller')} className="mt-4">
          Back to Products
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Edit Product</span>
            <Badge variant="secondary">Step {activeTab === 'basic' ? '1' : '2'} of 2</Badge>
          </CardTitle>
          <CardDescription>
            Update your product information and images
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="images">Images & Media</TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit} className="space-y-6">
              <TabsContent value="basic" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Product Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter product name"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select value={formData.category} onValueChange={handleCategoryChange}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.isArray(categories) && categories.map((category) => (
                            <SelectItem key={(category._id || category.id)} value={(category._id || category.id).toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Price (₹) *</Label>
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          step="0.01"
                          required
                          value={formData.price}
                          onChange={handleChange}
                          placeholder="0.00"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="quantity">Quantity *</Label>
                        <Input
                          id="quantity"
                          name="quantity"
                          type="number"
                          required
                          value={formData.quantity}
                          onChange={handleChange}
                          placeholder="0"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DRAFT">Draft</SelectItem>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="INACTIVE">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      name="description"
                      required
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe your product in detail..."
                      rows={8}
                      className="mt-1"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="images" className="space-y-6">
                <div>
                  <Label className="text-base font-medium">Product Images</Label>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    Upload high-quality images of your product. The first image will be used as the primary image.
                  </p>
                  <ImageUpload
                    images={images}
                    onImagesChange={handleImageChange}
                    maxImages={5}
                    className="mt-4"
                    onDeleteImage={handleDeleteImage}
                  />
                </div>
              </TabsContent>

              <div className="flex justify-between pt-6 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/seller')}
                >
                  Cancel
                </Button>
                <div className="flex space-x-3">
                  {activeTab === 'basic' && (
                    <Button 
                      type="button" 
                      onClick={() => setActiveTab('images')}
                      variant="outline"
                    >
                      Next: Manage Images
                    </Button>
                  )}
                  {activeTab === 'images' && (
                    <Button 
                      type="button" 
                      onClick={() => setActiveTab('basic')}
                      variant="outline"
                    >
                      Back: Basic Info
                    </Button>
                  )}
                  <Button 
                    type="submit" 
                    disabled={loading || updateProductMutation.isPending}
                    className="min-w-[120px]"
                  >
                    {loading || updateProductMutation.isPending ? 'Updating...' : 'Update Product'}
                  </Button>
                </div>
              </div>
            </form>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
