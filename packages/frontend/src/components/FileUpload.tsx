// Single Responsibility Principle - Handles file upload UI and validation
import React, { useState } from 'react';
import { UsersDataInput } from '../types';

interface FileUploadProps {
  onFileProcessed: (data: UsersDataInput) => void;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileProcessed,
  disabled = false
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateJsonData = (data: any): data is UsersDataInput => {
    if (!data || typeof data !== 'object') {
      return false;
    }

    if (!data.date_generated || typeof data.date_generated !== 'number') {
      return false;
    }

    if (!Array.isArray(data.users_data) || data.users_data.length === 0) {
      return false;
    }

    // Validate each user object
    return data.users_data.every((user: any) =>
      user.UserId &&
      user.Email &&
      user.UserAddress &&
      user.Reputation !== undefined &&
      user.PrePoints !== undefined &&
      user.Points !== undefined &&
      user.CummulativePoints !== undefined
    );
  };

  const processFile = async (file: File) => {
    setError(null);

    if (!file.type.includes('json')) {
      setError('Please select a JSON file');
      return;
    }

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!validateJsonData(data)) {
        setError('Invalid JSON format. Expected { date_generated: number, users_data: UserData[] }');
        return;
      }

      onFileProcessed(data);
    } catch (err) {
      setError('Failed to parse JSON file');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    if (e.dataTransfer.files?.[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.target.files?.[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="file-upload-container">
      <div
        className={`file-upload-area ${dragActive ? 'drag-active' : ''} ${disabled ? 'disabled' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          disabled={disabled}
          className="file-input"
          id="file-input"
        />
        <label htmlFor="file-input" className="file-label">
          <div className="upload-icon">📁</div>
          <p>Drop JSON file here or <span className="browse-text">browse</span></p>
          <p className="file-format">Expected format: {`{date_generated: number, users_data: UserData[]}`}</p>
        </label>
      </div>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

    </div>
  );
};