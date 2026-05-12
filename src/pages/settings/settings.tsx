import { useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Pencil, Trash } from 'lucide-react-taro';
import { Network } from '@/network';
import { useUserStore } from '@/store/user';

interface Store {
  id: string;
  name: string;
  address: string;
  region: string;
  manager_id?: string;
  manager_name?: string;
  status: string;
}

interface Task {
  id: string;
  name: string;
  description: string;
  type: string;
  score: number;
  requirement: string;
  images_required: number;
  status: string;
}

const SettingsPage = () => {
  const { isSuperAdmin } = useUserStore();
  const [activeTab, setActiveTab] = useState('stores');
  const [stores, setStores] = useState<Store[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  // 门店编辑状态
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [storeForm, setStoreForm] = useState({
    name: '',
    address: '',
    region: '',
  });

  // 任务编辑状态
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskForm, setTaskForm] = useState({
    name: '',
    description: '',
    type: 'daily',
    score: 10,
    requirement: '',
    images_required: 1,
  });

  // 页面显示时加载数据
  useDidShow(() => {
    loadData();
  });

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      // 并行加载门店和任务
      const [storesRes, tasksRes] = await Promise.all([
        Network.request({
          url: '/api/task/store/list',
          method: 'GET',
        }),
        Network.request({
          url: '/api/task/list',
          method: 'GET',
        }),
      ]);

      console.log('[SettingsPage] loadData response:', { storesRes, tasksRes });

      if (storesRes.data?.code === 200 && storesRes.data?.data) {
        setStores(storesRes.data.data);
      }
      if (tasksRes.data?.code === 200 && tasksRes.data?.data) {
        setTasks(tasksRes.data.data);
      }
    } catch (error) {
      console.error('[SettingsPage] loadData error:', error);
      Taro.showToast({
        title: '加载失败',
        icon: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // ==================== 门店管理 ====================

  const handleEditStore = (store?: Store) => {
    if (store) {
      setEditingStore(store);
      setStoreForm({
        name: store.name,
        address: store.address,
        region: store.region,
      });
    } else {
      setEditingStore(null);
      setStoreForm({ name: '', address: '', region: '' });
    }
  };

  const handleSaveStore = async () => {
    if (!storeForm.name || !storeForm.address || !storeForm.region) {
      Taro.showToast({
        title: '请填写完整信息',
        icon: 'error',
      });
      return;
    }

    try {
      if (editingStore) {
        // 更新门店
        const res = await Network.request({
          url: '/api/task/store/update',
          method: 'POST',
          data: {
            id: editingStore.id,
            ...storeForm,
          },
        });
        console.log('[SettingsPage] updateStore response:', res.data);
        if (res.data?.code !== 200) {
          throw new Error(res.data?.msg || '更新失败');
        }
      } else {
        // 创建门店
        const res = await Network.request({
          url: '/api/task/store/create',
          method: 'POST',
          data: storeForm,
        });
        console.log('[SettingsPage] createStore response:', res.data);
        if (res.data?.code !== 200) {
          throw new Error(res.data?.msg || '创建失败');
        }
      }

      Taro.showToast({
        title: editingStore ? '更新成功' : '创建成功',
        icon: 'success',
      });
      setEditingStore(null);
      setStoreForm({ name: '', address: '', region: '' });
      loadData();
    } catch (error: any) {
      console.error('[SettingsPage] saveStore error:', error);
      Taro.showToast({
        title: error.message || '操作失败',
        icon: 'error',
      });
    }
  };

  const handleDeleteStore = async (storeId: string) => {
    const confirm = await Taro.showModal({
      title: '确认删除',
      content: '删除后无法恢复，是否继续？',
    });
    if (!confirm.confirm) return;

    try {
      const res = await Network.request({
        url: '/api/task/store/delete',
        method: 'POST',
        data: { id: storeId },
      });
      console.log('[SettingsPage] deleteStore response:', res.data);
      if (res.data?.code === 200) {
        Taro.showToast({
          title: '删除成功',
          icon: 'success',
        });
        loadData();
      } else {
        throw new Error(res.data?.msg || '删除失败');
      }
    } catch (error: any) {
      console.error('[SettingsPage] deleteStore error:', error);
      Taro.showToast({
        title: error.message || '删除失败',
        icon: 'error',
      });
    }
  };

  // ==================== 任务管理 ====================

  const handleEditTask = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setTaskForm({
        name: task.name,
        description: task.description,
        type: task.type,
        score: task.score,
        requirement: task.requirement,
        images_required: task.images_required,
      });
    } else {
      setEditingTask(null);
      setTaskForm({
        name: '',
        description: '',
        type: 'daily',
        score: 10,
        requirement: '',
        images_required: 1,
      });
    }
  };

  const handleSaveTask = async () => {
    if (!taskForm.name || !taskForm.description || !taskForm.requirement) {
      Taro.showToast({
        title: '请填写完整信息',
        icon: 'error',
      });
      return;
    }

    try {
      if (editingTask) {
        // 更新任务
        const res = await Network.request({
          url: '/api/task/update',
          method: 'POST',
          data: {
            id: editingTask.id,
            ...taskForm,
          },
        });
        console.log('[SettingsPage] updateTask response:', res.data);
        if (res.data?.code !== 200) {
          throw new Error(res.data?.msg || '更新失败');
        }
      } else {
        // 创建任务
        const res = await Network.request({
          url: '/api/task/create',
          method: 'POST',
          data: taskForm,
        });
        console.log('[SettingsPage] createTask response:', res.data);
        if (res.data?.code !== 200) {
          throw new Error(res.data?.msg || '创建失败');
        }
      }

      Taro.showToast({
        title: editingTask ? '更新成功' : '创建成功',
        icon: 'success',
      });
      setEditingTask(null);
      setTaskForm({
        name: '',
        description: '',
        type: 'daily',
        score: 10,
        requirement: '',
        images_required: 1,
      });
      loadData();
    } catch (error: any) {
      console.error('[SettingsPage] saveTask error:', error);
      Taro.showToast({
        title: error.message || '操作失败',
        icon: 'error',
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const confirm = await Taro.showModal({
      title: '确认删除',
      content: '删除后无法恢复，是否继续？',
    });
    if (!confirm.confirm) return;

    try {
      const res = await Network.request({
        url: '/api/task/delete',
        method: 'POST',
        data: { id: taskId },
      });
      console.log('[SettingsPage] deleteTask response:', res.data);
      if (res.data?.code === 200) {
        Taro.showToast({
          title: '删除成功',
          icon: 'success',
        });
        loadData();
      } else {
        throw new Error(res.data?.msg || '删除失败');
      }
    } catch (error: any) {
      console.error('[SettingsPage] deleteTask error:', error);
      Taro.showToast({
        title: error.message || '删除失败',
        icon: 'error',
      });
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
      {/* Tab切换 */}
      <View className="tabs-wrapper-full">
        <View
          className={`tab-item-full ${activeTab === 'stores' ? 'active' : ''}`}
          onClick={() => setActiveTab('stores')}
        >
          <Text className="block">门店管理</Text>
        </View>
        <View
          className={`tab-item-full ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          <Text className="block">任务配置</Text>
        </View>
      </View>

      {/* 门店管理 */}
      {activeTab === 'stores' && (
        <Card className="page-card">
          <CardHeader>
            <View className="flex flex-row justify-between items-center">
              <CardTitle className="block">门店列表</CardTitle>
              {isSuperAdmin && (
                <Button size="sm" onClick={() => handleEditStore()}>
                  <Plus size={16} color="#fff" />
                  <Text className="block ml-1">添加门店</Text>
                </Button>
              )}
            </View>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Text className="block text-center text-gray-500 py-8">加载中...</Text>
            ) : (
              <View className="item-list">
                {stores.map((store) => (
                  <View key={store.id} className="item-card">
                    <View className="item-content">
                      <Text className="block font-semibold text-base">{store.name}</Text>
                      <Text className="block text-sm text-gray-600 mt-1">{store.address}</Text>
                      <View className="flex flex-row items-center gap-2 mt-2">
                        <View className="region-badge">
                          <Text className="text-xs">{store.region}</Text>
                        </View>
                        {store.manager_name && (
                          <Text className="text-xs text-gray-500">店长：{store.manager_name}</Text>
                        )}
                      </View>
                    </View>
                    {isSuperAdmin && (
                      <View className="item-actions">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditStore(store)}
                        >
                          <Pencil size={14} color="#666" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteStore(store.id)}
                        >
                          <Trash size={14} color="#ef4444" />
                        </Button>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </CardContent>
        </Card>
      )}

      {/* 任务配置 */}
      {activeTab === 'tasks' && (
        <Card className="page-card">
          <CardHeader>
            <View className="flex flex-row justify-between items-center">
              <CardTitle className="block">任务列表</CardTitle>
              {isSuperAdmin && (
                <Button size="sm" onClick={() => handleEditTask()}>
                  <Plus size={16} color="#fff" />
                  <Text className="block ml-1">添加任务</Text>
                </Button>
              )}
            </View>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Text className="block text-center text-gray-500 py-8">加载中...</Text>
            ) : (
              <View className="item-list">
                {tasks.map((task) => (
                  <View key={task.id} className="item-card">
                    <View className="item-content">
                      <View className="flex flex-row items-center gap-2">
                        <Text className="block font-semibold text-base">{task.name}</Text>
                        <View className="type-badge">
                          <Text className="text-xs">{getTaskTypeText(task.type)}</Text>
                        </View>
                      </View>
                      <Text className="block text-sm text-gray-600 mt-1">{task.description}</Text>
                      <View className="flex flex-row items-center gap-4 mt-2">
                        <Text className="text-sm" style={{ color: '#f59e0b' }}>
                          +{task.score}积分
                        </Text>
                        <Text className="text-xs text-gray-500">
                          需{task.images_required}张图片
                        </Text>
                      </View>
                    </View>
                    {isSuperAdmin && (
                      <View className="item-actions">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditTask(task)}
                        >
                          <Pencil size={14} color="#666" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          <Trash size={14} color="#ef4444" />
                        </Button>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </CardContent>
        </Card>
      )}

      {/* 编辑门店弹窗 */}
      {(editingStore || storeForm.name) && activeTab === 'stores' && (
        <View className="edit-modal">
          <Card className="modal-card">
            <CardHeader>
              <CardTitle className="block">
                {editingStore ? '编辑门店' : '添加门店'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <View className="form-group">
                <Text className="block text-sm text-gray-700 mb-1">门店名称</Text>
                <View className="input-wrapper">
                  <Input
                    placeholder="请输入门店名称"
                    value={storeForm.name}
                    onInput={(e) => setStoreForm({ ...storeForm, name: e.detail.value })}
                  />
                </View>
              </View>
              <View className="form-group">
                <Text className="block text-sm text-gray-700 mb-1">门店地址</Text>
                <View className="input-wrapper">
                  <Input
                    placeholder="请输入门店地址"
                    value={storeForm.address}
                    onInput={(e) => setStoreForm({ ...storeForm, address: e.detail.value })}
                  />
                </View>
              </View>
              <View className="form-group">
                <Text className="block text-sm text-gray-700 mb-1">所属区域</Text>
                <View className="input-wrapper">
                  <Input
                    placeholder="请输入所属区域"
                    value={storeForm.region}
                    onInput={(e) => setStoreForm({ ...storeForm, region: e.detail.value })}
                  />
                </View>
              </View>
              <View className="form-buttons">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingStore(null);
                    setStoreForm({ name: '', address: '', region: '' });
                  }}
                >
                  <Text className="block">取消</Text>
                </Button>
                <Button onClick={handleSaveStore}>
                  <Text className="block">保存</Text>
                </Button>
              </View>
            </CardContent>
          </Card>
        </View>
      )}

      {/* 编辑任务弹窗 */}
      {(editingTask || taskForm.name) && activeTab === 'tasks' && (
        <View className="edit-modal">
          <Card className="modal-card">
            <CardHeader>
              <CardTitle className="block">
                {editingTask ? '编辑任务' : '添加任务'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <View className="form-group">
                <Text className="block text-sm text-gray-700 mb-1">任务名称</Text>
                <View className="input-wrapper">
                  <Input
                    placeholder="请输入任务名称"
                    value={taskForm.name}
                    onInput={(e) => setTaskForm({ ...taskForm, name: e.detail.value })}
                  />
                </View>
              </View>
              <View className="form-group">
                <Text className="block text-sm text-gray-700 mb-1">任务描述</Text>
                <View className="input-wrapper">
                  <Textarea
                    style={{ width: '100%', minHeight: '60px' }}
                    placeholder="请输入任务描述"
                    value={taskForm.description}
                    onInput={(e) => setTaskForm({ ...taskForm, description: e.detail.value })}
                  />
                </View>
              </View>
              <View className="form-group">
                <Text className="block text-sm text-gray-700 mb-1">任务类型</Text>
                <View className="type-selector">
                  {['daily', 'weekly', 'monthly', 'special'].map((type) => (
                    <View
                      key={type}
                      className={`type-option ${taskForm.type === type ? 'active' : ''}`}
                      onClick={() => setTaskForm({ ...taskForm, type })}
                    >
                      <Text className="block">{getTaskTypeText(type)}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <View className="form-row">
                <View className="form-group" style={{ flex: 1 }}>
                  <Text className="block text-sm text-gray-700 mb-1">完成积分</Text>
                  <View className="input-wrapper">
                    <Input
                      type="number"
                      placeholder="积分"
                      value={String(taskForm.score)}
                      onInput={(e) => setTaskForm({ ...taskForm, score: parseInt(e.detail.value) || 0 })}
                    />
                  </View>
                </View>
                <View className="form-group" style={{ flex: 1 }}>
                  <Text className="block text-sm text-gray-700 mb-1">图片数量</Text>
                  <View className="input-wrapper">
                    <Input
                      type="number"
                      placeholder="数量"
                      value={String(taskForm.images_required)}
                      onInput={(e) => setTaskForm({ ...taskForm, images_required: parseInt(e.detail.value) || 1 })}
                    />
                  </View>
                </View>
              </View>
              <View className="form-group">
                <Text className="block text-sm text-gray-700 mb-1">任务要求</Text>
                <View className="input-wrapper">
                  <Textarea
                    style={{ width: '100%', minHeight: '60px' }}
                    placeholder="请输入任务要求"
                    value={taskForm.requirement}
                    onInput={(e) => setTaskForm({ ...taskForm, requirement: e.detail.value })}
                  />
                </View>
              </View>
              <View className="form-buttons">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingTask(null);
                    setTaskForm({
                      name: '',
                      description: '',
                      type: 'daily',
                      score: 10,
                      requirement: '',
                      images_required: 1,
                    });
                  }}
                >
                  <Text className="block">取消</Text>
                </Button>
                <Button onClick={handleSaveTask}>
                  <Text className="block">保存</Text>
                </Button>
              </View>
            </CardContent>
          </Card>
        </View>
      )}
    </View>
  );
};

export default SettingsPage;
