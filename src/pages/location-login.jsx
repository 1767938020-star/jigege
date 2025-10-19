// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Input, useToast } from '@/components/ui';
// @ts-ignore;
import { LogIn, Shield, ArrowLeft, MapPin } from 'lucide-react';

export default function LocationLogin(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('');

  // 获取场地参数
  useEffect(() => {
    const location = $w.page.dataset.params?.location || '';
    setCurrentLocation(location);
  }, [$w]);

  // 场地管理员账号配置
  const locationAccounts = {
    '齐伯场地': {
      username: 'admin',
      password: '99998'
    },
    '大屯场地': {
      username: 'datun_admin',
      password: 'datun123456'
    },
    '十字场地': {
      username: 'shizi_admin',
      password: 'shizi123456'
    }
  };
  const handleLogin = async () => {
    if (!username || !password) {
      toast({
        title: '登录失败',
        description: '请输入用户名和密码',
        variant: 'destructive'
      });
      return;
    }
    setLoading(true);
    try {
      // 模拟登录验证过程，不使用匿名登录
      await new Promise(resolve => setTimeout(resolve, 500));
      const account = locationAccounts[currentLocation];
      if (account && username === account.username && password === account.password) {
        // 保存场地登录状态到本地存储
        localStorage.setItem(`chickenFarm_${currentLocation}_LoggedIn`, 'true');
        localStorage.setItem('currentLocation', currentLocation);
        toast({
          title: '登录成功',
          description: `欢迎进入${currentLocation}管理系统`
        });

        // 跳转到对应场地的鸡群管理页面
        setTimeout(() => {
          $w.utils.redirectTo({
            pageId: 'chickens',
            params: {
              location: currentLocation
            }
          });
        }, 500);
      } else {
        toast({
          title: '登录失败',
          description: '用户名或密码错误',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('登录错误:', error);
      toast({
        title: '登录错误',
        description: '登录过程中出现错误，请重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const handleBack = () => {
    $w.utils.navigateBack();
  };
  const handleKeyPress = e => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  // 根据场地设置主题颜色
  const getLocationTheme = () => {
    switch (currentLocation) {
      case '齐伯场地':
        return 'green';
      case '大屯场地':
        return 'blue';
      case '十字场地':
        return 'purple';
      default:
        return 'green';
    }
  };
  const theme = getLocationTheme();
  const themeClasses = {
    green: {
      bg: 'from-green-50 to-emerald-100',
      primary: 'bg-green-600 hover:bg-green-700',
      card: 'bg-green-100 text-green-600'
    },
    blue: {
      bg: 'from-blue-50 to-cyan-100',
      primary: 'bg-blue-600 hover:bg-blue-700',
      card: 'bg-blue-100 text-blue-600'
    },
    purple: {
      bg: 'from-purple-50 to-violet-100',
      primary: 'bg-purple-600 hover:bg-purple-700',
      card: 'bg-purple-100 text-purple-600'
    }
  };
  return <div className={`min-h-screen bg-gradient-to-br ${themeClasses[theme].bg} flex items-center justify-center p-4`}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-between items-center mb-4">
            <Button variant="ghost" onClick={handleBack} className="p-2">
              <ArrowLeft size={20} />
            </Button>
            <div className="flex-1 text-center">
              <div className={`${themeClasses[theme].card} p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center`}>
                <MapPin size={32} />
              </div>
              <CardTitle className="text-2xl font-bold">{currentLocation}</CardTitle>
              <p className="text-gray-600 mt-2">场地管理系统登录</p>
            </div>
            <div className="w-10"></div> {/* 占位保持对称 */}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">用户名</label>
            <Input type="text" placeholder="请输入用户名" value={username} onChange={e => setUsername(e.target.value)} onKeyPress={handleKeyPress} className="w-full" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">密码</label>
            <Input type="password" placeholder="请输入密码" value={password} onChange={e => setPassword(e.target.value)} onKeyPress={handleKeyPress} className="w-full" />
          </div>
          <Button onClick={handleLogin} disabled={loading} className={`w-full ${themeClasses[theme].primary} text-white`}>
            <LogIn className="mr-2" size={16} />
            {loading ? '登录中...' : `登录${currentLocation}`}
          </Button>
          
          <div className="text-center text-xs text-gray-500 mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="font-medium">{currentLocation}测试账号：</p>
            <p>用户名：{locationAccounts[currentLocation]?.username}</p>
            <p>密码：{locationAccounts[currentLocation]?.password}</p>
          </div>
        </CardContent>
      </Card>
    </div>;
}