// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';
// @ts-ignore;
import { Edit, Trash2, Camera, Users, Calendar, Heart } from 'lucide-react';

export function ChickenCard({
  chicken,
  onEdit,
  onDelete,
  onDeathRecord
}) {
  return <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center">
            <Users className="mr-2 text-green-600" size={20} />
            <span>{chicken.breed}</span>
          </div>
          <div className="flex space-x-1">
            <Button variant="ghost" size="sm" onClick={onEdit} className="text-blue-600 hover:text-blue-800">
              <Edit size={16} />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDeathRecord} className="text-red-600 hover:text-red-800">
              <Camera size={16} />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-600 hover:text-red-800">
              <Trash2 size={16} />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center">
            <span className="font-medium text-gray-700">数量:</span>
            <span className="ml-2 text-gray-900 font-semibold">{chicken.count}只</span>
          </div>
          <div className="flex items-center">
            <span className="font-medium text-gray-700">品种:</span>
            <span className="ml-2 text-gray-900">{chicken.breed}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="mr-1 text-blue-500" size={16} />
            <span className="text-gray-700">日龄:</span>
            <span className="ml-1 text-gray-900 font-medium">{chicken.age}天</span>
          </div>
          <div className="flex items-center">
            <Heart className="mr-1 text-red-500" size={16} />
            <span className="text-gray-700">死亡率:</span>
            <span className="ml-1 text-gray-900 font-medium">{chicken.mortality}%</span>
          </div>
        </div>
        {chicken.notes && <div className="mt-3 p-2 bg-gray-50 rounded">
            <p className="text-xs text-gray-600">{chicken.notes}</p>
          </div>}
      </CardContent>
    </Card>;
}