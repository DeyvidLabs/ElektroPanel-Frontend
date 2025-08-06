import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { TorrentsService } from '../../core/services/torrents';
import { ToastService } from '../../shared/toasts';
import { ConfirmationService } from 'primeng/api';
import { Torrent } from '../../shared/interfaces/torrent.interface';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormControl, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { SocketIoModule } from 'ngx-socket-io';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FluidModule } from 'primeng/fluid';
import { IconFieldModule } from 'primeng/iconfield';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ProgressBarModule } from 'primeng/progressbar';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { AppConfigurator } from '../../shared/navigation/parts/app.configurator';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SpeedPipe } from '../../shared/speedPipe';
import { ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-torrents',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    PasswordModule,
    DialogModule,
    InputTextModule,
    ToastModule,
    FluidModule,
    TagModule,
    ProgressBarModule,
    TableModule,
    IconFieldModule,
    InputIconModule,
    ReactiveFormsModule,
    InputGroupModule,
    AppConfigurator,
    InputGroupAddonModule,
    ConfirmDialogModule,
    SpeedPipe
  ],
  templateUrl: './torrents.html',
  styleUrls: ['./torrents.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Torrents implements OnInit {

  constructor(
    private toastService: ToastService,
    private torrentsService: TorrentsService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  searchText: string = '';
  loading: boolean = false;
  torrents: Torrent[] = [];
  selectedTorrents: Torrent[] = [];
  torrentMap = new Map<number, Torrent>();
  downloadDir: string = '/media/torrents';

  @ViewChild('dtTorrents') dtTorrents!: Table;
  locationDialogVisible = false;
  selectedTorrentForLocationChange: any = null;
  selectedTorrentLocation = '';
  newTorrentLocation = '';

  // Add these methods
  showLocationDialog(torrent: Torrent) {
    // Get the latest version of the torrent from the map
    const latestTorrent = this.torrentMap.get(torrent.id) || torrent;
    this.selectedTorrentForLocationChange = latestTorrent;
    this.selectedTorrentLocation = latestTorrent.location || 'Unknown';
    this.newTorrentLocation = this.selectedTorrentLocation;
    this.locationDialogVisible = true;
  }

  async changeTorrentLocation() {
    if (!this.selectedTorrentForLocationChange || !this.newTorrentLocation) return;
    if (this.selectedTorrentLocation === this.newTorrentLocation) return;
    this.loading = true;
    try {
      await this.torrentsService.changeTorrentLocation(
        this.selectedTorrentForLocationChange.id,
        this.newTorrentLocation
      );

      const updatedTorrent = this.torrentMap.get(this.selectedTorrentForLocationChange.id);
      if (updatedTorrent) {
        updatedTorrent.location = this.newTorrentLocation;
        this.torrentMap.set(updatedTorrent.id, updatedTorrent);
        this.cdr.markForCheck();
      }

      this.toastService.success('Success', 'Torrent location changed successfully');
      this.locationDialogVisible = false;
    } catch (error: any) {
      this.toastService.error('Error', error.message);
    } finally {
      await new Promise(resolve => setTimeout(resolve, 500));
      this.loading = false;
    }
  }

  onSearchChange(value: string) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { search: value || null },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });

    // Apply the global filter
    if (this.dtTorrents) {
      this.dtTorrents.filterGlobal(value, 'contains');
    }
  }

  clearSearch() {
    this.searchText = ''
    this.onSearchChange('');

  }

  magnetControl = new FormControl('', [
    Validators.required,
    this.validateMagnetLink
  ]);

  get magnetLinkError(): string | null {
    if (this.magnetControl.hasError('required')) {
      return 'Magnet link is required';
    }
    if (this.magnetControl.hasError('invalidMagnet')) {
      return 'Invalid magnet link format';
    }
    if (this.magnetControl.hasError('unsupportedHash')) {
      return 'Unsupported hash type';
    }
    return null;
  }

  validateMagnetLink(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const magnetPattern = /^magnet:\?xt=urn:[a-z0-9]+:[a-z0-9]{32,40}(&.*)?$/i;

    const commonHashes = ['btih', 'sha1', 'md5', 'ed2k'];

    if (!magnetPattern.test(value)) {
      return { invalidMagnet: true };
    }

    const hasValidHash = commonHashes.some(hash =>
      value.toLowerCase().includes(`xt=urn:${hash}:`)
    );

    if (!hasValidHash) {
      return { unsupportedHash: true };
    }

    return null; // Valid magnet link
  }



  private updateTorrents(newTorrents: Torrent[]) {
    let hasChanges = false;

    const newMap = new Map<number, Torrent>(newTorrents.map(t => [t.id, t]));

    this.torrentMap.forEach((torrent, id) => {
      const newTorrent = newMap.get(id);
      if (newTorrent && this.hasTorrentChanged(torrent, newTorrent)) {
        this.torrentMap.set(id, { ...newTorrent });
        hasChanges = true;
      }
    });

    newTorrents.forEach(t => {
      if (!this.torrentMap.has(t.id)) {
        this.torrentMap.set(t.id, t);
        hasChanges = true;
      }
    });

    const removed = [...this.torrentMap.keys()].filter(id => !newMap.has(id));
    removed.forEach(id => {
      this.torrentMap.delete(id);
      hasChanges = true;
    });

    if (hasChanges) {
      this.torrents = Array.from(this.torrentMap.values());
      this.cdr.markForCheck();
    }
  }

  ngAfterViewInit() {
    this.route.queryParams.subscribe((params) => {
      const search = params['search'];
      if (search && this.dtTorrents) {
        setTimeout(() => {
          this.searchText = search;
          this.dtTorrents.filterGlobal(search, 'contains');
        });
      }
    });
  }

  private hasTorrentChanged(oldT: Torrent, newT: Torrent): boolean {
    const relevantProps: (keyof Torrent)[] = [
      'progress', 'status', 'rateDownload', 'rateUpload', 'percentDone', 'location'
    ];
    return relevantProps.some(prop => oldT[prop] !== newT[prop]);
  }

  ngOnInit() {
    this.torrentsService.listenForUpdates().subscribe({
      next: (torrents) => {
        this.updateTorrents(torrents);
      },
      error: (err) => console.error('WebSocket error:', err)
    });
  }

  addMagnet() {
    if (!this.magnetControl || !this.magnetControl.value || this.magnetControl.invalid) return;

    this.loading = true;
    this.torrentsService.addMagnet(this.magnetControl.value.trim(), this.downloadDir)
      .then(async () => {
        this.toastService.success('Success', 'Torrent added successfully');
        await new Promise(resolve => setTimeout(resolve, 500));
        this.loading = false;
        this.magnetControl.reset();
      })
      .catch(err => {
        this.loading = false;
        this.toastService.error('Error', err.message);
      });
  }

  resumeTorrent(torrent: Torrent) {
    this.torrentsService.startTorrents([torrent.id]);
  }

  pauseTorrent(torrent: Torrent) {
    this.torrentsService.pauseTorrents([torrent.id]);
  }

  unselectAllTorrents(): void {
    this.selectedTorrents = [];
  }


  removeTorrent(torrent: Torrent) {
    this.confirmationService.confirm({
      message: `Are you sure you want to remove "${torrent.name}"?`,
      header: 'Confirm Removal',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.torrentsService.removeTorrents([torrent.id])
          .then(() => {
            this.toastService.success('Success', 'Torrent removed successfully');
          })
          .catch(err => {
            this.toastService.error('Error', err);
          });
      }
    });
  }


  removeSelectedTorrents() {
    if (this.selectedTorrents.length === 0) return;

    this.confirmationService.confirm({
      message: `Are you sure you want to remove ${this.selectedTorrents.length} selected torrent(s)?`,
      header: 'Confirm Removal',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const ids = this.selectedTorrents.map(t => t.id);
        this.torrentsService.removeTorrents(ids)
          .then(() => {
            this.toastService.success('Success', 'Torrents removed successfully');
          })
          .catch(err => {
            this.toastService.error('Error', err);
          });
        this.selectedTorrents = [];
      }
    });
  }

  pauseSelectedTorrents() {
    if (this.selectedTorrents.length === 0) return;
    const ids = this.selectedTorrents.map(t => t.id);
    this.torrentsService.pauseTorrents(ids);
  }

  resumeSelectedTorrents() {
    if (this.selectedTorrents.length === 0) return;
    const ids = this.selectedTorrents.map(t => t.id);
    this.torrentsService.startTorrents(ids);
  }

  getStatusString(status: number): string {
    switch (status) {
      case 4: return 'Downloading';
      case 6: return 'Seeding';
      case 0: return 'Paused';
      case 2: return 'Checking';
      case 3:
      case 5: return 'Queued';
      default: return 'Other';
    }
  }

  getStatusSeverity(status: number): string {
    switch (status) {
      case 4: return 'info';
      case 0: return 'warning';
      case 6: return 'success';
      default: return 'secondary';
    }
  }

  formatDownloadSpeed(rate: number | undefined): string {
    if (!rate) return '0 KB/s';
    return rate >= 1024
      ? `${(rate / 1024).toFixed(1)} MB/s`
      : `${Math.round(rate)} KB/s`;
  }
}