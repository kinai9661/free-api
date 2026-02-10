'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Button from '@/components/base/Button';
import Input from '@/components/base/Input';
import Card from '@/components/base/Card';
import Modal from '@/components/base/Modal';
import Table from '@/components/base/Table';
import { ApiKey, Permission, RateLimit } from '@/types';

export default function ApiKeysPage() {
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyPermissions, setNewKeyPermissions] = useState<Permission[]>([
    { type: 'chat', enabled: true },
    { type: 'image', enabled: true },
    { type: 'audio', enabled: false },
    { type: 'admin', enabled: false },
  ]);
  const [newKeyRateLimit, setNewKeyRateLimit] = useState<RateLimit>({
    requestsPerMinute: 100,
    tokensPerMinute: 10000,
  });
  const [createdKey, setCreatedKey] = useState<ApiKey | null>(null);

  const handleLogin = async () => {
    if (!adminPassword) return;

    try {
      const response = await fetch('/api/apikeys', {
        method: 'GET',
        headers: {
          'X-Admin-Password': adminPassword,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setApiKeys(data.data);
        setIsAuthenticated(true);
      } else {
        alert('管理員密碼錯誤');
      }
    } catch (error) {
      alert('登入失敗');
    }
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/apikeys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': adminPassword,
        },
        body: JSON.stringify({
          name: newKeyName,
          permissions: newKeyPermissions,
          rateLimit: newKeyRateLimit,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCreatedKey(data.data);
        setShowCreateModal(false);
        setNewKeyName('');
        // Reload keys
        await loadApiKeys();
      } else {
        alert('創建失敗');
      }
    } catch (error) {
      alert('創建失敗');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteKey = async (key: string) => {
    if (!confirm('確定要刪除此 API Key 嗎？')) return;

    try {
      const response = await fetch('/api/apikeys', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': adminPassword,
        },
        body: JSON.stringify({ key }),
      });

      if (response.ok) {
        await loadApiKeys();
      } else {
        alert('刪除失敗');
      }
    } catch (error) {
      alert('刪除失敗');
    }
  };

  const loadApiKeys = async () => {
    try {
      const response = await fetch('/api/apikeys', {
        method: 'GET',
        headers: {
          'X-Admin-Password': adminPassword,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setApiKeys(data.data);
      }
    } catch (error) {
      console.error('Failed to load API keys:', error);
    }
  };

  const togglePermission = (type: string) => {
    setNewKeyPermissions((prev) =>
      prev.map((p) => (p.type === type ? { ...p, enabled: !p.enabled } : p))
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card variant="elevated" className="w-full max-w-md">
          <Card.Header>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              管理員登入
            </h2>
          </Card.Header>
          <Card.Body>
            <div className="space-y-4">
              <Input
                label="管理員密碼"
                type="password"
                placeholder="輸入管理員密碼"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
              <Button onClick={handleLogin} className="w-full">
                登入
              </Button>
            </div>
          </Card.Body>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            API Keys 管理
          </h1>
          <Button onClick={() => setShowCreateModal(true)}>
            創建新 API Key
          </Button>
        </div>

        <Card variant="bordered">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>名稱</Table.Head>
                <Table.Head>API Key</Table.Head>
                <Table.Head>權限</Table.Head>
                <Table.Head>限流</Table.Head>
                <Table.Head>狀態</Table.Head>
                <Table.Head>使用量</Table.Head>
                <Table.Head>操作</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {apiKeys.map((apiKey) => (
                <Table.Row key={apiKey.id}>
                  <Table.Cell>{apiKey.name}</Table.Cell>
                  <Table.Cell>
                    <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      {apiKey.key}
                    </code>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex gap-1 flex-wrap">
                      {apiKey.permissions.map((p) => (
                        <span
                          key={p.type}
                          className={`text-xs px-2 py-1 rounded ${
                            p.enabled
                              ? 'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-300'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                          }`}
                        >
                          {p.type}
                        </span>
                      ))}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="text-sm">
                      <div>{apiKey.rateLimit.requestsPerMinute} 請求/分鐘</div>
                      <div>{apiKey.rateLimit.tokensPerMinute} Tokens/分鐘</div>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        apiKey.isActive
                          ? 'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-300'
                          : 'bg-error-100 text-error-800 dark:bg-error-900/20 dark:text-error-300'
                      }`}
                    >
                      {apiKey.isActive ? '啟用' : '停用'}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="text-sm">
                      <div>{apiKey.usage.totalRequests} 總請求</div>
                      <div>{apiKey.usage.totalTokens} 總 Tokens</div>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Button
                      variant="error"
                      size="sm"
                      onClick={() => handleDeleteKey(apiKey.key)}
                    >
                      刪除
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Card>

        {/* Create Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="創建新 API Key"
          size="lg"
        >
          <div className="space-y-4">
            <Input
              label="名稱"
              placeholder="輸入 API Key 名稱"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                權限
              </label>
              <div className="space-y-2">
                {newKeyPermissions.map((permission) => (
                  <label key={permission.type} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={permission.enabled}
                      onChange={() => togglePermission(permission.type)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {permission.type}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="請求限流 (每分鐘)"
                type="number"
                value={newKeyRateLimit.requestsPerMinute}
                onChange={(e) =>
                  setNewKeyRateLimit({
                    ...newKeyRateLimit,
                    requestsPerMinute: parseInt(e.target.value) || 0,
                  })
                }
              />
              <Input
                label="Token 限流 (每分鐘)"
                type="number"
                value={newKeyRateLimit.tokensPerMinute}
                onChange={(e) =>
                  setNewKeyRateLimit({
                    ...newKeyRateLimit,
                    tokensPerMinute: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
                取消
              </Button>
              <Button onClick={handleCreateKey} isLoading={isLoading}>
                創建
              </Button>
            </div>
          </div>
        </Modal>

        {/* Created Key Modal */}
        <Modal
          isOpen={!!createdKey}
          onClose={() => setCreatedKey(null)}
          title="API Key 創建成功"
          size="md"
        >
          {createdKey && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  API Key
                </label>
                <div className="flex gap-2">
                  <Input
                    value={createdKey.key}
                    readOnly
                    className="flex-1 font-mono text-sm"
                  />
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(createdKey.key);
                      alert('已複製到剪貼簿');
                    }}
                  >
                    複製
                  </Button>
                </div>
              </div>
              <p className="text-sm text-warning-600 dark:text-warning-400">
                ⚠️ 請妥善保存此 API Key，之後將無法再次查看完整金鑰。
              </p>
              <Button onClick={() => setCreatedKey(null)} className="w-full">
                確定
              </Button>
            </div>
          )}
        </Modal>
      </main>
    </div>
  );
}
