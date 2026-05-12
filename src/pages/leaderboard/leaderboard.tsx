import { useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react-taro';
import { Network } from '@/network';

interface LeaderboardUser {
  id: string;
  username: string;
  nickname: string;
  role: string;
  totalScore: number;
}

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(false);

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
      console.log('[LeaderboardPage] loadLeaderboard response:', res.data);
      if (res.data?.code === 200 && res.data?.data) {
        setLeaderboard(res.data.data);
      }
    } catch (error) {
      console.error('[LeaderboardPage] loadLeaderboard error:', error);
      Taro.showToast({
        title: '加载失败',
        icon: 'error',
      });
    } finally {
      setLoading(false);
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

  // 获取排名徽章背景色
  const getRankBgColor = (index: number) => {
    if (index === 0) return '#fbbf24'; // 金色
    if (index === 1) return '#9ca3af'; // 银色
    if (index === 2) return '#cd7f32'; // 铜色
    return '#e5e7eb'; // 灰色
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
                  <View 
                    className="rank-badge"
                    style={{ 
                      backgroundColor: getRankBgColor(index),
                      borderRadius: '50%',
                      width: index < 3 ? 40 : 32,
                      height: index < 3 ? 40 : 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12
                    }}
                  >
                    {index < 3 ? (
                      <Trophy
                        size={index < 3 ? 20 : 16}
                        color="#fff"
                      />
                    ) : (
                      <Text className="block font-semibold" style={{ color: '#4b5563' }}>
                        {index + 1}
                      </Text>
                    )}
                  </View>
                  <View className="user-info" style={{ flex: 1 }}>
                    <Text className="block font-semibold text-base">{item.nickname || item.username}</Text>
                    <Text className="block text-xs text-gray-500">{getRoleText(item.role)}</Text>
                  </View>
                  <View className="score-info">
                    <Text 
                      className="block text-lg font-semibold" 
                      style={{ color: '#f59e0b', fontWeight: 'bold' }}
                    >
                      {item.totalScore}
                    </Text>
                    <Text className="block text-xs text-gray-500">积分</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </CardContent>
      </Card>
    </View>
  );
};

export default LeaderboardPage;
