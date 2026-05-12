import { useState } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Camera, X } from 'lucide-react-taro';
import { Network } from '@/network';
import { useUserStore } from '@/store/user';

interface Task {
  id: string;
  name: string;
  description: string;
  type: string;
  score: number;
  requirement: string;
  images_required: number;
}

const UploadPage = () => {
  const { userInfo } = useUserStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [remark, setRemark] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 页面显示时加载任务列表
  useDidShow(() => {
    loadTasks();
  });

  // 加载任务列表
  const loadTasks = async () => {
    setLoading(true);
    try {
      const res = await Network.request({
        url: '/api/task/list',
        method: 'GET',
      });
      console.log('[UploadPage] loadTasks response:', res.data);
      if (res.data?.code === 200 && res.data?.data) {
        setTasks(res.data.data);
      }
    } catch (error) {
      console.error('[UploadPage] loadTasks error:', error);
      Taro.showToast({
        title: '加载任务失败',
        icon: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // 选择任务
  const handleSelectTask = (task: Task) => {
    setSelectedTask(task);
    setImages([]);
    setRemark('');
  };

  // 拍照
  const handleTakePhoto = async () => {
    if (images.length >= 9) {
      Taro.showToast({
        title: '最多上传9张图片',
        icon: 'none',
      });
      return;
    }

    try {
      const res = await Taro.chooseImage({
        count: 9 - images.length,
        sizeType: ['compressed'],
        sourceType: ['camera', 'album'],
      });

      console.log('[UploadPage] chooseImage result:', res);
      setImages([...images, ...res.tempFilePaths]);
    } catch (error) {
      console.error('[UploadPage] chooseImage error:', error);
    }
  };

  // 删除图片
  const handleDeleteImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  // 预览图片
  const handlePreviewImage = (index: number) => {
    Taro.previewImage({
      current: images[index],
      urls: images,
    });
  };

  // 提交上报
  const handleSubmit = async () => {
    if (!selectedTask) {
      Taro.showToast({
        title: '请选择任务',
        icon: 'error',
      });
      return;
    }

    if (images.length === 0) {
      Taro.showToast({
        title: '请上传至少一张图片',
        icon: 'error',
      });
      return;
    }

    if (images.length < selectedTask.images_required) {
      Taro.showToast({
        title: `至少需要上传${selectedTask.images_required}张图片`,
        icon: 'error',
      });
      return;
    }

    setSubmitting(true);
    try {
      // 上传图片到对象存储
      const uploadedUrls: string[] = [];
      for (const imagePath of images) {
        const uploadRes = await Network.uploadFile({
          url: '/api/upload',
          filePath: imagePath,
          name: 'file',
        });
        console.log('[UploadPage] uploadFile response:', uploadRes);
        const uploadData = uploadRes.data as any;
        if (uploadData?.code === 200 && uploadData?.data?.url) {
          uploadedUrls.push(uploadData.data.url);
        }
      }

      // 提交上报
      const res = await Network.request({
        url: '/api/task/report/submit',
        method: 'POST',
        data: {
          user_id: userInfo?.id,
          user_name: userInfo?.nickname || userInfo?.username,
          task_id: selectedTask.id,
          images: uploadedUrls,
          remark: remark,
        },
      });

      console.log('[UploadPage] submitReport response:', res.data);
      if (res.data?.code === 200) {
        Taro.showToast({
          title: '上报成功',
          icon: 'success',
        });
        // 重置表单
        setSelectedTask(null);
        setImages([]);
        setRemark('');
        // 跳转到历史记录页面
        setTimeout(() => {
          Taro.navigateTo({ url: '/pages/history/history' });
        }, 1500);
      } else {
        throw new Error(res.data?.msg || '上报失败');
      }
    } catch (error: any) {
      console.error('[UploadPage] submitReport error:', error);
      Taro.showToast({
        title: error.message || '上报失败',
        icon: 'error',
      });
    } finally {
      setSubmitting(false);
    }
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
      {/* 任务选择 */}
      {!selectedTask ? (
        <Card className="page-card">
          <CardHeader>
            <CardTitle className="block">选择任务</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Text className="block text-center text-gray-500 py-4">加载中...</Text>
            ) : tasks.length === 0 ? (
              <Text className="block text-center text-gray-500 py-4">暂无可上报的任务</Text>
            ) : (
              <View className="task-list">
                {tasks.map((task) => (
                  <View
                    key={task.id}
                    className="task-item"
                    onClick={() => handleSelectTask(task)}
                  >
                    <View className="flex flex-row justify-between items-start">
                      <View className="flex-1">
                        <View className="flex flex-row items-center gap-2 mb-1">
                          <Text className="block font-semibold text-base">{task.name}</Text>
                          <View className="task-type-badge">
                            <Text className="text-xs">{getTaskTypeText(task.type)}</Text>
                          </View>
                        </View>
                        <Text className="block text-sm text-gray-600 mb-2">{task.description}</Text>
                        <Text className="block text-xs text-gray-500">需要上传 {task.images_required} 张图片</Text>
                      </View>
                      <View className="task-score">
                        <Text className="block text-sm font-semibold">+{task.score}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </CardContent>
        </Card>
      ) : (
        /* 上报表单 */
        <View>
          {/* 任务信息 */}
          <Card className="page-card">
            <CardHeader>
              <CardTitle className="block">任务信息</CardTitle>
            </CardHeader>
            <CardContent>
              <View className="flex flex-row justify-between items-center mb-2">
                <Text className="block font-semibold text-lg">{selectedTask.name}</Text>
                <View className="task-score">
                  <Text className="block text-sm font-semibold">+{selectedTask.score}</Text>
                </View>
              </View>
              <Text className="block text-sm text-gray-600 mb-2">{selectedTask.description}</Text>
              <View className="task-requirement">
                <Text className="block text-sm text-gray-700">任务要求：{selectedTask.requirement}</Text>
              </View>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => {
                  setSelectedTask(null);
                  setImages([]);
                  setRemark('');
                }}
              >
                <Text className="block">重新选择任务</Text>
              </Button>
            </CardContent>
          </Card>

          {/* 图片上传 */}
          <Card className="page-card">
            <CardHeader>
              <CardTitle className="block">
                上传图片 ({images.length}/{selectedTask.images_required})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <View className="image-grid">
                {images.map((img, index) => (
                  <View key={index} className="image-item">
                    <Image
                      src={img}
                      mode="aspectFill"
                      className="w-full h-full"
                      onClick={() => handlePreviewImage(index)}
                    />
                    <View
                      className="image-delete-btn"
                      onClick={() => handleDeleteImage(index)}
                    >
                      <X size={16} color="#fff" />
                    </View>
                  </View>
                ))}
                {images.length < 9 && (
                  <View className="image-upload-btn" onClick={handleTakePhoto}>
                    <Camera size={32} color="#999" />
                    <Text className="block text-xs text-gray-500 mt-1">拍照上传</Text>
                  </View>
                )}
              </View>
            </CardContent>
          </Card>

          {/* 备注 */}
          <Card className="page-card">
            <CardHeader>
              <CardTitle className="block">备注说明</CardTitle>
            </CardHeader>
            <CardContent>
              <View className="remark-input-wrapper">
                <Textarea
                  style={{ width: '100%', minHeight: '80px' }}
                  placeholder="请输入备注说明（选填）"
                  maxlength={200}
                  value={remark}
                  onInput={(e) => setRemark(e.detail.value)}
                />
              </View>
            </CardContent>
          </Card>

          {/* 提交按钮 */}
          <View className="submit-btn-wrapper">
            <Button
              className="submit-btn"
              disabled={submitting || images.length < selectedTask.images_required}
              onClick={handleSubmit}
            >
              <Text className="block">
                {submitting ? '提交中...' : '提交上报'}
              </Text>
            </Button>
          </View>
        </View>
      )}
    </View>
  );
};

export default UploadPage;
