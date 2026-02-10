'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Button from '@/components/base/Button';
import Input from '@/components/base/Input';
import Card from '@/components/base/Card';
import { SystemStats, MonitoringData } from '@/types';

export default function MonitoringPage() {
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'hour' | 'day' | 'week' | 'month'>('day');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!adminPassword) return;

    try {
      const response = await fetch(`/api/monitoring?period=${selectedPeriod}`, {
        method: 'GET',
        headers: {
          'X-Admin-Password': adminPassword,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSystemStats(data.system);
        setIsAuthenticated(true);
      } else {
        alert('管理員密碼錯誤');
      }
    } catch (error) {
      alert('登入失敗');
    }
  };

  const loadMonitoringData = async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/monitoring?period=${selectedPeriod}`, {
        method: 'GET',
        headers: {
          'X-Admin-Password': adminPassword,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSystemStats(data.system);
      }
    } catch (error) {
      console.error('Failed to load monitoring data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadMonitoringData();
      // Auto refresh every 30 seconds
      const interval = setInterval(loadMonitoringData, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, selectedPeriod]);

  const StatCard = ({ title, value, unit = '', icon }: { title: string; value: number | string; unit?: string; icon: string }) => (
    <Card variant="bordered">
      <Card.Body>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
              {typeof value === 'number' ? value.toLocaleString() : value}
              {unit && <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>}
            </p>
          </div>
          <div className="text-3xl">{icon}</div>
        </div>
      </Card.Body>
    </Card>
  );

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
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            系統監控
          </h1>
          <div className="flex gap-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="hour">過去 1 小時</option>
              <option value="day">過去 1 天</option>
              <option value="week">過去 1 週</option>
              <option value="month">過去 1 個月</option>
            </select>
            <Button onClick={loadMonitoringData} isLoading={isLoading}>
              重新整理
            </Button>
          </div>
        </div>

        {systemStats && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard
                title="總請求數"
                value={systemStats.totalRequests}
                icon="📊"
              />
              <StatCard
                title="總 Tokens"
                value={systemStats.totalTokens}
                icon="🔢"
              />
              <StatCard
                title="錯誤數"
                value={systemStats.totalErrors}
                icon="❌"
              />
              <StatCard
                title="活躍 API Keys"
                value={systemStats.activeApiKeys}
                icon="🔑"
              />
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card variant="bordered">
                <Card.Header>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    平均響應時間
                  </h2>
                </Card.Header>
                <Card.Body>
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <p className="text-5xl font-bold text-primary-600 dark:text-primary-400">
                        {systemStats.avgResponseTime.toFixed(0)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        毫秒
                      </p>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              <Card variant="bordered">
                <Card.Header>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    系統狀態
                  </h2>
                </Card.Header>
                <Card.Body>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">系統狀態</span>
                      <span className="flex items-center gap-2 text-sm font-medium text-success-600 dark:text-success-400">
                        <span className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></span>
                        運行中
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">錯誤率</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {systemStats.totalRequests > 0
                          ? ((systemStats.totalErrors / systemStats.totalRequests) * 100).toFixed(2)
                          : '0.00'}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">每請求平均 Tokens</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {systemStats.totalRequests > 0
                          ? (systemStats.totalTokens / systemStats.totalRequests).toFixed(0)
                          : '0'}
                      </span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>

            {/* Request Distribution */}
            <Card variant="bordered">
              <Card.Header>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  請求分佈
                </h2>
              </Card.Header>
              <Card.Body>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">成功請求</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {systemStats.totalRequests - systemStats.totalErrors} / {systemStats.totalRequests}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-success-500 h-2 rounded-full transition-all"
                        style={{
                          width: `${systemStats.totalRequests > 0
                            ? ((systemStats.totalRequests - systemStats.totalErrors) / systemStats.totalRequests) * 100
                            : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">錯誤請求</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {systemStats.totalErrors} / {systemStats.totalRequests}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-error-500 h-2 rounded-full transition-all"
                        style={{
                          width: `${systemStats.totalRequests > 0
                            ? (systemStats.totalErrors / systemStats.totalRequests) * 100
                            : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
