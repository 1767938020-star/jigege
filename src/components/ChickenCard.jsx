// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui';
// @ts-ignore;
import { Edit, Trash2, AlertTriangle, Loader2 } from 'lucide-react';

export function ChickenCard({
  chicken,
  onEdit,
  onDelete,
  onDeathRecord,
  deleteLoading
}) {
  const getStatusColor = status => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'sick':
        return 'bg-yellow-100 text-yellow-800';
      case 'dead':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  return <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{chicken.breed}</CardTitle>
            <Badge className={`mt-1 ${getStatusColor(chicken.status)}`}>
              {chicken.status === 'active' ? '健康' : chicken.status === 'sick' ? '生病' : '死亡'}
            </Badge>
          </div>
          <div className="flex space-x-1">
            <Button variant="ghost" size="sm" onClick={onEdit} className="text-blue-600 hover:text-blue-800">
              <Edit size={16} />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete} disabled={deleteLoading} className="text-red-600 hover:text-red-800">
              {deleteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 size={16} />}
            </Button>
            <Button variant="ghost" size="sm" onClick={onDeathRecord} className="text-orange-600 hover:text-orange-800">
              <AlertTriangle size={16} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">数量:</span>
            <span className="ml-2 font-medium">{chicken.count}只</span>
          </div>
          <div>
            <span className="text-gray-600">日龄:</span>
            <span className="ml-2 font-medium">{chicken.age}天</span>
          </div>
          <div>
            <span className="text-gray-600">死亡率:</span>
            <span className="ml-2 font-medium">{chicken.mortality || 0}%</span>
          </div>
          <div>
            <span className="text-gray-600">场地:</span>
            <span className="ml-2 font-medium">{chicken.location}</span>
          </div>
        </div>
        {chicken.notes && <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
            <span className="text-gray-600">备注:</span>
            <span className="ml-2">{chicken.notes}</span>
          </div>}
      </CardContent>
    </Card>;
}