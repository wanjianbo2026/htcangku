import { View, Text } from '@tarojs/components';
import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { Network } from '@/network';
import { useAppStore, UserRole } from '@/store/user';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import './users.css';

interface User {
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
}

interface UsersResponse {
  code: number;
  msg: string;
  data: User[];
}

const UsersPage = () => {
  const userInfo = useAppStore((state) => state.userInfo);
  const canManageUser = useAppStore((state) => state.canManageUser);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    // 检查权限
    if (!userInfo || userInfo.role === UserRole.MANAGER) {
      Taro.showModal({
        title: '权限不足',
        content: '您没有权限访问此页面',
        showCancel: false,
        success: () => {
          Taro.redirectTo({ url: '/pages/index/index' });
        },
      });
      return;
    }
    
    loadUsers();
  }, [userInfo]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await Network.request({
        url: '/api/user/list',
        method: 'GET',
      });
      
      console.log('用户列表响应:', res.data);
      
      const usersRes = res.data as UsersResponse;
      
      if (usersRes.code === 200 && usersRes.data) {
        setUsers(usersRes.data);
      }
    } catch (err) {
      console.error('加载用户列表失败:', err);
      Taro.showToast({ title: '加载失败', icon: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    try {
      const res = await Network.request({
        url: '/api/user/approve',
        method: 'POST',
        data: { userId },
      });
      
      if (res.data.code === 200) {
        Taro.showToast({ title: '审批成功', icon: 'success' });
        loadUsers();
      } else {
        Taro.showToast({ title: res.data.msg || '审批失败', icon: 'error' });
      }
    } catch (err) {
      console.error('审批失败:', err);
      Taro.showToast({ title: '操作失败', icon: 'error' });
    }
  };

  const handleDisable = async (userId: string) => {
    try {
      const res = await Network.request({
        url: '/api/user/disable',
        method: 'POST',
        data: { userId },
      });
      
      if (res.data.code === 200) {
        Taro.showToast({ title: '已禁用', icon: 'success' });
        loadUsers();
      } else {
        Taro.showToast({ title: res.data.msg || '操作失败', icon: 'error' });
      }
    } catch (err) {
      console.error('禁用失败:', err);
      Taro.showToast({ title: '操作失败', icon: 'error' });
    }
  };

  const handleEnable = async (userId: string) => {
    try {
      const res = await Network.request({
        url: '/api/user/enable',
        method: 'POST',
        data: { userId },
      });
      
      if (res.data.code === 200) {
        Taro.showToast({ title: '已启用', icon: 'success' });
        loadUsers();
      } else {
        Taro.showToast({ title: res.data.msg || '操作失败', icon: 'error' });
      }
    } catch (err) {
      console.error('启用失败:', err);
      Taro.showToast({ title: '操作失败', icon: 'error' });
    }
  };

  const handleDelete = async (userId: string) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这个用户吗？此操作不可恢复',
      success: async (res) => {
        if (res.confirm) {
          try {
            const deleteRes = await Network.request({
              url: '/api/user/delete',
              method: 'POST',
              data: { userId },
            });
            
            if (deleteRes.data.code === 200) {
              Taro.showToast({ title: '已删除', icon: 'success' });
              loadUsers();
            } else {
              Taro.showToast({ title: deleteRes.data.msg || '删除失败', icon: 'error' });
            }
          } catch (err) {
            console.error('删除失败:', err);
            Taro.showToast({ title: '操作失败', icon: 'error' });
          }
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

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return <Badge>已启用</Badge>;
    } else if (status === 'pending') {
      return <Badge variant="secondary">待审核</Badge>;
    } else {
      return <Badge variant="destructive">已禁用</Badge>;
    }
  };

  const filteredUsers = users.filter((user) => {
    // 根据当前用户的角色过滤
    if (userInfo?.role === UserRole.SUPERADMIN) {
      // boss 可以看到所有人
      return user.status === activeTab;
    } else if (userInfo?.role === UserRole.REGIONAL_MANAGER) {
      // 区域经理只能看到督导专员和店长
      return (
        (user.role === UserRole.SUPERVISOR || user.role === UserRole.MANAGER) &&
        user.status === activeTab
      );
    } else if (userInfo?.role === UserRole.SUPERVISOR) {
      // 督导专员只能看到店长
      return user.role === UserRole.MANAGER && user.status === activeTab;
    }
    return false;
  });

  return (
    <View className="users-container">
      <Card className="users-card">
        <CardHeader>
          <CardTitle className="block">用户管理</CardTitle>
        </CardHeader>
        <CardContent className="users-content">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="users-tabs">
              <TabsTrigger value="pending">待审核</TabsTrigger>
              <TabsTrigger value="active">已启用</TabsTrigger>
              <TabsTrigger value="disabled">已禁用</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="users-list">
              {loading ? (
                <Text className="loading-text block">加载中...</Text>
              ) : filteredUsers.length === 0 ? (
                <Text className="empty-text block">暂无数据</Text>
              ) : (
                filteredUsers.map((user) => (
                  <Card key={user.id} className="user-item">
                    <CardContent className="user-info">
                      <View className="user-header">
                        <Text className="user-nickname block">{user.nickname}</Text>
                        {getStatusBadge(user.status)}
                      </View>
                      
                      <View className="user-details">
                        <Text className="user-detail block">用户名: {user.username}</Text>
                        <Text className="user-detail block">角色: {getRoleName(user.role)}</Text>
                        {user.phone && <Text className="user-detail block">手机: {user.phone}</Text>}
                        {user.storeName && <Text className="user-detail block">门店: {user.storeName}</Text>}
                        <Text className="user-detail block">积分: {user.totalScore}</Text>
                      </View>
                      
                      <View className="user-actions">
                        {user.status === 'pending' && canManageUser(user.role as UserRole) && (
                          <Button
                            size="sm"
                            onClick={() => handleApprove(user.id)}
                          >
                            <Text>审批通过</Text>
                          </Button>
                        )}
                        
                        {user.status === 'active' && canManageUser(user.role as UserRole) && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDisable(user.id)}
                            >
                              <Text>禁用</Text>
                            </Button>
                            {userInfo?.role === UserRole.SUPERADMIN && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(user.id)}
                              >
                                <Text>删除</Text>
                              </Button>
                            )}
                          </>
                        )}
                        
                        {user.status === 'disabled' && canManageUser(user.role as UserRole) && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleEnable(user.id)}
                            >
                              <Text>启用</Text>
                            </Button>
                            {userInfo?.role === UserRole.SUPERADMIN && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(user.id)}
                              >
                                <Text>删除</Text>
                              </Button>
                            )}
                          </>
                        )}
                      </View>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </View>
  );
};

export default UsersPage;
