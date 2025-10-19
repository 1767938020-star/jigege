// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { Home, Utensils, BarChart3, Package } from 'lucide-react';

export default function TabBar({
  currentPage,
  location,
  $w
}) {
  const tabs = [{
    id: 'chickens',
    label: '鸡群管理',
    icon: Home,
    page: 'chickens'
  }, {
    id: 'feeding',
    label: '喂养管理',
    icon: Utensils,
    page: 'feeding'
  }, {
    id: 'growth',
    label: '生长监控',
    icon: BarChart3,
    page: 'growth'
  }, {
    id: 'inventory',
    label: '库存管理',
    icon: Package,
    page: 'inventory'
  }];
  const handleTabClick = page => {
    if ($w && $w.utils && $w.utils.navigateTo) {
      // 跳转到对应页面，携带场地参数
      $w.utils.navigateTo({
        pageId: page,
        params: {
          location: location
        }
      });
    } else {
      console.error('$w对象未正确传递到TabBar组件');
    }
  };
  return <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2">
      <div className="grid grid-cols-4 gap-1">
        {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = currentPage === tab.id;
        return <Button key={tab.id} variant="ghost" onClick={() => handleTabClick(tab.page)} className={`flex flex-col items-center p-2 h-auto ${isActive ? 'text-green-600 bg-green-50' : 'text-gray-500 hover:text-gray-700'}`}>
              <Icon size={20} />
              <span className="text-xs mt-1">{tab.label}</span>
            </Button>;
      })}
      </div>
    </div>;
}