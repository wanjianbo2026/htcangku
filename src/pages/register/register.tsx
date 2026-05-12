import { View, Text } from '@tarojs/components';
import { useState } from 'react';
import Taro from '@tarojs/taro';
import { Network } from '@/network';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import './register.css';

interface RegisterResponse {
  code: number;
  msg: string;
  data: {
    id: string;
    username: string;
    status: string;
  };
}

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('manager');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    // 验证
    if (!username.trim()) {
      setError('请输入用户名');
      return;
    }
    if (!password.trim()) {
      setError('请输入密码');
      return;
    }
    if (password.length < 6) {
      setError('密码至少6位');
      return;
    }
    if (password !== confirmPassword) {
      setError('两次密码不一致');
      return;
    }
    if (!nickname.trim()) {
      setError('请输入昵称');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await Network.request({
        url: '/api/user/create',
        method: 'POST',
        data: {
          username: username.trim(),
          password,
          nickname: nickname.trim(),
          phone: phone.trim() || undefined,
          role,
        },
      });
      
      console.log('注册响应:', res.data);
      
      const registerRes = res.data as RegisterResponse;
      
      if (registerRes.code === 200 && registerRes.data) {
        Taro.showModal({
          title: '注册成功',
          content: '您的账号已提交审核，请等待管理员审批后登录',
          showCancel: false,
          success: () => {
            Taro.redirectTo({ url: '/pages/login/login' });
          },
        });
      } else {
        setError(registerRes.msg || '注册失败');
      }
    } catch (err) {
      console.error('注册错误:', err);
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="register-container">
      <View className="register-content">
        <Text className="register-title block">海豚电竞</Text>
        <Text className="register-subtitle block">新用户注册</Text>
        
        <Card className="register-card">
          <CardHeader>
            <CardTitle className="block text-center">注册账号</CardTitle>
            <CardDescription className="block text-center">注册后需管理员审核</CardDescription>
          </CardHeader>
          <CardContent className="register-form">
            <View className="register-field">
              <Text className="register-label block">用户名 *</Text>
              <View className="register-input-wrapper">
                <Input
                  className="register-input"
                  placeholder="请输入用户名"
                  value={username}
                  onInput={(e) => setUsername(e.detail.value)}
                />
              </View>
            </View>
            
            <View className="register-field">
              <Text className="register-label block">昵称 *</Text>
              <View className="register-input-wrapper">
                <Input
                  className="register-input"
                  placeholder="请输入昵称"
                  value={nickname}
                  onInput={(e) => setNickname(e.detail.value)}
                />
              </View>
            </View>
            
            <View className="register-field">
              <Text className="register-label block">密码 *</Text>
              <View className="register-input-wrapper">
                <Input
                  className="register-input"
                  password
                  placeholder="请输入密码（至少6位）"
                  value={password}
                  onInput={(e) => setPassword(e.detail.value)}
                />
              </View>
            </View>
            
            <View className="register-field">
              <Text className="register-label block">确认密码 *</Text>
              <View className="register-input-wrapper">
                <Input
                  className="register-input"
                  password
                  placeholder="请再次输入密码"
                  value={confirmPassword}
                  onInput={(e) => setConfirmPassword(e.detail.value)}
                />
              </View>
            </View>
            
            <View className="register-field">
              <Text className="register-label block">手机号码（选填）</Text>
              <View className="register-input-wrapper">
                <Input
                  className="register-input"
                  type="number"
                  placeholder="选填"
                  value={phone}
                  onInput={(e) => setPhone(e.detail.value)}
                />
              </View>
            </View>
            
            <View className="register-field">
              <Text className="register-label block">角色 *</Text>
              <View className="register-role-wrapper">
                <Button
                  className={`register-role-btn ${role === 'manager' ? 'active' : ''}`}
                  size="sm"
                  variant={role === 'manager' ? 'default' : 'outline'}
                  onClick={() => setRole('manager')}
                >
                  <Text>店长</Text>
                </Button>
                <Button
                  className={`register-role-btn ${role === 'supervisor' ? 'active' : ''}`}
                  size="sm"
                  variant={role === 'supervisor' ? 'default' : 'outline'}
                  onClick={() => setRole('supervisor')}
                >
                  <Text>督导专员</Text>
                </Button>
                <Button
                  className={`register-role-btn ${role === 'regional_manager' ? 'active' : ''}`}
                  size="sm"
                  variant={role === 'regional_manager' ? 'default' : 'outline'}
                  onClick={() => setRole('regional_manager')}
                >
                  <Text>区域经理</Text>
                </Button>
              </View>
            </View>
            
            {error && (
              <Text className="register-error block">{error}</Text>
            )}
            
            <Button
              className="register-button"
              onClick={handleRegister}
              disabled={loading}
            >
              <Text>{loading ? '注册中...' : '提交注册'}</Text>
            </Button>
            
            <View className="register-footer">
              <Text
                className="register-link"
                onClick={() => Taro.redirectTo({ url: '/pages/login/login' })}
              >
                已有账号？去登录
              </Text>
            </View>
          </CardContent>
        </Card>
      </View>
    </View>
  );
};

export default RegisterPage;
