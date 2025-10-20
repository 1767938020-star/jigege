// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Textarea, useToast, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui';
// @ts-ignore;
import { Plus, Edit, Trash2, ArrowLeft, LogOut, Calendar } from 'lucide-react';

// @ts-ignore;
import TabBar from '@/components/TabBar';
export default function Feeding(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [feedings, setFeedings] = useState([]);
  const [currentLocation, setCurrentLocation] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [feedingToDelete, setFeedingToDelete] = useState(null);
  const [newFeeding, setNewFeeding] = useState({
    feed_type: '',
    amount: '',
    time: new Date().toISOString().slice(0, 16),
    notes: '',
    location: '',
    chicken_id: ''
  });

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
    loadFeedings(location);
  }, [$w, toast]);

  // 加载当前场地的喂养记录
  const loadFeedings = async location => {
    try {
      const response = await $w.cloud.callDataSource({
        dataSourceName: 'feeding_records',
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
          orderBy: [{
            time: 'desc'
          }],
          pageSize: 100,
          pageNumber: 1
        }
      });
      setFeedings(response.records || []);
    } catch (error) {
      console.error('加载喂养记录失败:', error);
      // 使用模拟数据
      const mockData = [{
        _id: '1',
        feed_type: '玉米饲料',
        amount: '50kg',
        time: new Date().toISOString(),
        notes: '正常喂养',
        location: location,
        chicken_id: '1'
      }].filter(item => item.location === location);
      setFeedings(mockData);
    }
  };

  // 添加喂养记录
  const handleAddFeeding = async () => {
    if (!newFeeding.feed_type || !newFeeding.amount) {
      toast({
        title: '添加失败',
        description: '请填写饲料类型和喂养量',
        variant: 'destructive'
      });
      return;
    }
    try {
      const feedingData = {
        ...newFeeding,
        location: currentLocation
      };
      await $w.cloud.callDataSource({
        dataSourceName: 'feeding_records',
        methodName: 'wedaCreateV2',
        params: {
          data: feedingData
        }
      });
      toast({
        title: '添加成功',
        description: '喂养记录已添加'
      });
      setShowAddModal(false);
      setNewFeeding({
        feed_type: '',
        amount: '',
        time: new Date().toISOString().slice(0, 16),
        notes: '',
        location: currentLocation,
        chicken_id: ''
      });
      loadFeedings(currentLocation);
    } catch (error) {
      console.error('添加喂养记录失败:', error);
      toast({
        title: '添加失败',
        description: '网络错误，请重试',
        variant: 'destructive'
      });
    }
  };

  // 删除喂养记录
  const handleDeleteFeeding = async () => {
    if (!feedingToDelete) return;
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'feeding_records',
        methodName: 'wedaDeleteV2',
        params: {
          filter: {
            where: {
              _id: {
                $eq: feedingToDelete._id
              }
            }
          }
        }
      });
      toast({
        title: '删除成功',
        description: `已删除喂养记录：${feedingToDelete.feed_type}`
      });
      setShowDeleteDialog(false);
      setFeedingToDelete(null);
      loadFeedings(currentLocation);
    } catch (error) {
      console.error('删除喂养记录失败:', error);
      toast({
        title: '删除失败',
        description: '网络错误，请重试',
        variant: 'destructive'
      });
    }
  };

  // 打开删除确认对话框
  const openDeleteDialog = feeding => {
    setFeedingToDelete(feeding);
    setShowDeleteDialog(true);
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
  if (!isLoggedIn) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">检查登录状态...</p>
        </div>
      </div>;
  }

  // 计算当前场地的喂养统计
  const todayFeedings = feedings.filter(feed => {
    const feedDate = new Date(feed.time).toDateString();
    const today = new Date().toDateString();
    return feedDate === today;
  });
  return <div className="min-h-screen bg-gray-50 pb-20">
      {/* 顶部导航栏 */}
      <div className="bg-green-600 text-white p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Button variant="ghost" onClick={handleBack} className="text-white hover:bg-green-700 mr-2">
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-xl font-bold">{currentLocation} - 喂养管理</h1>
              <p className="text-green-100">仅显示本场地喂养记录</p>
            </div>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-white hover:bg-green-700">
            <LogOut className="mr-1" size={16} />
            退出
          </Button>
        </div>
      </div>

      {/* 场地喂养统计 */}
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2" size={20} />
              {currentLocation}喂养统计
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-green-700 font-medium">今日喂养次数</p>
                <p className="text-2xl font-bold text-green-600">{todayFeedings.length}次</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-700 font-medium">总喂养记录</p>
                <p className="text-2xl font-bold text-blue-600">{feedings.length}条</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 喂养记录列表 */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">喂养记录</h2>
          <Button onClick={() => setShowAddModal(true)} className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2" size={16} />
            添加记录
          </Button>
        </div>

        <div className="space-y-4">
          {feedings.map(feeding => <Card key={feeding._id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">{feeding.feed_type}</h3>
                      <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(feeding)} className="bg-red-600 hover:bg-red-700">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">喂养量:</span>
                        <span className="ml-2 font-medium">{feeding.amount}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">鸡只编号:</span>
                        <span className="ml-2 font-medium">{feeding.chicken_id || '未指定'}</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        时间: {new Date(feeding.time).toLocaleString()}
                      </p>
                      {feeding.notes && <p className="text-sm text-gray-600 mt-1">备注: {feeding.notes}</p>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>)}
          
          {feedings.length === 0 && <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500 text-lg mb-4">暂无喂养记录</p>
                <Button onClick={() => setShowAddModal(true)} className="bg-green-600 hover:bg-green-700">
                  <Plus className="mr-2" size={16} />
                  添加第一条记录
                </Button>
              </CardContent>
            </Card>}
        </div>
      </div>

      {/* 添加喂养记录模态框 */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加喂养记录</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">饲料类型</label>
              <Input value={newFeeding.feed_type} onChange={e => setNewFeeding({
              ...newFeeding,
              feed_type: e.target.value
            })} placeholder="请输入饲料类型" />
            </div>
            <div>
              <label className="text-sm font-medium">喂养量</label>
              <Input value={newFeeding.amount} onChange={e => setNewFeeding({
              ...newFeeding,
              amount: e.target.value
            })} placeholder="请输入喂养量" />
            </div>
            <div>
              <label className="text-sm font-medium">鸡只编号</label>
              <Input value={newFeeding.chicken_id} onChange={e => setNewFeeding({
              ...newFeeding,
              chicken_id: e.target.value
            })} placeholder="请输入鸡只编号（可选）" />
            </div>
            <div>
              <label className="text-sm font-medium">喂养时间</label>
              <Input type="datetime-local" value={newFeeding.time} onChange={e => setNewFeeding({
              ...newFeeding,
              time: e.target.value
            })} />
            </div>
            <div>
              <label className="text-sm font-medium">备注</label>
              <Textarea value={newFeeding.notes} onChange={e => setNewFeeding({
              ...newFeeding,
              notes: e.target.value
            })} placeholder="备注信息" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>取消</Button>
            <Button onClick={handleAddFeeding} className="bg-green-600 hover:bg-green-700">确认添加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除 "{feedingToDelete?.feed_type}" 的喂养记录吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFeeding} className="bg-red-600 hover:bg-red-700">
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 底部导航栏 */}
      <TabBar currentPage="feeding" location={currentLocation} $w={$w} />
    </div>;
}