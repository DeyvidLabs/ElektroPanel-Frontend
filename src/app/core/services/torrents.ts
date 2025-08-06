// torrents.service.ts
import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { first, Observable, switchMap } from 'rxjs';
import { Torrent } from '../../shared/interfaces/torrent.interface';

@Injectable({
  providedIn: 'root',
})
export class TorrentsService {
  constructor(private socket: Socket) {
    this.socket.on('connect', () => {
      console.log('Socket ID:', this.socket.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.warn('Disconnected:', reason);
    });

    this.socket.on('connect_error', (err) => {
      console.error('Connection error:', err.message);
    });
  }

  // Listen for torrent updates
  listenForUpdates(): Observable<Torrent[]> {
    return new Observable(observer => {
      const sub = this.socket.fromEvent<Torrent[]>('torrentsUpdate').subscribe(observer);
      this.requestTorrents(); // Request data on subscription
      return () => sub.unsubscribe();
    });
  }

  // Request torrent data.
  requestTorrents(): void {
    this.socket.emit('getTorrents');
  }

  // Adds a torrent via magnet.
  addMagnet(magnetLink: string, downloadDir?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket.emit(
        'addMagnet',
        { magnetLink, downloadDir },
        (response: { success: boolean; error?: string }) => {
          if (response.success) resolve();
          else reject(new Error(response.error));
        }
      );
    });
  }

  // Start torrent(s).
  startTorrents(ids?: number[]): void {
    this.socket.emit('startTorrents', { ids });
  }

  // Pause torrent(s).
  pauseTorrents(ids?: number[]): void {
    this.socket.emit('pauseTorrents', { ids });
  }

  // Deletes a torrent and its downloaded data.
  removeTorrents(ids: number[]): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket.emit('removeTorrents', { ids }, (response: { success: boolean; error?: string }) => {
        if (response.success) resolve();
        else reject(new Error(response.error));
      });
    });
  }

  // Changes torrent save location.
  changeTorrentLocation(id: number, location: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket.emit('changeTorrentLocation', { id, location }, (response: { success: boolean; error?: string }) => {
        if (response.success) {
          resolve();
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

}