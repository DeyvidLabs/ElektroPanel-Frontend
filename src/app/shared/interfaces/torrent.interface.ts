export interface Torrent {
  id: number;
  name: string;
  hash: string;
  totalSize: string;
  status: number;
  progress: number;
  percentDone: number;
  downloadDir?: string;
  addedDate?: number;
  rateDownload?: number;
  rateUpload?: number;
  addedBy: string;
  location: string;
}