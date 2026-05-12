import { useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trophy } from 'lucide-react-taro';
import { Network } from '@/network';
import { useUserStore } from '@/store/user';

interface User {
  id: string;
  username: string;
  nickname: string;
  role: string;
  total_score: number;
}

const ScoreManagePage = () => {
  const { userInfo, isAdmin } = useUserStore();
  const [leaderboard, setLeaderboard] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [adjustingUserId, setAdjustingUserId] = useState<string | null>(null);
  const [adjustScore, setAdjustScore] = useState('');
  const [adjustRemark, setAdjustRemark] = useState('');

  // 页面显示时加载数据
  useDidShow(() => {
    loadLeaderboard();
  });

  // 加载排行榜
  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await Network.request({
        url: '/api/user/leaderboard',
        method: 'GET',
      });
      console.log('[ScoreManagePage] loadLeaderboard response:', res.data);
      if (res.data?.code === 200 && res.data?.data) {
        setLeaderboard(res.data.data);
      }
    } catch (error) {
      console.error('[ScoreManagePage] loadLeaderboard error:', error);
      Taro.showToast({
        title: '加载失败',
        icon: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // 调整积分
  const handleAdjustScore = async (userId: string) => {
    if (!adjustScore || parseInt(adjustScore) === 0) {
      Taro.showToast({
        title: '请输入有效的积分',
        icon: 'error',
      });
      return;
    }

    try {
      const res = await Network.request({
        url: '/api/user/adjust-score',
        method: 'POST',
        data: {
          operator_id: userInfo?.id,
          operator_name: userInfo?.nickname || userInfo?.username,
          user_id: userId,
          score: parseInt(adjustScore),
          remark: adjustRemark || '管理员调整积分',
        },
      });
      console.log('[ScoreManagePage] adjustScore response:', res.data);
      if (res.data?.code === 200) {
        Taro.showToast({
          title: '调整成功',
          icon: 'success',
        });
        setAdjustingUserId(null);
        setAdjustScore('');
        setAdjustRemark('');
        loadLeaderboard();
      } else {
        throw new Error(res.data?.msg || '调整失败');
      }
    } catch (error: any) {
      console.error('[ScoreManagePage] adjustScore error:', error);
      Taro.showToast({
        title: error.message || '调整失败',
        icon: 'error',
      });
    }
  };

  // 获取角色文本
  const getRoleText = (role: string) => {
    switch (role) {
      case 'superadmin':
        return '超级管理员';
      case 'regional_manager':
        return '区域经理';
      case 'supervisor':
        return '督导专员';
      case 'manager':
        return '店长';
      default:
        return '未知';
    }
  };

  return (
    <View className="page-container">
      <Card className="page-card">
        <CardHeader>
          <CardTitle className="block">积分排行榜</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Text className="block text-center text-gray-500 py-8">加载中...</Text>
          ) : leaderboard.length === 0 ? (
            <View className="empty-state">
              <Text className="block text-gray-400">暂无数据</Text>
            </View>
          ) : (
            <View className="leaderboard-list">
              {leaderboard.map((item, index) => (
                <View key={item.id} className="leaderboard-item">
                  <View className="rank-badge">
                    {index < 3 ? (
                      <Trophy
                        size={24}
                        color={index === 0 ? '#fbbf24' : index === 1 ? '#9ca3af' : '#cd7f32'}
                      />
                    ) : (
                      <Text className="block text-lg font-semibold">{index + 1}</Text>
                    )}
                  </View>
                  <View className="user-info">
                    <Text className="block font-semibold text-base">{item.nickname || item.username}</Text>
                    <Text className="block text-xs text-gray-500">{getRoleText(item.role)}</Text>
                  </View>
                  <View className="score-info">
                    <Text className="block text-lg font-semibold" style={{ color: '#f59e0b' }}>
                      {item.total_score}
                    </Text>
                    <Text className="block text-xs text-gray-500">积分</Text>
                  </View>

                  {/* 调整积分按钮（仅管理员可见） */}
                  {isAdmin && (
                    <View className="adjust-actions">
                      {adjustingUserId === item.id ? (
                        <View className="adjust-form">
                          <View className="form-row">
                            <View className="input-wrapper" style={{ flex: 1 }}>
                              <Input
                                type="number"
                                placeholder="积分（+/-）"
                                value={adjustScore}
                                onInput={(e) => setAdjustScore(e.detail.value)}
                              />
                            </View>
                            <View className="input-wrapper" style={{ flex: 1 }}>
                              <Input
                                placeholder="备注"
                                value={adjustRemark}
                                onInput={(e) => setAdjustRemark(e.detail.value)}
                              />
                            </View>
                          </View>
                          <View className="form-buttons">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setAdjustingUserId(null);
                                setAdjustScore('');
                                setAdjustRemark('');
                              }}
                            >
                              <Text className="block">取消</Text>
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleAdjustScore(item.id)}
                            >
                              <Text className="block">确认</Text>
                            </Button>
                          </View>
                        </View>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setAdjustingUserId(item.id)}
                        >
                          <Text className="block">调整</Text>
                        </Button>
                      )}
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </CardContent>
      </Card>
    </View>
  );
};

export default ScoreManagePage;
