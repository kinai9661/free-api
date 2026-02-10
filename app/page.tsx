import Link from 'next/link';
import Header from '@/components/layout/Header';
import Button from '@/components/base/Button';
import Card from '@/components/base/Card';

export default function HomePage() {
  const features = [
    {
      icon: '💬',
      title: '聊天完成',
      description: '支援多種 AI 模型進行對話，包括 GPT-4、Claude 等',
      link: '/chat',
    },
    {
      icon: '🎨',
      title: '圖片生成',
      description: '使用 DALL-E、Stable Diffusion 等模型生成高品質圖片',
      link: '/image',
    },
    {
      icon: '🔑',
      title: 'API Key 管理',
      description: '安全地管理多個 API Key，設定權限和限流',
      link: '/apikeys',
    },
    {
      icon: '📊',
      title: '實時監控',
      description: '監控 API 使用情況、請求統計和系統狀態',
      link: '/monitoring',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            API Gateway
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            統一的 API 輸出站，整合聊天、圖片生成等功能
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/chat">
              <Button size="lg">開始使用</Button>
            </Link>
            <Link href="/apikeys">
              <Button variant="secondary" size="lg">管理 API Keys</Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {features.map((feature) => (
            <Link key={feature.title} href={feature.link}>
              <Card variant="bordered" className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <Card.Body>
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </Card.Body>
              </Card>
            </Link>
          ))}
        </div>

        {/* API Documentation */}
        <Card variant="bordered">
          <Card.Header>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              API 文檔
            </h2>
          </Card.Header>
          <Card.Body>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  聊天完成 API
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  發送聊天請求並獲取 AI 回應
                </p>
                <div className="bg-gray-900 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-gray-100">
                    <code>{`POST /api/chat
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "model": "gpt-4",
  "messages": [
    { "role": "user", "content": "Hello!" }
  ],
  "stream": false
}`}</code>
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  圖片生成 API
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  根據提示詞生成圖片
                </p>
                <div className="bg-gray-900 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-gray-100">
                    <code>{`POST /api/image
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "model": "dall-e-3",
  "prompt": "A beautiful sunset",
  "n": 1,
  "size": "1024x1024"
}`}</code>
                  </pre>
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-500 dark:text-gray-400">
          <p>© 2024 API Gateway. Powered by api.airforce</p>
        </div>
      </main>
    </div>
  );
}
