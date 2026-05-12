import { View, Text, Image } from '@tarojs/components';
import { useState } from 'react';
import Taro from '@tarojs/taro';
import { Network } from '@/network';
import { useAppStore, UserRole, UserStatus } from '@/store/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
        
        Taro.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 2000
        });
        
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

  const fillTestAccount = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setError('');
  };

  return (
    <View className="login-page">
      {/* 大Logo - 占满上方 */}
      <View className="logo-area">
        <Image
          className="big-logo"
          src="https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2F%E6%B5%B7%E8%B1%9A%E7%94%B5%E7%AB%9E14.jpg&nonce=24df1f4f-4a4a-4254-9697-38de43f14ac4&project_id=7638923900340011058&sign=91356f11e310cfdfba6726d6c1787f790ca9ab5d842923a016a7a9ce0a0b8468"
          mode="aspectFit"
        />
      </View>
      
      {/* 任务管理系统标题 */}
      <Text className="system-title block">任务管理系统</Text>

      {/* 登录表单 - 简洁 */}
      <View className="login-form">
        <View className="input-group">
          <Input
            className="login-input"
            placeholder="用户名"
            value={username}
            onInput={(e) => setUsername(e.detail.value)}
          />
        </View>
        
        <View className="input-group">
          <Input
            className="login-input"
            password
            placeholder="密码"
            value={password}
            onInput={(e) => setPassword(e.detail.value)}
          />
        </View>
        
        {error && (
          <Text className="error-msg block">{error}</Text>
        )}
        
        <Button
          className="login-btn"
          onClick={handleLogin}
          disabled={loading}
        >
          <Text className="btn-text">{loading ? '登录中...' : '登 录'}</Text>
        </Button>
        
        <Text
          className="register-link block"
          onClick={() => Taro.navigateTo({ url: '/pages/register/register' })}
        >
          还没有账号？立即注册
        </Text>
      </View>

      {/* 测试账号 */}
      <View className="test-area">
        <Text 
          className="test-toggle block"
          onClick={() => setShowTestAccounts(!showTestAccounts)}
        >
          {showTestAccounts ? '收起 ▲' : '测试账号 ▼'}
        </Text>
        
        {showTestAccounts && (
          <View className="test-list">
            <View className="test-item" onClick={() => fillTestAccount('boss', 'woshibobo')}>
              <Text className="test-text block">管理员：boss / woshibobo</Text>
            </View>
            <View className="test-item" onClick={() => fillTestAccount('zhanglei', 'dolphin2024')}>
              <Text className="test-text block">店长：zhanglei / dolphin2024</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default LoginPage;
