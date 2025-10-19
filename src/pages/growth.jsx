// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Textarea, useToast, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui';
// @ts-ignore;
import { Plus, Edit, Trash2, ArrowLeft, LogOut, TrendingUp } from 'lucide-react';

// @ts-ignore;
import { WeightChart } from '@/components/WeightChart';
// @ts-ignore;
import TabBar from '@/components/TabBar';
export default function Growth(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [growthData, setGrowthData] = useState([]);
  const [currentLocation, setCurrentLocation] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGrowth, setNewGrowth] = useState({
    week: '',
    weight: '',
    growth_rate: '',
    cycle: '',
    notes: '',
    measure_time: new Date().toISOString().slice(0, 16),
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
    loadGrowthData(location);
  }, [$w, toast]);

  // 加载当前场地的生长数据
  const loadGrowthData = async location => {
    try {
      const response = await $w.cloud.callDataSource({
        dataSourceName: 'growth_data',
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
            measure_time: 'asc'
          }],
          pageSize: 100,
          pageNumber: 1
        }
      });
      setGrowthData(response.records || []);
    } catch (error) {
      console.error('加载生长数据失败:', error);
      // 使用模拟数据
      const mockData = [{
        _id: '1',
        week: '第1周',
        weight: 0.5,
        growth_rate: 100,
        cycle: 1,
        notes: '初始体重',
        measure_time: new Date().toISOString(),
        location: location,
        chicken_id: '1'
      }].filter(item => item.location === location);
      setGrowthData(mockData);
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
  const handleAddGrowth = async () => {
    if (!newGrowth.week || !newGrowth.weight) {
      toast({
        title: '添加失败',
        description: '请填写完整信息',
        variant: 'destructive'
      });
      return;
    }
    try {
      const growthRecord = {
        ...newGrowth,
        location: currentLocation,
        weight: parseFloat(newGrowth.weight),
        growth_rate: parseFloat(newGrowth.growth_rate) || 0,
        cycle: parseInt(newGrowth.cycle) || 1
      };
      await $w.cloud.callDataSource({
        dataSourceName: 'growth_data',
        methodName: 'wedaCreateV2',
        params: {
          data: growthRecord
        }
      });
      toast({
        title: '添加成功',
        description: '生长数据已添加'
      });
      setShowAddModal(false);
      setNewGrowth({
        week: '',
        weight: '',
        growth_rate: '',
        cycle: '',
        notes: '',
        measure_time: new Date().toISOString().slice(0, 16),
        location: currentLocation,
        chicken_id: ''
      });
      loadGrowthData(currentLocation);
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

  // 计算生长统计
  const latestWeight = growthData.length > 0 ? growthData[growthData.length - 1].weight : 0;
  const avgGrowthRate = growthData.length > 0 ? growthData.reduce((sum, data) => sum + (data.growth_rate || 0), 0) / growthData.length : 0;
  return <div className="min-h-screen bg-gray-50 pb-20">
      {/* 顶部导航栏 */}
      <div className="bg-green-600 text-white p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Button variant="ghost" onClick={handleBack} className="text-white hover:bg-green-700 mr-2">
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-xl font-bold">{currentLocation} - 生长监控</h1>
              <p className="text-green-100">仅显示本场地生长数据</p>
            </div>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-white hover:bg-green-700">
            <LogOut className="mr-1" size={16} />
            退出
          </Button>
        </div>
      </div>

      {/* 生长数据统计 */}
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2" size={20} />
              {currentLocation}生长统计
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-green-700 font-medium">最新体重</p>
                <p className="text-2xl font-bold text-green-600">{latestWeight}kg</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-700 font-medium">平均增长率</p>
                <p className="text-2xl font-bold text-blue-600">{avgGrowthRate.toFixed(2)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 生长图表 */}
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>体重变化趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <WeightChart data={growthData} />
          </CardContent>
        </Card>
      </div>

      {/* 生长数据列表 */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">生长记录</h2>
          <Button onClick={() => setShowAddModal(true)} className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2" size={16} />
            添加记录
          </Button>
        </div>

        <div className="space-y-4">
          {growthData.map(data => <Card key={data._id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{data.week}</h3>
                    <p className="text-sm text-gray-600">体重: {data.weight}kg</p>
                    <p className="text-sm text-gray-600">增长率: {data.growth_rate}%</p>
                    <p className="text-sm text-gray-600">
                      测量时间: {new Date(data.measure_time).toLocaleString()}
                    </p>
                    {data.notes && <p className="text-sm text-gray-600 mt-1">备注: {data.notes}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>)}
          {growthData.length === 0 && <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">暂无生长数据</p>
                <Button onClick={() => setShowAddModal(true)} className="mt-2 bg-green-600 hover:bg-green-700">
                  <Plus className="mr-2" size={16} />
                  添加第一条记录
                </Button>
              </CardContent>
            </Card>}
        </div>
      </div>

      {/* 添加生长记录模态框 */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加生长记录</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">周数</label>
              <Input value={newGrowth.week} onChange={e => setNewGrowth({
              ...newGrowth,
              week: e.target.value
            })} placeholder="例如：第1周" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">体重(kg)</label>
                <Input type="number" step="0.1" value={newGrowth.weight} onChange={e => setNewGrowth({
                ...newGrowth,
                weight: e.target.value
              })} placeholder="体重" />
              </div>
              <div>
                <label className="text-sm font-medium">增长率(%)</label>
                <Input type="number" step="0.1" value={newGrowth.growth_rate} onChange={e => setNewGrowth({
                ...newGrowth,
                growth_rate: e.target.value
              })} placeholder="增长率" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">测量时间</label>
              <Input type="datetime-local" value={newGrowth.measure_time} onChange={e => setNewGrowth({
              ...newGrowth,
              measure_time: e.target.value
            })} />
            </div>
            <div>
              <label className="text-sm font-medium">备注</label>
              <Textarea value={newGrowth.notes} onChange={e => setNewGrowth({
              ...newGrowth,
              notes: e.target.value
            })} placeholder="备注信息" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>取消</Button>
            <Button onClick={handleAddGrowth} className="bg-green-600 hover:bg-green-700">确认添加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 底部导航栏 */}
      <TabBar currentPage="growth" location={currentLocation} $w={$w} />
    </div>;
}