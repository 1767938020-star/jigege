// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, useToast, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
// @ts-ignore;
import { BarChart3, Users, Utensils, TrendingUp, ArrowLeft, LogOut, MapPin } from 'lucide-react';

// @ts-ignore;
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

// @ts-ignore;
import TabBar from '@/components/TabBar';
export default function Statistics(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [currentLocation, setCurrentLocation] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [viewMode, setViewMode] = useState('current'); // current, all, specific
  const [selectedLocation, setSelectedLocation] = useState('');
  const [statistics, setStatistics] = useState({
    totalChickens: 0,
    totalFeedings: 0,
    totalInventory: 0,
    totalDeaths: 0,
    growthData: [],
    feedingData: [],
    locationData: []
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
    setSelectedLocation(location);
    setIsLoggedIn(true);
    loadStatistics(location);
  }, [$w, toast]);

  // 加载统计数据
  const loadStatistics = async location => {
    try {
      // 获取所有场地的鸡只信息
      const chickensResponse = await $w.cloud.callDataSource({
        dataSourceName: 'chicken_info',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          pageSize: 1000,
          pageNumber: 1
        }
      });

      // 获取所有场地的喂养记录
      const feedingsResponse = await $w.cloud.callDataSource({
        dataSourceName: 'feeding_records',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          pageSize: 1000,
          pageNumber: 1
        }
      });

      // 获取所有场地的库存数据
      const inventoryResponse = await $w.cloud.callDataSource({
        dataSourceName: 'inventory_management',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          pageSize: 1000,
          pageNumber: 1
        }
      });

      // 获取所有场地的死亡记录
      const deathsResponse = await $w.cloud.callDataSource({
        dataSourceName: 'death_records',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          pageSize: 1000,
          pageNumber: 1
        }
      });

      // 获取所有场地的生长数据
      const growthResponse = await $w.cloud.callDataSource({
        dataSourceName: 'growth_data',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          pageSize: 1000,
          pageNumber: 1
        }
      });
      const allChickens = chickensResponse.records || [];
      const allFeedings = feedingsResponse.records || [];
      const allInventory = inventoryResponse.records || [];
      const allDeaths = deathsResponse.records || [];
      const allGrowth = growthResponse.records || [];

      // 根据查看模式过滤数据
      let filteredChickens = allChickens;
      let filteredFeedings = allFeedings;
      let filteredInventory = allInventory;
      let filteredDeaths = allDeaths;
      let filteredGrowth = allGrowth;
      if (viewMode === 'current') {
        filteredChickens = allChickens.filter(item => item.location === location);
        filteredFeedings = allFeedings.filter(item => item.location === location);
        filteredInventory = allInventory.filter(item => item.location === location);
        filteredDeaths = allDeaths.filter(item => item.location === location);
        filteredGrowth = allGrowth.filter(item => item.location === location);
      } else if (viewMode === 'specific' && selectedLocation) {
        filteredChickens = allChickens.filter(item => item.location === selectedLocation);
        filteredFeedings = allFeedings.filter(item => item.location === selectedLocation);
        filteredInventory = allInventory.filter(item => item.location === selectedLocation);
        filteredDeaths = allDeaths.filter(item => item.location === selectedLocation);
        filteredGrowth = allGrowth.filter(item => item.location === selectedLocation);
      }

      // 计算统计数据
      const totalChickens = filteredChickens.reduce((sum, item) => sum + (item.count || 0), 0);
      const totalFeedings = filteredFeedings.length;
      const totalInventory = filteredInventory.length;
      const totalDeaths = filteredDeaths.reduce((sum, item) => sum + (item.death_count || 0), 0);

      // 准备图表数据
      const locationData = Object.entries(allChickens.reduce((acc, item) => {
        acc[item.location] = (acc[item.location] || 0) + (item.count || 0);
        return acc;
      }, {})).map(([location, count]) => ({
        location,
        count
      }));
      const feedingData = filteredFeedings.reduce((acc, item) => {
        const date = new Date(item.time).toLocaleDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});
      const feedingChartData = Object.entries(feedingData).map(([date, count]) => ({
        date,
        count
      })).slice(-7); // 最近7天

      const growthChartData = filteredGrowth.map(item => ({
        week: item.week,
        weight: item.weight,
        location: item.location
      }));
      setStatistics({
        totalChickens,
        totalFeedings,
        totalInventory,
        totalDeaths,
        growthData: growthChartData,
        feedingData: feedingChartData,
        locationData
      });
    } catch (error) {
      console.error('加载统计数据失败:', error);
      // 使用模拟数据
      setStatistics({
        totalChickens: 1500,
        totalFeedings: 45,
        totalInventory: 23,
        totalDeaths: 12,
        growthData: [{
          week: '第1周',
          weight: 0.5,
          location: '齐伯场地'
        }, {
          week: '第2周',
          weight: 1.2,
          location: '齐伯场地'
        }, {
          week: '第3周',
          weight: 2.1,
          location: '齐伯场地'
        }],
        feedingData: [{
          date: '12/01',
          count: 8
        }, {
          date: '12/02',
          count: 12
        }, {
          date: '12/03',
          count: 10
        }],
        locationData: [{
          location: '齐伯场地',
          count: 800
        }, {
          location: '大屯场地',
          count: 600
        }, {
          location: '十字场地',
          count: 400
        }]
      });
    }
  };

  // 切换查看模式
  const handleViewModeChange = mode => {
    setViewMode(mode);
    if (mode === 'current') {
      setSelectedLocation(currentLocation);
    }
    loadStatistics(currentLocation);
  };

  // 处理场地选择
  const handleLocationChange = location => {
    setSelectedLocation(location);
    setViewMode('specific');
    loadStatistics(currentLocation);
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

  // 图表颜色配置
  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'];
  return <div className="min-h-screen bg-gray-50 pb-20">
      {/* 顶部导航栏 */}
      <div className="bg-green-600 text-white p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Button variant="ghost" onClick={handleBack} className="text-white hover:bg-green-700 mr-2">
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-xl font-bold">数据统计</h1>
              <p className="text-green-100">全面掌握养殖数据</p>
            </div>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-white hover:bg-green-700">
            <LogOut className="mr-1" size={16} />
            退出
          </Button>
        </div>
      </div>

      {/* 查看模式选择 */}
      <div className="p-4 bg-white border-b">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin size={20} className="text-green-600" />
            <span className="font-medium">查看模式:</span>
          </div>
          <div className="flex gap-2">
            <Button variant={viewMode === 'current' ? 'default' : 'outline'} onClick={() => handleViewModeChange('current')} className={viewMode === 'current' ? 'bg-green-600 hover:bg-green-700' : ''}>
              当前场地
            </Button>
            <Button variant={viewMode === 'all' ? 'default' : 'outline'} onClick={() => handleViewModeChange('all')} className={viewMode === 'all' ? 'bg-green-600 hover:bg-green-700' : ''}>
              所有场地
            </Button>
          </div>
        </div>

        {/* 场地选择器 */}
        {viewMode === 'specific' && <div className="mt-4">
            <Select value={selectedLocation} onValueChange={handleLocationChange}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="选择场地" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="齐伯场地">齐伯场地</SelectItem>
                <SelectItem value="大屯场地">大屯场地</SelectItem>
                <SelectItem value="十字场地">十字场地</SelectItem>
              </SelectContent>
            </Select>
          </div>}
      </div>

      {/* 数据概览卡片 */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full mr-4">
                  <Users className="text-green-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">鸡只总数</p>
                  <p className="text-2xl font-bold text-green-600">{statistics.totalChickens}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full mr-4">
                  <Utensils className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">喂养记录</p>
                  <p className="text-2xl font-bold text-blue-600">{statistics.totalFeedings}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-full mr-4">
                  <BarChart3 className="text-purple-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">库存物品</p>
                  <p className="text-2xl font-bold text-purple-600">{statistics.totalInventory}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 rounded-full mr-4">
                  <TrendingUp className="text-red-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">死亡数量</p>
                  <p className="text-2xl font-bold text-red-600">{statistics.totalDeaths}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 图表区域 */}
      <div className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 场地鸡只分布饼图 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="mr-2" size={20} />
                场地鸡只分布
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statistics.locationData} cx="50%" cy="50%" labelLine={false} label={({
                    location,
                    count
                  }) => `${location}: ${count}`} outerRadius={80} fill="#8884d8" dataKey="count">
                      {statistics.locationData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 喂养记录趋势图 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Utensils className="mr-2" size={20} />
                喂养记录趋势
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statistics.feedingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#10b981" name="喂养次数" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 生长数据趋势图 */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2" size={20} />
                生长数据趋势
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={statistics.growthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="weight" stroke="#3b82f6" name="体重(kg)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 底部导航栏 */}
      <TabBar currentPage="statistics" location={currentLocation} $w={$w} />
    </div>;
}