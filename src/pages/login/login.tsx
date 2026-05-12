import { View, Text } from '@tarojs/components';
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
    token: string;
    user: {
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
  };
}

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
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
        // 保存 token
        try {
          localStorage.setItem('token', loginRes.data.token);
        } catch (e) {
          console.error('保存token失败:', e);
        }
        
        // 保存用户信息到 store
        const { user } = loginRes.data;
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
        
        // 跳转到首页
        Taro.redirectTo({ url: '/pages/index/index' });
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

  return (
    <View className="login-container">
      <View className="login-content">
        <Text className="login-title block">海豚电竞</Text>
        <Text className="login-subtitle block">任务管理系统</Text>
        
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
          </CardContent>
        </Card>
      </View>
    </View>
  );
};

export default LoginPage;
