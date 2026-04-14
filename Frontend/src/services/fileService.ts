import axios from 'axios';

const API_BASE = '/api/files';

export interface FileData {
  path: string;
  name: string;
  content: string;
  language?: string;
  type: 'file' | 'folder';
}

export interface FileResponse {
  file: any;
  files?: any[];
  structure?: any;
  message?: string;
}

class FileService {
  /**
   * Get all files for a project
   */
  async getProjectFiles(projectId: string): Promise<any[]> {
    const response = await axios.get<{ files: any[] }>(
      `${API_BASE}/projects/${projectId}/files`
    );
    return response.data.files;
  }

  /**
   * Get file structure (tree) for a project
   */
  async getFileStructure(projectId: string): Promise<any> {
    const response = await axios.get<{ structure: any }>(
      `${API_BASE}/projects/${projectId}/file-structure`
    );
    return response.data.structure;
  }

  /**
   * Get a specific file
   */
  async getFile(projectId: string, filePath: string): Promise<any> {
    const response = await axios.get<{ file: any }>(
      `${API_BASE}/projects/${projectId}/files/${encodeURIComponent(filePath)}`
    );
    return response.data.file;
  }

  /**
   * Save or update a file
   */
  async saveFile(projectId: string, fileData: FileData): Promise<any> {
    const response = await axios.post<FileResponse>(
      `${API_BASE}/projects/${projectId}/files`,
      fileData
    );
    return response.data.file;
  }

  /**
   * Batch save multiple files
   */
  async batchSaveFiles(projectId: string, files: FileData[]): Promise<any[]> {
    const response = await axios.post<{ files: any[] }>(
      `${API_BASE}/projects/${projectId}/files/batch`,
      { files }
    );
    return response.data.files;
  }

  /**
   * Delete a file
   */
  async deleteFile(projectId: string, filePath: string): Promise<void> {
    await axios.delete(
      `${API_BASE}/projects/${projectId}/files/${encodeURIComponent(filePath)}`
    );
  }

  /**
   * Commit changes (git)
   */
  async commitChanges(projectId: string, message: string, files?: string[]): Promise<any> {
    const response = await axios.post(
      `${API_BASE}/projects/${projectId}/git/commit`,
      { message, files }
    );
    return response.data;
  }

  /**
   * Push changes to remote
   */
  async pushChanges(projectId: string, branch?: string): Promise<any> {
    const response = await axios.post(
      `${API_BASE}/projects/${projectId}/git/push`,
      { branch }
    );
    return response.data;
  }

  /**
   * Pull changes from remote
   */
  async pullChanges(projectId: string, branch?: string): Promise<any> {
    const response = await axios.post(
      `${API_BASE}/projects/${projectId}/git/pull`,
      { branch }
    );
    return response.data;
  }

  /**
   * Get git status
   */
  async getGitStatus(projectId: string): Promise<any> {
    const response = await axios.get(
      `${API_BASE}/projects/${projectId}/git/status`
    );
    return response.data;
  }
}

export const fileService = new FileService();
