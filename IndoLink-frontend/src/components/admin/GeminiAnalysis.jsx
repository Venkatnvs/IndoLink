import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Brain, Sparkles, TrendingUp, DollarSign } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';

export default function GeminiAnalysis() {
  const [selectedProduct, setSelectedProduct] = useState('');
  const queryClient = useQueryClient();

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['seller-products-for-admin'],
    queryFn: async () => {
      const response = await api.get('/products/seller-products/');
      return response.data;
    },
  });

  const { data: analyses, isLoading: analysesLoading } = useQuery({
    queryKey: ['gemini-analyses'],
    queryFn: async () => {
      const response = await api.get('/analytics/analyze-product/1/'); // This would need to be dynamic
      return response.data;
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: async (productId) => {
      const response = await api.post(`/analytics/analyze-product/${productId}/`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['gemini-analyses']);
      toast.success('AI analysis completed!');
    },
    onError: (error) => {
      toast.error('Failed to analyze product');
      console.error('Error analyzing product:', error);
    },
  });

  const handleAnalyze = () => {
    if (selectedProduct) {
      analyzeMutation.mutate(selectedProduct);
    }
  };

  const getConfidenceColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (productsLoading) {
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
      {/* AI Analysis Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>AI Market Analysis</span>
          </CardTitle>
          <CardDescription>
            Use Gemini AI to analyze market trends and get pricing recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-4">
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select a product to analyze" />
              </SelectTrigger>
              <SelectContent>
                {products?.map((product) => (
                  <SelectItem key={product.id} value={product.id.toString()}>
                    {product.name} - ₹{product.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={handleAnalyze}
              disabled={!selectedProduct || analyzeMutation.isPending}
              className="flex items-center space-x-2"
            >
              <Sparkles className="h-4 w-4" />
              <span>{analyzeMutation.isPending ? 'Analyzing...' : 'Analyze'}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analyses && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>
              AI-powered insights and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-3">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">Market Trend</h3>
                <Badge className="bg-blue-100 text-blue-800">
                  {analyses.market_trend || 'N/A'}
                </Badge>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-3">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">Recommended Price</h3>
                <p className="text-2xl font-bold text-green-600">
                  ₹{analyses.recommended_price || 'N/A'}
                </p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-3">
                  <Brain className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">Confidence Score</h3>
                <Badge className={getConfidenceColor(analyses.confidence_score)}>
                  {analyses.confidence_score || 0}%
                </Badge>
              </div>
            </div>
            
            {analyses.insights && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Key Insights</h4>
                <p className="text-gray-700">{analyses.insights}</p>
              </div>
            )}
            
            {analyses.recommendations && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Recommendations</h4>
                <p className="text-blue-800">{analyses.recommendations}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Analysis History */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis History</CardTitle>
          <CardDescription>
            Previous AI analyses and their outcomes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No analyses yet</h3>
            <p className="text-gray-600">Run your first AI analysis to see results here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
