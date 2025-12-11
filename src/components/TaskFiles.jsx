import { useState, useEffect } from 'react';
import { DocumentIcon, TrashIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { taskAPI } from '../services/api';

export default function TaskFiles({ taskId, projectId, userId, isReadOnly = false }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingFileId, setDeletingFileId] = useState(null);
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
      
      console.log('📂 Loading files for:', {
        taskId,
        projectId,
        userId
      });
      
      const response = await taskAPI.getTaskFiles(taskId, projectId, userId);
      const files = response.data || [];
      
      console.log('📂 Loaded files:', files);
      console.log('📂 Sample file structure:', files[0]);
      
      setFiles(files);
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

    console.log('📤 Attempting to upload file:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    });

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File quá lớn. Kích thước tối đa cho phép là 10MB.');
      return;
    }

    try {
      setUploading(true);
      setError('');
      
      console.log('📤 Calling API with params:', { taskId, projectId, userId });
      const response = await taskAPI.uploadTaskFile(taskId, projectId, userId, file);
      console.log('📤 Upload response:', response);
      
      // Add new file to list
      setFiles(prev => [...prev, response.data]);
      
      // Refresh file list after 1 second to ensure sync
      setTimeout(() => {
        console.log('🔄 Auto-refreshing file list after upload');
        loadFiles();
      }, 1000);
      
      // Clear file input
      event.target.value = '';
      
      console.log('File uploaded successfully:', response.data);
      
      // Clear file input
      event.target.value = '';
      
      console.log('File uploaded successfully:', response.data);
    } catch (error) {
      console.error('❌ Error uploading file:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      let errorMessage = 'Không thể upload file. Vui lòng thử lại.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadFile = async (fileId, fileName) => {
    try {
      console.log('📥 Starting download:', { taskId, fileId, projectId, userId, fileName });
      
      const response = await taskAPI.downloadTaskFile(taskId, fileId, projectId, userId);
      console.log('📄 API Response:', response.data);
      
      // Backend trả về pre-signed URL
      const downloadUrl = response.data.downloadUrl;
      
      if (!downloadUrl) {
        throw new Error('No download URL received');
      }
      
      console.log('🔗 Pre-signed URL received:', downloadUrl.substring(0, 100) + '...');
      
      // Test: Mở URL trong tab mới để kiểm tra
      window.open(downloadUrl, '_blank');
      
      console.log('✅ File download initiated successfully:', fileName);
    } catch (error) {
      console.error('❌ Error downloading file:', error);
      setError('Không thể tải file. Vui lòng thử lại.');
    }
  };

  const handleDeleteFile = async (fileId, fileName) => {
    if (!confirm(`Bạn có chắc muốn xóa file "${fileName}"?`)) {
      return;
    }

    try {
      setDeletingFileId(fileId);
      setError('');
      
      console.log('🗑️ Attempting to delete file:', {
        taskId,
        fileId,
        projectId,
        userId,
        fileName
      });
      
      await taskAPI.deleteTaskFile(taskId, fileId, projectId, userId);
      
      // Remove file from list
      setFiles(prev => prev.filter(f => f.fileId !== fileId));
      
      console.log('✅ File deleted successfully:', fileName);
    } catch (error) {
      console.error('❌ Error deleting file:', error);
      
      let errorMessage = 'Không thể xóa file. Vui lòng thử lại.';
      
      // Handle specific error cases
      if (error.response?.status === 404) {
        errorMessage = 'Không thể xóa file. Vui lòng thử lại.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Bạn không có quyền xóa file này.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Lỗi máy chủ. Vui lòng thử lại sau.';
      }
      
      setError(errorMessage);
    } finally {
      setDeletingFileId(null);
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
        <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => setError('')}
            className="ml-2 text-red-500 hover:text-red-700 font-semibold"
            title="Đóng thông báo"
          >
            ×
          </button>
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
                
                <div className="flex items-center space-x-2">
                  {/* Download button */}
                  <button
                    onClick={() => handleDownloadFile(file.fileId, file.fileName)}
                    className="p-1 text-blue-400 hover:text-blue-600 transition-colors"
                    title="Tải file"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>
                  
                  {/* Delete button */}
                  {!isReadOnly && (
                    <button
                      onClick={() => handleDeleteFile(file.fileId, file.fileName)}
                      disabled={deletingFileId === file.fileId}
                      className={`p-1 transition-colors ${
                        deletingFileId === file.fileId
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-red-400 hover:text-red-600'
                      }`}
                      title="Xóa file"
                    >
                      {deletingFileId === file.fileId ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                      ) : (
                        <TrashIcon className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </div>
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