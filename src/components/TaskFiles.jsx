import { useState, useEffect } from 'react';
import { DocumentIcon, TrashIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { taskAPI } from '../services/api';

export default function TaskFiles({ taskId, projectId, userId, isReadOnly = false }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (taskId && projectId && userId) {
      loadFiles();
    }
  }, [taskId, projectId, userId]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await taskAPI.getTaskFiles(taskId, projectId, userId);
      setFiles(response.data || []);
    } catch (error) {
      console.error('Error loading task files:', error);
      setError('Không thể tải danh sách files');
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File quá lớn. Kích thước tối đa cho phép là 10MB.');
      return;
    }

    try {
      setUploading(true);
      setError('');
      
      const response = await taskAPI.uploadTaskFile(taskId, projectId, userId, file);
      
      // Add new file to list
      setFiles(prev => [...prev, response.data]);
      
      // Clear file input
      event.target.value = '';
      
      console.log('File uploaded successfully:', response.data);
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Không thể upload file. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!confirm('Bạn có chắc muốn xóa file này?')) {
      return;
    }

    try {
      await taskAPI.deleteTaskFile(taskId, fileId, projectId, userId);
      
      // Remove file from list
      setFiles(prev => prev.filter(f => f.fileId !== fileId));
      
      console.log('File deleted successfully');
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Không thể xóa file. Vui lòng thử lại.');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!taskId || !projectId || !userId) {
    return (
      <div className="text-gray-500 text-sm">
        Cần có taskId, projectId và userId để hiển thị files
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with upload button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Files đính kèm ({files.length})
        </h3>
        
        {!isReadOnly && (
          <label className="relative cursor-pointer">
            <input
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
              accept="*/*"
            />
            <div className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
              uploading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
            }`}>
              <CloudArrowUpIcon className="h-4 w-4 mr-2" />
              {uploading ? 'Đang upload...' : 'Upload file'}
            </div>
          </label>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Đang tải...</span>
        </div>
      )}

      {/* Files list */}
      {!loading && (
        <div className="space-y-2">
          {files.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <DocumentIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>Chưa có file nào được đính kèm</p>
            </div>
          ) : (
            files.map((file) => (
              <div
                key={file.fileId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md border"
              >
                <div className="flex items-center flex-1">
                  <DocumentIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.fileName}
                    </p>
                    <div className="flex items-center text-xs text-gray-500 space-x-2">
                      <span>{formatFileSize(file.fileSize || 0)}</span>
                      <span>•</span>
                      <span>{file.contentType}</span>
                      {file.uploadedAt && (
                        <>
                          <span>•</span>
                          <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {!isReadOnly && (
                  <button
                    onClick={() => handleDeleteFile(file.fileId)}
                    className="ml-3 p-1 text-red-400 hover:text-red-600 transition-colors"
                    title="Xóa file"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Upload guidelines */}
      {!isReadOnly && (
        <div className="text-xs text-gray-500 border-t pt-2">
          <p>• Kích thước file tối đa: 10MB</p>
          <p>• Hỗ trợ tất cả loại file</p>
        </div>
      )}
    </div>
  );
}