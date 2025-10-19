// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, useToast } from '@/components/ui';
// @ts-ignore;
import { User, Shield, Home as HomeIcon, Lock } from 'lucide-react';

export default function Home(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const handleLocationClick = location => {
    // 跳转到对应场地的登录页面
    $w.utils.navigateTo({
      pageId: 'location-login',
      params: {
        location: location
      }
    });
  };
  return <div className="min-h-screen bg-gray-50 pb-16">
      {/* 顶部导航栏 */}
      <div className="bg-green-600 text-white p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <HomeIcon className="mr-2" size={24} />
            <div>
              <h1 className="text-xl font-bold">养鸡场管理系统</h1>
              <p className="text-green-100">请选择管理场地</p>
            </div>
          </div>
        </div>
      </div>

      {/* 场地选择 */}
      <div className="p-4 space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">选择管理场地</h2>
          <p className="text-gray-600">点击场地卡片进入登录页面</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* 齐伯场地 */}
          <Card className="cursor-pointer transition-transform hover:scale-105 hover:shadow-lg" onClick={() => handleLocationClick('齐伯场地')}>
            <CardContent className="p-6 text-center">
              <div className="bg-green-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Lock className="text-green-600" size={32} />
              </div>
              <h3 className="text-lg font-semibold mb-2">齐伯场地</h3>
              <p className="text-gray-600 text-sm">白羽鸡养殖基地</p>
              <div className="mt-4 bg-green-50 rounded-lg p-2">
                <p className="text-green-700 text-sm">点击进入登录</p>
              </div>
            </CardContent>
          </Card>

          {/* 大屯场地 */}
          <Card className="cursor-pointer transition-transform hover:scale-105 hover:shadow-lg" onClick={() => handleLocationClick('大屯场地')}>
            <CardContent className="p-6 text-center">
              <div className="bg-blue-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Lock className="text-blue-600" size={32} />
              </div>
              <h3 className="text-lg font-semibold mb-2">大屯场地</h3>
              <p className="text-gray-600 text-sm">肉鸡养殖基地</p>
              <div className="mt-4 bg-blue-50 rounded-lg p-2">
                <p className="text-blue-700 text-sm">点击进入登录</p>
              </div>
            </CardContent>
          </Card>

          {/* 十字场地 */}
          <Card className="cursor-pointer transition-transform hover:scale-105 hover:shadow-lg" onClick={() => handleLocationClick('十字场地')}>
            <CardContent className="p-6 text-center">
              <div className="bg-purple-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Lock className="text-purple-600" size={32} />
              </div>
              <h3 className="text-lg font-semibold mb-2">十字场地</h3>
              <p className="text-gray-600 text-sm">种鸡养殖基地</p>
              <div className="mt-4 bg-purple-50 rounded-lg p-2">
                <p className="text-purple-700 text-sm">点击进入登录</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 系统信息 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 text-green-600" size={20} />
              系统说明
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="font-medium text-yellow-700">重要提示</p>
                <p className="text-yellow-600">每个场地需要独立登录，数据完全隔离</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="font-medium text-blue-700">数据安全</p>
                <p className="text-blue-600">各场地只能查看和管理本场地的数据</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="font-medium text-green-700">测试账号</p>
                <p className="text-green-600">齐伯场地：admin / 99998</p>
                <p className="text-green-600">大屯场地：datun_admin / datun123456</p>
                <p className="text-green-600">十字场地：shizi_admin / shizi123456</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
}