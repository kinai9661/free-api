'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Button from '@/components/base/Button';
import Input from '@/components/base/Input';
import Card from '@/components/base/Card';
import { ImageData } from '@/types';

const models = [
  { id: 'dall-e-3', name: 'DALL-E 3' },
  { id: 'dall-e-2', name: 'DALL-E 2' },
  { id: 'stable-diffusion-xl', name: 'Stable Diffusion XL' },
];

const sizes = [
  { id: '1024x1024', name: '1024 x 1024' },
  { id: '1792x1024', name: '1792 x 1024' },
  { id: '1024x1792', name: '1024 x 1792' },
];

const qualities = [
  { id: 'standard', name: '標準' },
  { id: 'hd', name: '高清' },
];

export default function ImagePage() {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState(models[0].id);
  const [selectedSize, setSelectedSize] = useState(sizes[0].id);
  const [selectedQuality, setSelectedQuality] = useState(qualities[0].id);
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<ImageData[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return;

    if (!apiKey) {
      alert('請先輸入 API Key');
      return;
    }

    setIsLoading(true);
    setGeneratedImages([]);

    try {
      const response = await fetch('/api/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: selectedModel,
          prompt,
          n: 1,
          size: selectedSize,
          quality: selectedQuality,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || '請求失敗');
      }

      const data = await response.json();
      setGeneratedImages(data.data);
    } catch (error) {
      alert(`錯誤：${error instanceof Error ? error.message : '未知錯誤'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (imageUrl: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `generated-image-${Date.now()}.png`;
    link.target = '_blank';
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* API Key Input */}
        <Card variant="bordered" className="mb-6">
          <Input
            label="API Key"
            type="password"
            placeholder="輸入您的 API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </Card>

        {/* Generation Settings */}
        <Card variant="bordered" className="mb-6">
          <Card.Header>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              圖片生成設定
            </h2>
          </Card.Header>
          <Card.Body>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  提示詞
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="描述您想要生成的圖片..."
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    模型
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {models.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    尺寸
                  </label>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {sizes.map((size) => (
                      <option key={size.id} value={size.id}>
                        {size.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    品質
                  </label>
                  <select
                    value={selectedQuality}
                    onChange={(e) => setSelectedQuality(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {qualities.map((quality) => (
                      <option key={quality.id} value={quality.id}>
                        {quality.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                isLoading={isLoading}
                disabled={!prompt.trim()}
                className="w-full"
              >
                生成圖片
              </Button>
            </div>
          </Card.Body>
        </Card>

        {/* Generated Images */}
        {generatedImages.length > 0 && (
          <Card variant="bordered">
            <Card.Header>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                生成的圖片
              </h2>
            </Card.Header>
            <Card.Body>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generatedImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.url}
                      alt={`Generated image ${index + 1}`}
                      className="w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setSelectedImage(image)}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleDownload(image.url)}
                      >
                        下載
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        )}

        {/* Image Preview Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh]">
              <img
                src={selectedImage.url}
                alt="Preview"
                className="max-w-full max-h-[90vh] rounded-lg"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
