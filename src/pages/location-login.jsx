// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Input, useToast } from '@/components/ui';
// @ts-ignore;
import { LogIn, ArrowLeft, MapPin, AlertCircle } from 'lucide-react';

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
  const [errorMessage, setErrorMessage] = useState('');

  // 获取场地参数
  useEffect(() => {
    const location = $w.page.dataset.params?.location || '';
    if (!location) {
      toast({
        title: '参数错误',
        description: '未获取到场地信息，请重新选择场地',
        variant: 'destructive'
      });
      setTimeout(() => {
        $w.utils.redirectTo({
          pageId: 'home',
          params: {}
        });
      }, 2000);
      return;
    }
    setCurrentLocation(location);
  }, [$w, toast]);

  // 场地管理员账号配置
  const locationAccounts = {
    '齐伯场地': {
      username: 'mingyu01',
      password: 'mingyu888'
    },
    '大屯场地': {
      username: 'mingyu02',
      password: 'mingyu888'
    },
    '十字场地': {
      username: 'mingyu03',
      password: 'shizi2025'
    }
  };
  const handleLogin = async () => {
    if (!currentLocation) {
      setErrorMessage('场地信息获取失败，请重新选择场地');
      return;
    }
    if (!username || !password) {
      setErrorMessage('请输入用户名和密码');
      return;
    }
    setLoading(true);
    setErrorMessage('');
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const account = locationAccounts[currentLocation];
      if (!account) {
        setErrorMessage(`未找到场地 ${currentLocation} 的账号配置`);
        return;
      }

      // 精确比较用户名和密码
      const inputUsername = username.trim();
      const inputPassword = password.trim();
      if (inputUsername === account.username && inputPassword === account.password) {
        // 保存登录状态
        localStorage.setItem(`chickenFarm_${currentLocation}_LoggedIn`, 'true');
        localStorage.setItem('currentLocation', currentLocation);
        toast({
          title: '登录成功',
          description: `欢迎进入${currentLocation}管理系统`
        });

        // 跳转到鸡群管理页面
        setTimeout(() => {
          $w.utils.redirectTo({
            pageId: 'chickens',
            params: {
              location: currentLocation
            }
          });
        }, 500);
      } else {
        setErrorMessage('用户名或密码错误，请检查后重试');
      }
    } catch (error) {
      setErrorMessage('登录过程中出现错误，请重试');
    } finally {
      setLoading(false);
    }
  };
  const handleBack = () => {
    $w.utils.redirectTo({
      pageId: 'home',
      params: {}
    });
  };
  const handleKeyPress = e => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };
  const clearError = () => {
    setErrorMessage('');
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
  if (!currentLocation) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在获取场地信息...</p>
        </div>
      </div>;
  }
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
            <div className="w-10"></div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {errorMessage && <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="text-red-500 mr-2" size={16} />
              <span className="text-red-600 text-sm">{errorMessage}</span>
            </div>}
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">用户名</label>
            <Input type="text" placeholder="请输入用户名" value={username} onChange={e => {
            setUsername(e.target.value);
            clearError();
          }} onKeyPress={handleKeyPress} className="w-full" />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">密码</label>
            <Input type="password" placeholder="请输入密码" value={password} onChange={e => {
            setPassword(e.target.value);
            clearError();
          }} onKeyPress={handleKeyPress} className="w-full" />
          </div>
          
          <Button onClick={handleLogin} disabled={loading} className={`w-full ${themeClasses[theme].primary} text-white`}>
            <LogIn className="mr-2" size={16} />
            {loading ? '登录中...' : `登录${currentLocation}`}
          </Button>
          
          <div className="text-center text-xs text-gray-500 mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="font-medium mb-2">{currentLocation}测试账号：</p>
            <p>用户名：<span className="font-mono bg-gray-100 px-2 py-1 rounded">{locationAccounts[currentLocation]?.username}</span></p>
            <p>密码：<span className="font-mono bg-gray-100 px-2 py-1 rounded">{locationAccounts[currentLocation]?.password}</span></p>
          </div>
        </CardContent>
      </Card>
    </div>;
}