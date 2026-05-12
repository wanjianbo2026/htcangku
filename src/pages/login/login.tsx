import { View, Text, Image } from '@tarojs/components';
import { useState } from 'react';
import Taro from '@tarojs/taro';
import { Network } from '@/network';
import { useAppStore, UserRole, UserStatus } from '@/store/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import './login.css';

interface LoginResponse {
  code: number;
  msg: string;
  data: {
    id: string;
    username: string;
    nickname: string;
    role: string;
    status: string;
    phone?: string;
    storeId?: string;
    storeName?: string;
    region?: string;
    totalScore: number;
    createdAt: string;
    updatedAt: string;
  };
}

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTestAccounts, setShowTestAccounts] = useState(false);
  
  const setUserInfo = useAppStore((state) => state.setUserInfo);

  const handleLogin = async () => {
    if (!username.trim()) {
      setError('请输入用户名');
      return;
    }
    if (!password.trim()) {
      setError('请输入密码');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await Network.request({
        url: '/api/user/login',
        method: 'POST',
        data: { username: username.trim(), password },
      });
      
      console.log('登录响应:', res.data);
      
      const loginRes = res.data as LoginResponse;
      
      if (loginRes.code === 200 && loginRes.data) {
        // 保存用户信息到 store
        const { ...user } = loginRes.data;
        setUserInfo({
          id: user.id,
          username: user.username,
          nickname: user.nickname,
          role: user.role as UserRole,
          status: user.status as UserStatus,
          phone: user.phone,
          storeId: user.storeId,
          storeName: user.storeName,
          region: user.region,
          totalScore: user.totalScore,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        });
        
        // 显示成功提示
        Taro.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 2000
        });
        
        // 延迟跳转，让用户看到成功提示
        setTimeout(() => {
          Taro.redirectTo({ url: '/pages/index/index' });
        }, 500);
      } else {
        setError(loginRes.msg || '登录失败');
      }
    } catch (err) {
      console.error('登录错误:', err);
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 快速填充测试账号
  const fillTestAccount = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setError('');
  };

  return (
    <View className="login-container">
      <View className="login-content">
        {/* Logo区域 */}
        <View className="login-header">
          <View className="login-logo">
            <Image
              className="login-logo-image"
              src="https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2F%E6%B5%B7%E8%B1%9A%E7%94%B5%E7%AB%9E14.jpg&nonce=24df1f4f-4a4a-4254-9697-38de43f14ac4&project_id=7638923900340011058&sign=91356f11e310cfdfba6726d6c1787f790ca9ab5d842923a016a7a9ce0a0b8468"
              mode="aspectFill"
            />
          </View>
          <Text className="login-subtitle block">任务管理系统</Text>
        </View>
        
        <Card className="login-card">
          <CardHeader>
            <CardTitle className="block text-center">登录</CardTitle>
            <CardDescription className="block text-center">请输入账号密码</CardDescription>
          </CardHeader>
          <CardContent className="login-form">
            <View className="login-field">
              <Text className="login-label block">用户名</Text>
              <View className="login-input-wrapper">
                <Input
                  className="login-input"
                  placeholder="请输入用户名"
                  value={username}
                  onInput={(e) => setUsername(e.detail.value)}
                />
              </View>
            </View>
            
            <View className="login-field">
              <Text className="login-label block">密码</Text>
              <View className="login-input-wrapper">
                <Input
                  className="login-input"
                  password
                  placeholder="请输入密码"
                  value={password}
                  onInput={(e) => setPassword(e.detail.value)}
                />
              </View>
            </View>
            
            {error && (
              <Text className="login-error block">{error}</Text>
            )}
            
            <Button
              className="login-button"
              onClick={handleLogin}
              disabled={loading}
            >
              <Text>{loading ? '登录中...' : '登录'}</Text>
            </Button>
            
            <View className="login-footer">
              <Text
                className="login-link"
                onClick={() => Taro.navigateTo({ url: '/pages/register/register' })}
              >
                没有账号？去注册
              </Text>
            </View>

            {/* 测试账号提示 */}
            <View className="login-test-accounts">
              <Text 
                className="login-test-toggle block"
                onClick={() => setShowTestAccounts(!showTestAccounts)}
              >
                {showTestAccounts ? '隐藏测试账号 ▲' : '显示测试账号 ▼'}
              </Text>
              
              {showTestAccounts && (
                <View className="login-test-list">
                  <Text className="login-test-title block">测试账号（点击自动填充）</Text>
                  <View className="login-test-item" onClick={() => fillTestAccount('boss', 'woshibobo')}>
                    <Text className="block">超级管理员：boss / woshibobo</Text>
                  </View>
                  <View className="login-test-item" onClick={() => fillTestAccount('regional', 'dolphin2024')}>
                    <Text className="block">区域经理：regional / dolphin2024</Text>
                  </View>
                  <View className="login-test-item" onClick={() => fillTestAccount('supervisor', 'dolphin2024')}>
                    <Text className="block">督导专员：supervisor / dolphin2024</Text>
                  </View>
                  <View className="login-test-item" onClick={() => fillTestAccount('zhanglei', 'dolphin2024')}>
                    <Text className="block">店长：zhanglei / dolphin2024</Text>
                  </View>
                </View>
              )}
            </View>
          </CardContent>
        </Card>
      </View>
    </View>
  );
};

export default LoginPage;
