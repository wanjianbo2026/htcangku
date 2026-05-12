import { useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Network } from '@/network';
import { useUserStore } from '@/store/user';

interface ScoreLog {
  id: string;
  userId: string;
  delta: number;
  reason: string;
  beforeScore: number;
  afterScore: number;
  operatorId?: string;
  operatorName?: string;
  createdAt: string;
}

const ScorePage = () => {
  const { userInfo } = useUserStore();
  const [totalScore, setTotalScore] = useState(0);
  const [logs, setLogs] = useState<ScoreLog[]>([]);
  const [loading, setLoading] = useState(false);

  // 页面显示时加载数据
  useDidShow(() => {
    loadScoreData();
  });

  // 加载积分数据
  const loadScoreData = async () => {
    setLoading(true);
    try {
      // 获取用户详情（包含总积分）
      const userRes = await Network.request({
        url: '/api/user/detail',
        method: 'GET',
        data: { userId: userInfo?.id },
      });
      console.log('[ScorePage] getUserDetail response:', userRes.data);
      if (userRes.data?.code === 200 && userRes.data?.data) {
        setTotalScore(userRes.data.data.totalScore || 0);
      }

      // 获取积分记录
      const logsRes = await Network.request({
        url: '/api/user/score-logs',
        method: 'GET',
        data: { userId: userInfo?.id },
      });
      console.log('[ScorePage] getScoreLogs response:', logsRes.data);
      if (logsRes.data?.code === 200 && logsRes.data?.data) {
        setLogs(logsRes.data.data);
      }
    } catch (error) {
      console.error('[ScorePage] loadScoreData error:', error);
      Taro.showToast({
        title: '加载失败',
        icon: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // 获取积分变化文本
  const getReasonText = (reason: string) => {
    if (reason.includes('上报') || reason.includes('任务')) {
      return '任务奖励';
    } else if (reason.includes('管理员') || reason.includes('调整')) {
      return '管理员调整';
    }
    return reason;
  };

  // 格式化日期
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <View className="page-container">
      {/* 积分总览 */}
      <Card className="page-card score-card">
        <CardContent>
          <View className="score-overview">
            <Text className="block text-sm text-gray-600 mb-2">我的总积分</Text>
            <Text className="block text-4xl font-bold" style={{ color: '#f59e0b' }}>
              {totalScore}
            </Text>
          </View>
        </CardContent>
      </Card>

      {/* 积分记录 */}
      <Card className="page-card">
        <CardHeader>
          <CardTitle className="block">积分明细</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Text className="block text-center text-gray-500 py-8">加载中...</Text>
          ) : logs.length === 0 ? (
            <View className="empty-state">
              <Text className="block text-gray-400">暂无积分记录</Text>
            </View>
          ) : (
            <View className="log-list">
              {logs.map((log) => (
                <View key={log.id} className="log-item">
                  <View className="log-content">
                    <View className="log-type">
                      <Text className="block text-sm">{getReasonText(log.reason)}</Text>
                    </View>
                    <Text className="block text-xs text-gray-500 mt-1">{log.reason}</Text>
                    {log.operatorName && (
                      <Text className="block text-xs text-gray-400 mt-1">
                        操作人：{log.operatorName}
                      </Text>
                    )}
                  </View>
                  <View className="log-right">
                    <Text
                      className="block font-semibold"
                      style={{ color: log.delta > 0 ? '#10b981' : '#ef4444' }}
                    >
                      {log.delta > 0 ? '+' : ''}{log.delta}
                    </Text>
                    <Text className="block text-xs text-gray-500 mt-1">
                      {formatDate(log.createdAt)}
                    </Text>
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

export default ScorePage;
