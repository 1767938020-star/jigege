// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Textarea, useToast, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui';
// @ts-ignore;
import { Plus, Edit, Trash2, Camera, BarChart3, ArrowLeft, LogOut, Users, WifiOff, RefreshCw } from 'lucide-react';

// @ts-ignore;
import { ChickenCard } from '@/components/ChickenCard';
// @ts-ignore;
import { DeathRecordModal } from '@/components/DeathRecordModal';
// @ts-ignore;
import TabBar from '@/components/TabBar';
export default function Chickens(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [chickens, setChickens] = useState([]);
  const [currentLocation, setCurrentLocation] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeathModal, setShowDeathModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingChickenId, setDeletingChickenId] = useState(null);
  const [editingChicken, setEditingChicken] = useState(null);
  const [newChicken, setNewChicken] = useState({
    breed: '',
    count: '',
    age: '',
    mortality: '',
    notes: '',
    location: '',
    status: 'active'
  });
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [networkError, setNetworkError] = useState(false);

  // 检查登录状态和获取场地信息
  useEffect(() => {
    const location = $w.page.dataset.params?.location || '';
    const isLocationLoggedIn = localStorage.getItem(`chickenFarm_${location}_LoggedIn`) === 'true';
    if (!location || !isLocationLoggedIn) {
      toast({
        title: '访问拒绝',
        description: '请先登录该场地',
        variant: 'destructive'
      });
      $w.utils.redirectTo({
        pageId: 'home',
        params: {}
      });
      return;
    }
    setCurrentLocation(location);
    setIsLoggedIn(true);
    loadChickens(location);
  }, [$w, toast]);

  // 加载当前场地的鸡只数据
  const loadChickens = async location => {
    setLoading(true);
    setNetworkError(false);
    try {
      const response = await $w.cloud.callDataSource({
        dataSourceName: 'chicken_info',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              location: {
                $eq: location
              }
            }
          },
          select: {
            $master: true
          },
          pageSize: 100,
          pageNumber: 1
        }
      });
      setChickens(response.records || []);
    } catch (error) {
      console.error('加载鸡只数据失败:', error);
      setNetworkError(true);
      toast({
        title: '加载失败',
        description: '无法加载鸡只数据，请检查网络连接',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const handleLogout = () => {
    localStorage.removeItem(`chickenFarm_${currentLocation}_LoggedIn`);
    localStorage.removeItem('currentLocation');
    toast({
      title: '已退出登录',
      description: `已退出${currentLocation}管理系统`
    });
    $w.utils.redirectTo({
      pageId: 'home',
      params: {}
    });
  };
  const handleBack = () => {
    $w.utils.navigateBack();
  };
  const handleAddChicken = async () => {
    if (!newChicken.breed || !newChicken.count || !newChicken.age) {
      toast({
        title: '添加失败',
        description: '请填写完整信息',
        variant: 'destructive'
      });
      return;
    }
    setLoading(true);
    try {
      const chickenData = {
        ...newChicken,
        location: currentLocation,
        count: parseInt(newChicken.count),
        age: parseInt(newChicken.age),
        mortality: parseFloat(newChicken.mortality) || 0
      };

      // 保存到数据库
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'chicken_info',
        methodName: 'wedaCreateV2',
        params: {
          data: chickenData
        }
      });
      toast({
        title: '添加成功',
        description: '鸡只信息已添加'
      });
      setShowAddModal(false);
      setNewChicken({
        breed: '',
        count: '',
        age: '',
        mortality: '',
        notes: '',
        location: currentLocation,
        status: 'active'
      });
      loadChickens(currentLocation);
    } catch (error) {
      console.error('添加鸡只失败:', error);
      toast({
        title: '添加失败',
        description: '网络错误，请重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const handleEditChicken = async () => {
    if (!editingChicken) return;
    setLoading(true);
    try {
      const updateData = {
        ...editingChicken,
        count: parseInt(editingChicken.count),
        age: parseInt(editingChicken.age),
        mortality: parseFloat(editingChicken.mortality) || 0
      };
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'chicken_info',
        methodName: 'wedaUpdateV2',
        params: {
          data: updateData,
          filter: {
            where: {
              _id: {
                $eq: editingChicken._id
              }
            }
          }
        }
      });
      toast({
        title: '更新成功',
        description: '鸡只信息已更新'
      });
      setShowEditModal(false);
      setEditingChicken(null);
      loadChickens(currentLocation);
    } catch (error) {
      console.error('更新鸡只失败:', error);
      toast({
        title: '更新失败',
        description: '网络错误，请重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // 优化删除操作，添加重试机制
  const handleDeleteChicken = async chickenId => {
    setDeletingChickenId(chickenId);
    setShowDeleteConfirm(true);
  };
  const confirmDelete = async () => {
    if (!deletingChickenId) return;
    setDeleteLoading(true);
    try {
      // 添加超时机制
      const deletePromise = $w.cloud.callDataSource({
        dataSourceName: 'chicken_info',
        methodName: 'wedaDeleteV2',
        params: {
          filter: {
            where: {
              _id: {
                $eq: deletingChickenId
              }
            }
          }
        }
      });

      // 设置超时时间（手机网络可能较慢）
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('操作超时，请检查网络连接')), 10000));
      const result = await Promise.race([deletePromise, timeoutPromise]);
      toast({
        title: '删除成功',
        description: '鸡只信息已删除'
      });
      loadChickens(currentLocation);
    } catch (error) {
      console.error('删除鸡只失败:', error);
      let errorMessage = '网络错误，请重试';
      if (error.message.includes('超时')) {
        errorMessage = '操作超时，请检查网络连接';
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = '网络连接失败，请检查网络设置';
      } else if (error.code === 'UNAUTHORIZED') {
        errorMessage = '权限不足，无法删除';
      }
      toast({
        title: '删除失败',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
      setDeletingChickenId(null);
    }
  };
  const retryLoadData = () => {
    loadChickens(currentLocation);
  };
  if (!isLoggedIn) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">检查登录状态...</p>
        </div>
      </div>;
  }

  // 计算当前场地的统计数据
  const currentLocationChickens = chickens.filter(chicken => chicken.location === currentLocation);
  const totalChickens = currentLocationChickens.reduce((sum, chicken) => sum + (chicken.count || 0), 0);
  const avgMortality = currentLocationChickens.length > 0 ? currentLocationChickens.reduce((sum, chicken) => sum + (chicken.mortality || 0), 0) / currentLocationChickens.length : 0;
  return <div className="min-h-screen bg-gray-50 pb-20">
      {/* 顶部导航栏 */}
      <div className="bg-green-600 text-white p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Button variant="ghost" onClick={handleBack} className="text-white hover:bg-green-700 mr-2">
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-xl font-bold">{currentLocation} - 鸡群管理</h1>
              <p className="text-green-100">数据隔离，仅显示本场地信息</p>
            </div>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-white hover:bg-green-700">
            <LogOut className="mr-1" size={16} />
            退出
          </Button>
        </div>
      </div>

      {/* 网络错误提示 */}
      {networkError && <div className="p-4">
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <WifiOff className="text-red-600 mr-2" size={20} />
                  <div>
                    <p className="text-red-800 font-medium">网络连接失败</p>
                    <p className="text-red-600 text-sm">请检查网络连接后重试</p>
                  </div>
                </div>
                <Button onClick={retryLoadData} variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-100">
                  <RefreshCw className="mr-1" size={14} />
                  重试
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>}

      {/* 场地数据汇总 */}
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2" size={20} />
              {currentLocation}数据汇总
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-green-700 font-medium">总鸡只数量</p>
                <p className="text-2xl font-bold text-green-600">{totalChickens}只</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-700 font-medium">平均死亡率</p>
                <p className="text-2xl font-bold text-blue-600">{avgMortality.toFixed(2)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 鸡只列表 */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">鸡群列表</h2>
          <Button onClick={() => setShowAddModal(true)} className="bg-green-600 hover:bg-green-700" disabled={loading}>
            <Plus className="mr-2" size={16} />
            添加鸡只
          </Button>
        </div>

        {loading ? <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-2 text-gray-600">加载中...</span>
          </div> : <div className="grid gap-4">
            {currentLocationChickens.map(chicken => <ChickenCard key={chicken._id} chicken={chicken} onEdit={() => {
          setEditingChicken(chicken);
          setShowEditModal(true);
        }} onDelete={() => handleDeleteChicken(chicken._id)} onDeathRecord={() => {
          setEditingChicken(chicken);
          setShowDeathModal(true);
        }} />)}
            {currentLocationChickens.length === 0 && <Card>
                <CardContent className="p-6 text-center">
                  <Users className="mx-auto mb-4 text-gray-400" size={48} />
                  <p className="text-gray-500 mb-2">暂无鸡只数据</p>
                  <p className="text-sm text-gray-400 mb-4">点击下方按钮添加第一条鸡只记录</p>
                  <Button onClick={() => setShowAddModal(true)} className="bg-green-600 hover:bg-green-700">
                    <Plus className="mr-2" size={16} />
                    添加第一只鸡
                  </Button>
                </CardContent>
              </Card>}
          </div>}
      </div>

      {/* 添加鸡只模态框 */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加新鸡只</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">品种</label>
              <Input value={newChicken.breed} onChange={e => setNewChicken({
              ...newChicken,
              breed: e.target.value
            })} placeholder="请输入鸡只品种" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">数量</label>
                <Input type="number" value={newChicken.count} onChange={e => setNewChicken({
                ...newChicken,
                count: e.target.value
              })} placeholder="数量" />
              </div>
              <div>
                <label className="text-sm font-medium">日龄</label>
                <Input type="number" value={newChicken.age} onChange={e => setNewChicken({
                ...newChicken,
                age: e.target.value
              })} placeholder="日龄" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">死亡率(%)</label>
              <Input type="number" step="0.1" value={newChicken.mortality} onChange={e => setNewChicken({
              ...newChicken,
              mortality: e.target.value
            })} placeholder="死亡率" />
            </div>
            <div>
              <label className="text-sm font-medium">备注</label>
              <Textarea value={newChicken.notes} onChange={e => setNewChicken({
              ...newChicken,
              notes: e.target.value
            })} placeholder="备注信息" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)} disabled={loading}>
              取消
            </Button>
            <Button onClick={handleAddChicken} className="bg-green-600 hover:bg-green-700" disabled={loading}>
              {loading ? '添加中...' : '确认添加'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑鸡只模态框 */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑鸡只信息</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">品种</label>
              <Input value={editingChicken?.breed || ''} onChange={e => setEditingChicken({
              ...editingChicken,
              breed: e.target.value
            })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">数量</label>
                <Input type="number" value={editingChicken?.count || ''} onChange={e => setEditingChicken({
                ...editingChicken,
                count: e.target.value
              })} />
              </div>
              <div>
                <label className="text-sm font-medium">日龄</label>
                <Input type="number" value={editingChicken?.age || ''} onChange={e => setEditingChicken({
                ...editingChicken,
                age: e.target.value
              })} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">死亡率(%)</label>
              <Input type="number" step="0.1" value={editingChicken?.mortality || ''} onChange={e => setEditingChicken({
              ...editingChicken,
              mortality: e.target.value
            })} />
            </div>
            <div>
              <label className="text-sm font-medium">备注</label>
              <Textarea value={editingChicken?.notes || ''} onChange={e => setEditingChicken({
              ...editingChicken,
              notes: e.target.value
            })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)} disabled={loading}>
              取消
            </Button>
            <Button onClick={handleEditChicken} className="bg-green-600 hover:bg-green-700" disabled={loading}>
              {loading ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 死亡记录模态框 */}
      <DeathRecordModal open={showDeathModal} onOpenChange={setShowDeathModal} chicken={editingChicken} location={currentLocation} onSuccess={() => {
      loadChickens(currentLocation);
      setShowDeathModal(false);
    }} />

      {/* 删除确认对话框 */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除这条鸡只信息吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700" disabled={deleteLoading}>
              {deleteLoading ? <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  删除中...
                </> : '确认删除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 底部导航栏 */}
      <TabBar currentPage="chickens" location={currentLocation} $w={$w} />
    </div>;
}