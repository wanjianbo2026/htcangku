import { useState } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Check, X } from 'lucide-react-taro';
import { Network } from '@/network';
import { useUserStore } from '@/store/user';

interface Report {
  id: string;
  task_name: string;
  task_type: string;
  images: string[];
  status: string;
  score: number;
  remark?: string;
  review_remark?: string;
  created_at: string;
  review_at?: string;
}

const HistoryPage = () => {
  const { userInfo } = useUserStore();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // 页面显示时加载数据
  useDidShow(() => {
    loadReports();
  });

  // 加载上报记录
  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await Network.request({
        url: '/api/task/report/list',
        method: 'GET',
        data: { user_id: userInfo?.id },
      });
      console.log('[HistoryPage] loadReports response:', res.data);
      if (res.data?.code === 200 && res.data?.data) {
        setReports(res.data.data);
      }
    } catch (error) {
      console.error('[HistoryPage] loadReports error:', error);
      Taro.showToast({
        title: '加载失败',
        icon: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // 获取状态显示
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { text: '待审核', color: '#f59e0b', icon: Clock };
      case 'approved':
        return { text: '已通过', color: '#10b981', icon: Check };
      case 'rejected':
        return { text: '已驳回', color: '#ef4444', icon: X };
      default:
        return { text: '未知', color: '#999', icon: Clock };
    }
  };

  // 格式化日期
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  // 查看详情
  const handleViewDetail = (report: Report) => {
    // 预览图片
    if (report.images && report.images.length > 0) {
      Taro.previewImage({
        current: report.images[0],
        urls: report.images,
      });
    }
  };

  // 筛选记录
  const filteredReports = reports.filter((report) => {
    if (activeTab === 'all') return true;
    return report.status === activeTab;
  });

  const getTaskTypeText = (type: string) => {
    switch (type) {
      case 'daily':
        return '每日任务';
      case 'weekly':
        return '每周任务';
      case 'monthly':
        return '每月任务';
      case 'special':
        return '特殊任务';
      default:
        return '任务';
    }
  };

  return (
    <View className="page-container">
      <Card className="page-card">
        <CardHeader>
          <CardTitle className="block">我的上报记录</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Tab切换 */}
          <View className="tabs-wrapper">
            <View
              className={`tab-item ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              <Text className="block">全部</Text>
            </View>
            <View
              className={`tab-item ${activeTab === 'pending' ? 'active' : ''}`}
              onClick={() => setActiveTab('pending')}
            >
              <Text className="block">待审核</Text>
            </View>
            <View
              className={`tab-item ${activeTab === 'approved' ? 'active' : ''}`}
              onClick={() => setActiveTab('approved')}
            >
              <Text className="block">已通过</Text>
            </View>
            <View
              className={`tab-item ${activeTab === 'rejected' ? 'active' : ''}`}
              onClick={() => setActiveTab('rejected')}
            >
              <Text className="block">已驳回</Text>
            </View>
          </View>

          {/* 记录列表 */}
          {loading ? (
            <Text className="block text-center text-gray-500 py-8">加载中...</Text>
          ) : filteredReports.length === 0 ? (
            <View className="empty-state">
              <Text className="block text-gray-400">暂无上报记录</Text>
            </View>
          ) : (
            <View className="report-list">
              {filteredReports.map((report) => {
                const statusInfo = getStatusInfo(report.status);
                const StatusIcon = statusInfo.icon;
                return (
                  <View key={report.id} className="report-item">
                    <View className="report-header">
                      <View className="flex flex-row items-center gap-2">
                        <Text className="block font-semibold text-base">{report.task_name}</Text>
                        <View className="task-type-badge">
                          <Text className="text-xs">{getTaskTypeText(report.task_type)}</Text>
                        </View>
                      </View>
                      <View className="flex flex-row items-center gap-1" style={{ color: statusInfo.color }}>
                        <StatusIcon size={16} color={statusInfo.color} />
                        <Text className="text-sm">{statusInfo.text}</Text>
                      </View>
                    </View>

                    {/* 图片预览 */}
                    {report.images && report.images.length > 0 && (
                      <View className="report-images">
                        {report.images.slice(0, 3).map((img, index) => (
                          <Image
                            key={index}
                            src={img}
                            mode="aspectFill"
                            className="report-image"
                            onClick={() => handleViewDetail(report)}
                          />
                        ))}
                        {report.images.length > 3 && (
                          <View className="report-image-more">
                            <Text className="text-sm">+{report.images.length - 3}</Text>
                          </View>
                        )}
                      </View>
                    )}

                    <View className="report-footer">
                      <Text className="text-xs text-gray-500">{formatDate(report.created_at)}</Text>
                      {report.status === 'approved' && (
                        <Text className="text-sm font-semibold" style={{ color: '#10b981' }}>
                          +{report.score}积分
                        </Text>
                      )}
                    </View>

                    {/* 驳回原因 */}
                    {report.status === 'rejected' && report.review_remark && (
                      <View className="reject-reason">
                        <Text className="text-sm text-red-600">驳回原因：{report.review_remark}</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </CardContent>
      </Card>
    </View>
  );
};

export default HistoryPage;
