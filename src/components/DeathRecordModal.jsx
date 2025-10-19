// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Textarea, useToast } from '@/components/ui';
// @ts-ignore;
import { X, Calendar, AlertTriangle, Camera, Upload } from 'lucide-react';

export function DeathRecordModal({
  open,
  onOpenChange,
  chicken,
  location,
  onSuccess
}) {
  const {
    toast
  } = useToast();
  const [newRecord, setNewRecord] = useState({
    death_count: '',
    death_date: new Date().toISOString().split('T')[0],
    death_reason: '',
    notes: '',
    record_time: new Date().toISOString()
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const handleAddRecord = async () => {
    if (!newRecord.death_count || !newRecord.death_date || !newRecord.death_reason) {
      toast({
        title: '添加失败',
        description: '请填写死亡数量、日期和原因',
        variant: 'destructive'
      });
      return;
    }
    setLoading(true);
    try {
      // 保存死亡记录到数据库
      const recordData = {
        ...newRecord,
        death_count: parseInt(newRecord.death_count),
        death_date: new Date(newRecord.death_date).toISOString(),
        record_time: new Date().toISOString(),
        chicken_id: chicken?._id || '',
        location: location
      };
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'death_records',
        methodName: 'wedaCreateV2',
        params: {
          data: recordData
        }
      });

      // 如果有上传的图片，保存图片信息
      if (uploadedPhotos.length > 0) {
        // 这里可以添加图片保存逻辑
        console.log('保存图片信息:', uploadedPhotos);
      }
      toast({
        title: '添加成功',
        description: '死亡记录已保存'
      });

      // 重置表单
      setNewRecord({
        death_count: '',
        death_date: new Date().toISOString().split('T')[0],
        death_reason: '',
        notes: '',
        record_time: new Date().toISOString()
      });
      setUploadedPhotos([]);

      // 调用成功回调
      if (onSuccess) {
        onSuccess();
      }

      // 关闭模态框
      if (onOpenChange) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error('添加死亡记录失败:', error);
      toast({
        title: '添加失败',
        description: '网络错误，请重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const handlePhotoUpload = async event => {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({
        title: '上传失败',
        description: '请选择图片文件',
        variant: 'destructive'
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: '上传失败',
        description: '图片大小不能超过5MB',
        variant: 'destructive'
      });
      return;
    }
    setIsUploading(true);
    try {
      // 使用云存储上传图片
      const tcb = await $w.cloud.getCloudInstance();

      // 生成唯一的文件名
      const timestamp = Date.now();
      const fileName = `death_records/${location}_${timestamp}_${file.name}`;

      // 上传到云存储
      const uploadResult = await tcb.uploadFile({
        cloudPath: fileName,
        filePath: file
      });

      // 获取文件访问URL
      const fileURLResult = await tcb.getTempFileURL({
        fileList: [uploadResult.fileID]
      });
      const fileURL = fileURLResult.fileList[0].tempFileURL;
      const newPhoto = {
        id: timestamp,
        name: file.name,
        url: fileURL,
        fileID: uploadResult.fileID,
        uploadTime: new Date().toLocaleString()
      };
      setUploadedPhotos(prev => [newPhoto, ...prev]);
      toast({
        title: '上传成功',
        description: '照片已上传到云存储'
      });
    } catch (error) {
      console.error('图片上传失败:', error);
      toast({
        title: '上传失败',
        description: '请检查网络连接后重试',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };
  const handleDeletePhoto = async (photoId, fileID) => {
    try {
      // 从云存储删除图片
      if (fileID) {
        const tcb = await $w.cloud.getCloudInstance();
        await tcb.deleteFile({
          fileList: [fileID]
        });
      }
      setUploadedPhotos(prev => prev.filter(photo => photo.id !== photoId));
      toast({
        title: '删除成功',
        description: '照片已删除'
      });
    } catch (error) {
      console.error('删除图片失败:', error);
      toast({
        title: '删除失败',
        description: '请重试',
        variant: 'destructive'
      });
    }
  };
  const triggerFileInput = () => {
    document.getElementById('death-record-photo-upload').click();
  };
  if (!open) return null;
  return <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center">
            <AlertTriangle className="mr-2 text-red-600" size={20} />
            死亡记录管理 - {chicken?.breed || '鸡只'}
          </CardTitle>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="h-8 w-8 p-0">
            <X size={16} />
          </Button>
        </CardHeader>
        
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <CardContent className="space-y-4">
            {/* 添加新记录表单 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">添加死亡记录</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">死亡数量</label>
                  <Input type="number" value={newRecord.death_count} onChange={e => setNewRecord({
                  ...newRecord,
                  death_count: e.target.value
                })} placeholder="死亡鸡只数量" />
                </div>
                <div>
                  <label className="text-sm font-medium">死亡日期</label>
                  <Input type="date" value={newRecord.death_date} onChange={e => setNewRecord({
                  ...newRecord,
                  death_date: e.target.value
                })} />
                </div>
              </div>
              <div className="mt-3">
                <label className="text-sm font-medium">死亡原因</label>
                <Input value={newRecord.death_reason} onChange={e => setNewRecord({
                ...newRecord,
                death_reason: e.target.value
              })} placeholder="请输入死亡原因" />
              </div>
              <div className="mt-3">
                <label className="text-sm font-medium">备注</label>
                <Textarea value={newRecord.notes} onChange={e => setNewRecord({
                ...newRecord,
                notes: e.target.value
              })} placeholder="备注信息" rows={2} />
              </div>
              
              {/* 图片上传区域 */}
              <div className="mt-4">
                <label className="text-sm font-medium mb-2 block">相关图片证据</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <div className="flex flex-col items-center justify-center">
                    <input type="file" id="death-record-photo-upload" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    <Button onClick={triggerFileInput} variant="outline" className="mb-2" disabled={isUploading}>
                      {isUploading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div> : <Upload className="mr-2" size={16} />}
                      {isUploading ? '上传中...' : '选择图片'}
                    </Button>
                    <p className="text-xs text-gray-500 text-center">支持 JPG、PNG 格式，最大 5MB</p>
                  </div>
                  
                  {/* 已上传图片预览 */}
                  {uploadedPhotos.length > 0 && <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">已上传图片</h4>
                      <div className="flex flex-wrap gap-2">
                        {uploadedPhotos.map(photo => <div key={photo.id} className="relative">
                            <img src={photo.url} alt={photo.name} className="w-16 h-16 rounded object-cover border" />
                            <Button variant="ghost" size="sm" onClick={() => handleDeletePhoto(photo.id, photo.fileID)} className="absolute -top-2 -right-2 bg-red-500 text-white hover:bg-red-600 w-5 h-5 p-0 rounded-full">
                              <X size={10} />
                            </Button>
                          </div>)}
                      </div>
                    </div>}
                </div>
              </div>
              
              <Button onClick={handleAddRecord} className="w-full mt-3 bg-red-600 hover:bg-red-700" disabled={loading}>
                {loading ? '保存中...' : '添加死亡记录'}
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>;
}