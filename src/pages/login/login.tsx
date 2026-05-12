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
    <View className="login-page">
      {/* Logo区域 - 顶部居中 */}
      <View className="logo-section">
        <View className="logo-wrapper">
          <Image
            className="logo-image"
            src="https://coze-coding-project.tos.coze.site/coze_storage_7638924372748632090/dolphin-logo_527cc007.png?sign=2093949670-26a94152f7-0-e269c3d91b839ced128ae83468ab1bd71e4e8ed37616e5f1d386a408e897cd3e"
            mode="aspectFit"
          />
        </View>
        <Text className="page-title block">任务管理系统</Text>
      </View>

      {/* 登录表单区域 */}
      <View className="form-section">
        <View className="form-card">
          <View className="form-header">
            <Text className="form-title block">账号登录</Text>
          </View>
          
          <View className="form-body">
            <View className="form-item">
              <Text className="form-label block">用户名</Text>
              <View className="input-box">
                <Input
                  className="form-input"
                  placeholder="请输入用户名"
                  value={username}
                  onInput={(e) => setUsername(e.detail.value)}
                />
              </View>
            </View>
            
            <View className="form-item">
              <Text className="form-label block">密码</Text>
              <View className="input-box">
                <Input
                  className="form-input"
                  password
                  placeholder="请输入密码"
                  value={password}
                  onInput={(e) => setPassword(e.detail.value)}
                />
              </View>
            </View>
            
            {error && (
              <View className="error-box">
                <Text className="error-text block">{error}</Text>
              </View>
            )}
            
            <Button
              className="submit-btn"
              onClick={handleLogin}
              disabled={loading}
            >
              <Text className="submit-text">{loading ? '登录中...' : '登 录'}</Text>
            </Button>
            
            <View className="form-footer">
              <Text
                className="register-link"
                onClick={() => Taro.navigateTo({ url: '/pages/register/register' })}
              >
                还没有账号？立即注册
              </Text>
            </View>
          </View>
        </View>

        {/* 测试账号提示 */}
        <View className="test-section">
          <Text 
            className="test-toggle block"
            onClick={() => setShowTestAccounts(!showTestAccounts)}
          >
            {showTestAccounts ? '收起测试账号 ▲' : '展开测试账号 ▼'}
          </Text>
          
          {showTestAccounts && (
            <View className="test-list">
              <View className="test-item" onClick={() => fillTestAccount('boss', 'woshibobo')}>
                <Text className="test-text block">超级管理员：boss / woshibobo</Text>
              </View>
              <View className="test-item" onClick={() => fillTestAccount('regional', 'dolphin2024')}>
                <Text className="test-text block">区域经理：regional / dolphin2024</Text>
              </View>
              <View className="test-item" onClick={() => fillTestAccount('supervisor', 'dolphin2024')}>
                <Text className="test-text block">督导专员：supervisor / dolphin2024</Text>
              </View>
              <View className="test-item" onClick={() => fillTestAccount('zhanglei', 'dolphin2024')}>
                <Text className="test-text block">店长：zhanglei / dolphin2024</Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default LoginPage;
