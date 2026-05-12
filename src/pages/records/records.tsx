import { useState } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock, Check, X } from 'lucide-react-taro';
import { Network } from '@/network';
import { useUserStore } from '@/store/user';

interface Report {
  id: string;
  user_id: string;
  task_name: string;
  task_type: string;
  images: string[];
  status: string;
  score: number;
  remark?: string;
  review_remark?: string;
  reviewer_name?: string;
  created_at: string;
  review_at?: string;
}

const RecordsPage = () => {
  const { userInfo, isAdmin } = useUserStore();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeStatus, setActiveStatus] = useState('pending');
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewScore, setReviewScore] = useState('');
  const [reviewRemark, setReviewRemark] = useState('');

  // 页面显示时加载数据
  useDidShow(() => {
    loadReports();
  });

  // 加载所有上报记录
  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await Network.request({
        url: '/api/task/report/list',
        method: 'GET',
        data: { status: activeStatus === 'all' ? undefined : activeStatus },
      });
      console.log('[RecordsPage] loadReports response:', res.data);
      if (res.data?.code === 200 && res.data?.data) {
        setReports(res.data.data);
      }
    } catch (error) {
      console.error('[RecordsPage] loadReports error:', error);
      Taro.showToast({
        title: '加载失败',
        icon: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // 切换状态Tab
  const handleTabChange = (status: string) => {
    setActiveStatus(status);
    setTimeout(() => loadReports(), 100);
  };

  // 审核通过
  const handleApprove = async (reportId: string) => {
    try {
      const res = await Network.request({
        url: '/api/task/report/review',
        method: 'POST',
        data: {
          reviewer_id: userInfo?.id,
          reviewer_name: userInfo?.nickname || userInfo?.username,
          report_id: reportId,
          status: 'approved',
          score: reviewScore ? parseInt(reviewScore) : undefined,
          remark: reviewRemark,
        },
      });
      console.log('[RecordsPage] handleApprove response:', res.data);
      if (res.data?.code === 200) {
        Taro.showToast({
          title: '审核通过',
          icon: 'success',
        });
        setReviewingId(null);
        setReviewScore('');
        setReviewRemark('');
        loadReports();
      } else {
        throw new Error(res.data?.msg || '审核失败');
      }
    } catch (error: any) {
      console.error('[RecordsPage] handleApprove error:', error);
      Taro.showToast({
        title: error.message || '审核失败',
        icon: 'error',
      });
    }
  };

  // 驳回
  const handleReject = async (reportId: string) => {
    if (!reviewRemark) {
      Taro.showToast({
        title: '请填写驳回原因',
        icon: 'error',
      });
      return;
    }

    try {
      const res = await Network.request({
        url: '/api/task/report/review',
        method: 'POST',
        data: {
          reviewer_id: userInfo?.id,
          reviewer_name: userInfo?.nickname || userInfo?.username,
          report_id: reportId,
          status: 'rejected',
          remark: reviewRemark,
        },
      });
      console.log('[RecordsPage] handleReject response:', res.data);
      if (res.data?.code === 200) {
        Taro.showToast({
          title: '已驳回',
          icon: 'success',
        });
        setReviewingId(null);
        setReviewScore('');
        setReviewRemark('');
        loadReports();
      } else {
        throw new Error(res.data?.msg || '驳回失败');
      }
    } catch (error: any) {
      console.error('[RecordsPage] handleReject error:', error);
      Taro.showToast({
        title: error.message || '驳回失败',
        icon: 'error',
      });
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
          <CardTitle className="block">所有上报记录</CardTitle>
        </CardHeader>
        <CardContent>
          {/* 状态Tab */}
          <View className="tabs-wrapper">
            <View
              className={`tab-item ${activeStatus === 'pending' ? 'active' : ''}`}
              onClick={() => handleTabChange('pending')}
            >
              <Text className="block">待审核</Text>
            </View>
            <View
              className={`tab-item ${activeStatus === 'approved' ? 'active' : ''}`}
              onClick={() => handleTabChange('approved')}
            >
              <Text className="block">已通过</Text>
            </View>
            <View
              className={`tab-item ${activeStatus === 'rejected' ? 'active' : ''}`}
              onClick={() => handleTabChange('rejected')}
            >
              <Text className="block">已驳回</Text>
            </View>
            <View
              className={`tab-item ${activeStatus === 'all' ? 'active' : ''}`}
              onClick={() => handleTabChange('all')}
            >
              <Text className="block">全部</Text>
            </View>
          </View>

          {/* 记录列表 */}
          {loading ? (
            <Text className="block text-center text-gray-500 py-8">加载中...</Text>
          ) : reports.length === 0 ? (
            <View className="empty-state">
              <Text className="block text-gray-400">暂无记录</Text>
            </View>
          ) : (
            <View className="report-list">
              {reports.map((report) => {
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
                            onClick={() => {
                              Taro.previewImage({
                                current: img,
                                urls: report.images,
                              });
                            }}
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

                    {/* 审核备注 */}
                    {report.review_remark && (
                      <View className="review-remark">
                        <Text className="text-sm text-gray-600">
                          审核备注：{report.review_remark}
                        </Text>
                      </View>
                    )}

                    {/* 审核操作（仅待审核状态且管理员可见） */}
                    {report.status === 'pending' && isAdmin && (
                      <View className="review-actions">
                        {reviewingId === report.id ? (
                          <View className="review-form">
                            <View className="form-item">
                              <Text className="block text-sm text-gray-700 mb-1">调整积分（可选）</Text>
                              <View className="input-wrapper">
                                <Input
                                  type="number"
                                  placeholder={`默认${report.score}分`}
                                  value={reviewScore}
                                  onInput={(e) => setReviewScore(e.detail.value)}
                                />
                              </View>
                            </View>
                            <View className="form-item">
                              <Text className="block text-sm text-gray-700 mb-1">审核备注</Text>
                              <View className="input-wrapper">
                                <Input
                                  placeholder="驳回时必填"
                                  value={reviewRemark}
                                  onInput={(e) => setReviewRemark(e.detail.value)}
                                />
                              </View>
                            </View>
                            <View className="action-buttons">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setReviewingId(null);
                                  setReviewScore('');
                                  setReviewRemark('');
                                }}
                              >
                                <Text className="block">取消</Text>
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReject(report.id)}
                              >
                                <Text className="block">驳回</Text>
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleApprove(report.id)}
                              >
                                <Text className="block">通过</Text>
                              </Button>
                            </View>
                          </View>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setReviewingId(report.id)}
                          >
                            <Text className="block">审核</Text>
                          </Button>
                        )}
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

export default RecordsPage;
