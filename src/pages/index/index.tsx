import { View, Text } from '@tarojs/components';
import { useEffect } from 'react';
import Taro from '@tarojs/taro';
import { useAppStore, UserRole } from '@/store/user';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import './index.css';

const IndexPage = () => {
  const userInfo = useAppStore((state) => state.userInfo);
  const isSuperAdmin = useAppStore((state) => state.isSuperAdmin);
  const isRegionalManager = useAppStore((state) => state.isRegionalManager);
  const isSupervisor = useAppStore((state) => state.isSupervisor);
  const initFromStorage = useAppStore((state) => state.initFromStorage);
  const logout = useAppStore((state) => state.logout);

  useEffect(() => {
    // 初始化用户信息
    initFromStorage();
    
    // 如果没有用户信息，跳转到登录页
    if (!userInfo) {
      setTimeout(() => {
        const stored = localStorage.getItem('userInfo');
        if (!stored) {
          Taro.redirectTo({ url: '/pages/login/login' });
        }
      }, 100);
    }
  }, []);

  const handleLogout = () => {
    Taro.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          logout();
          localStorage.removeItem('token');
          Taro.redirectTo({ url: '/pages/login/login' });
        }
      },
    });
  };

  const getRoleName = (role: string): string => {
    const roleMap: Record<string, string> = {
      superadmin: '超级管理员',
      regional_manager: '区域经理',
      supervisor: '督导专员',
      manager: '店长',
    };
    return roleMap[role] || role;
  };

  if (!userInfo) {
    return (
      <View className="loading-container">
        <Text className="loading-text block">加载中...</Text>
      </View>
    );
  }

  return (
    <View className="index-container">
      <Card className="welcome-card">
        <CardHeader>
          <CardTitle className="block">欢迎，{userInfo.nickname}</CardTitle>
        </CardHeader>
        <CardContent className="welcome-content">
          <View className="info-item">
            <Text className="info-label block">角色</Text>
            <Text className="info-value block">{getRoleName(userInfo.role)}</Text>
          </View>
          
          {userInfo.storeName && (
            <View className="info-item">
              <Text className="info-label block">门店</Text>
              <Text className="info-value block">{userInfo.storeName}</Text>
            </View>
          )}
          
          <View className="info-item">
            <Text className="info-label block">积分</Text>
            <Text className="info-value block score">{userInfo.totalScore}</Text>
          </View>
        </CardContent>
      </Card>

      <Card className="menu-card">
        <CardHeader>
          <CardTitle className="block">功能菜单</CardTitle>
        </CardHeader>
        <CardContent className="menu-content">
          {/* 店长功能 */}
          {userInfo.role === UserRole.MANAGER && (
            <>
              <Button
                className="menu-button"
                onClick={() => Taro.navigateTo({ url: '/pages/upload/upload' })}
              >
                <Text>上报任务</Text>
              </Button>
              <Button
                className="menu-button"
                onClick={() => Taro.navigateTo({ url: '/pages/history/history' })}
              >
                <Text>上报记录</Text>
              </Button>
              <Button
                className="menu-button"
                onClick={() => Taro.navigateTo({ url: '/pages/score/score' })}
              >
                <Text>积分明细</Text>
              </Button>
            </>
          )}

          {/* 督导专员功能 */}
          {isSupervisor && (
            <>
              <Button
                className="menu-button"
                onClick={() => Taro.navigateTo({ url: '/pages/records/records' })}
              >
                <Text>查看所有记录</Text>
              </Button>
              <Button
                className="menu-button"
                onClick={() => Taro.navigateTo({ url: '/pages/score-manage/score-manage' })}
              >
                <Text>积分管理</Text>
              </Button>
              <Button
                className="menu-button"
                onClick={() => Taro.navigateTo({ url: '/pages/users/users' })}
              >
                <Text>店长管理</Text>
              </Button>
            </>
          )}

          {/* 区域经理功能 */}
          {isRegionalManager && (
            <>
              <Button
                className="menu-button"
                onClick={() => Taro.navigateTo({ url: '/pages/users/users' })}
              >
                <Text>用户管理</Text>
              </Button>
              <Button
                className="menu-button"
                onClick={() => Taro.navigateTo({ url: '/pages/records/records' })}
              >
                <Text>查看所有记录</Text>
              </Button>
              <Button
                className="menu-button"
                onClick={() => Taro.navigateTo({ url: '/pages/score-manage/score-manage' })}
              >
                <Text>积分管理</Text>
              </Button>
            </>
          )}

          {/* 超级管理员功能 */}
          {isSuperAdmin && (
            <>
              <Button
                className="menu-button"
                onClick={() => Taro.navigateTo({ url: '/pages/users/users' })}
              >
                <Text>用户管理</Text>
              </Button>
              <Button
                className="menu-button"
                onClick={() => Taro.navigateTo({ url: '/pages/records/records' })}
              >
                <Text>查看所有记录</Text>
              </Button>
              <Button
                className="menu-button"
                onClick={() => Taro.navigateTo({ url: '/pages/score-manage/score-manage' })}
              >
                <Text>积分管理</Text>
              </Button>
              <Button
                className="menu-button"
                onClick={() => Taro.navigateTo({ url: '/pages/settings/settings' })}
              >
                <Text>系统设置</Text>
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <View className="logout-wrapper">
        <Button
          className="logout-button"
          variant="outline"
          onClick={handleLogout}
        >
          <Text>退出登录</Text>
        </Button>
      </View>
    </View>
  );
};

export default IndexPage;
