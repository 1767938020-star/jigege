// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Textarea, useToast, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui';
// @ts-ignore;
import { Plus, Edit, Trash2, ArrowLeft, LogOut, AlertTriangle } from 'lucide-react';

// @ts-ignore;
import TabBar from '@/components/TabBar';
export default function Inventory(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [inventory, setInventory] = useState([]);
  const [currentLocation, setCurrentLocation] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    type: '',
    quantity: '',
    threshold: '',
    location: '',
    status: 'normal',
    unit: ''
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
    loadInventory(location);
  }, [$w, toast]);

  // 加载当前场地的库存数据
  const loadInventory = async location => {
    try {
      const response = await $w.cloud.callDataSource({
        dataSourceName: 'inventory_management',
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
      setInventory(response.records || []);
    } catch (error) {
      console.error('加载库存数据失败:', error);
      // 使用模拟数据
      const mockData = [{
        _id: '1',
        name: '玉米饲料',
        type: '饲料',
        quantity: 500,
        threshold: 100,
        location: location,
        status: 'normal',
        unit: 'kg'
      }].filter(item => item.location === location);
      setInventory(mockData);
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
  const handleAddItem = async () => {
    if (!newItem.name || !newItem.type || !newItem.quantity) {
      toast({
        title: '添加失败',
        description: '请填写完整信息',
        variant: 'destructive'
      });
      return;
    }
    try {
      const itemData = {
        ...newItem,
        location: currentLocation,
        quantity: parseInt(newItem.quantity),
        threshold: parseInt(newItem.threshold) || 0,
        status: parseInt(newItem.quantity) <= parseInt(newItem.threshold) ? 'warning' : 'normal'
      };
      await $w.cloud.callDataSource({
        dataSourceName: 'inventory_management',
        methodName: 'wedaCreateV2',
        params: {
          data: itemData
        }
      });
      toast({
        title: '添加成功',
        description: '库存物品已添加'
      });
      setShowAddModal(false);
      setNewItem({
        name: '',
        type: '',
        quantity: '',
        threshold: '',
        location: currentLocation,
        status: 'normal',
        unit: ''
      });
      loadInventory(currentLocation);
    } catch (error) {
      toast({
        title: '添加失败',
        description: '网络错误，请重试',
        variant: 'destructive'
      });
    }
  };
  if (!isLoggedIn) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">检查登录状态...</p>
        </div>
      </div>;
  }

  // 计算库存统计
  const totalItems = inventory.length;
  const warningItems = inventory.filter(item => item.status === 'warning').length;
  return <div className="min-h-screen bg-gray-50 pb-20">
      {/* 顶部导航栏 */}
      <div className="bg-green-600 text-white p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Button variant="ghost" onClick={handleBack} className="text-white hover:bg-green-700 mr-2">
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-xl font-bold">{currentLocation} - 库存管理</h1>
              <p className="text-green-100">仅显示本场地库存物品</p>
            </div>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-white hover:bg-green-700">
            <LogOut className="mr-1" size={16} />
            退出
          </Button>
        </div>
      </div>

      {/* 库存统计 */}
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>{currentLocation}库存统计</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-green-700 font-medium">总物品数量</p>
                <p className="text-2xl font-bold text-green-600">{totalItems}种</p>
              </div>
              <div className={`p-4 rounded-lg ${warningItems > 0 ? 'bg-red-50' : 'bg-blue-50'}`}>
                <p className={`font-medium ${warningItems > 0 ? 'text-red-700' : 'text-blue-700'}`}>预警物品</p>
                <p className={`text-2xl font-bold ${warningItems > 0 ? 'text-red-600' : 'text-blue-600'}`}>{warningItems}种</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 库存物品列表 */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">库存物品</h2>
          <Button onClick={() => setShowAddModal(true)} className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2" size={16} />
            添加物品
          </Button>
        </div>

        <div className="space-y-4">
          {inventory.map(item => <Card key={item._id} className={item.status === 'warning' ? 'border-red-200' : ''}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <h3 className="font-semibold">{item.name}</h3>
                      {item.status === 'warning' && <AlertTriangle className="ml-2 text-red-500" size={16} />}
                    </div>
                    <p className="text-sm text-gray-600">类型: {item.type}</p>
                    <p className="text-sm text-gray-600">
                      库存: {item.quantity}{item.unit}
                      {item.threshold > 0 && <span className={`ml-2 ${item.quantity <= item.threshold ? 'text-red-500' : 'text-gray-500'}`}>
                          (预警: {item.threshold}{item.unit})
                        </span>}
                    </p>
                    <p className={`text-sm ${item.status === 'warning' ? 'text-red-500' : 'text-gray-600'}`}>
                      状态: {item.status === 'warning' ? '库存不足' : '正常'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>)}
          {inventory.length === 0 && <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">暂无库存物品</p>
                <Button onClick={() => setShowAddModal(true)} className="mt-2 bg-green-600 hover:bg-green-700">
                  <Plus className="mr-2" size={16} />
                  添加第一个物品
                </Button>
              </CardContent>
            </Card>}
        </div>
      </div>

      {/* 添加库存物品模态框 */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加库存物品</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">物品名称</label>
              <Input value={newItem.name} onChange={e => setNewItem({
              ...newItem,
              name: e.target.value
            })} placeholder="请输入物品名称" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">类型</label>
                <Input value={newItem.type} onChange={e => setNewItem({
                ...newItem,
                type: e.target.value
              })} placeholder="例如：饲料、药品" />
              </div>
              <div>
                <label className="text-sm font-medium">单位</label>
                <Input value={newItem.unit} onChange={e => setNewItem({
                ...newItem,
                unit: e.target.value
              })} placeholder="例如：kg、个" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">库存数量</label>
                <Input type="number" value={newItem.quantity} onChange={e => setNewItem({
                ...newItem,
                quantity: e.target.value
              })} placeholder="数量" />
              </div>
              <div>
                <label className="text-sm font-medium">预警阈值</label>
                <Input type="number" value={newItem.threshold} onChange={e => setNewItem({
                ...newItem,
                threshold: e.target.value
              })} placeholder="预警数量" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>取消</Button>
            <Button onClick={handleAddItem} className="bg-green-600 hover:bg-green-700">确认添加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 底部导航栏 */}
      <TabBar currentPage="inventory" location={currentLocation} $w={$w} />
    </div>;
}