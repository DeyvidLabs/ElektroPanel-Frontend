// email.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { debounceTime, Subscription } from 'rxjs';
import { LayoutService } from '../../core/services/layout';
import { FluidModule } from 'primeng/fluid';
import { EmailService } from './service';
import { format } from 'date-fns';
import { AppConfigurator } from "../../shared/navigation/parts/app.configurator";
import { Table, TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { IBlacklistIPInfo, IEmailHistory, IEmailUser } from '../../shared/interfaces/email.interfaces';


@Component({
  selector: 'app-timeframe-chart',
  templateUrl: './email.html',
  standalone: true,
  imports: [ButtonModule, ChartModule, CommonModule, FluidModule, AppConfigurator, TableModule, TooltipModule, IconFieldModule, InputIconModule, TagModule, InputTextModule]
})
export class Email implements OnInit {
    barData: any;
    barOptions: any;

    selectedRange: 'Daily' | 'Weekly' | 'Monthly' | 'Yearly' = 'Daily';
    timeRanges: Array<'Daily' | 'Weekly' | 'Monthly' | 'Yearly'> = ['Daily', 'Weekly', 'Monthly', 'Yearly'];
    emailHistory: IEmailHistory | null = null;

    subscription: Subscription;

    maliciousIPs: IBlacklistIPInfo[] = [];

    registeredUsers: IEmailUser[] = [];

    constructor(
      private layoutService: LayoutService,
      private emailService: EmailService
    ) {
      this.subscription = this.layoutService.configUpdate$
        .pipe(debounceTime(25))
        .subscribe(() => this.updateChart());
    }

    async ngOnInit() {
      await this.loadEmailHistory();
      this.updateChart();
      await this.loadMalicious();
      await this.getAllUsers();
    }

    async blacklist(ipAddress: IBlacklistIPInfo, index: number) {
      try {
        this.emailService.blacklistIPAddress(ipAddress.address).subscribe({
          next: res => console.log(res),
          error: err => console.error('Error:', err)
        });
        
      } catch (error) {
        console.error('Failed to load email history:', error);
      }
    }

    async unblacklist(ipAddress: IBlacklistIPInfo, index: number) {
      try {
        this.emailService.unblacklistIPAddress(ipAddress.address).subscribe({
          next: res => console.log(res),
          error: err => console.error('Error:', err)
        });
      } catch (error) {
        console.error('Failed to load email history:', error);
      }
    }

    async loadEmailHistory() {
      try {
        const result = <IEmailHistory> await this.emailService.getEmailHistory().toPromise();
        // const result = await this.http.get<EmailHistory>('/email/history').toPromise();
        this.emailHistory = result === undefined ? null : result;
      } catch (error) {
        console.error('Failed to load email history:', error);
      }
    }

    async getAllUsers() {
      try {
        const result = <IEmailUser[]> await this.emailService.getAllUsers().toPromise();
        this.registeredUsers = result === undefined ? [] : result;
      } catch (error) {
        console.error('Failed to load email history:', error);
      }
    }

  async loadMalicious() {
    try {
      const result = await this.emailService.getMaliciousIPs().toPromise();
      this.maliciousIPs = result === undefined ? [] : result.map(ip => ({
        ...ip,
        info: {
          isp: ip.info?.isp || 'Unknown ISP',
          org: ip.info?.org || 'Unknown Organization',
          country: ip.info?.country || 'Unknown Country'
        }
      }));
    } catch (error) {
      console.error('Failed to load malicious IPs:', error);
    }
  }

    onGlobalFilter(table: Table, event: Event) {
      table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    async setRange(range: 'Daily' | 'Weekly' | 'Monthly' | 'Yearly') {
      this.selectedRange = range;
      this.updateChart();
    }

    updateChart() {
      if (!this.emailHistory) return;

      const style = getComputedStyle(document.documentElement);
      const textColor = style.getPropertyValue('--text-color');
      const textColorSecondary = style.getPropertyValue('--text-color-secondary');
      const surfaceBorder = style.getPropertyValue('--surface-border');
      const primary = style.getPropertyValue('--p-primary-500');
      const secondary = style.getPropertyValue('--p-quaternary-300');

      let labels: string[] = [];
      let inData: number[] = [];
      let outData: number[] = [];

      switch (this.selectedRange) {
        case 'Daily':
          labels = this.emailHistory.daily.map(d => 
            new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })          
          );
          inData = this.emailHistory.daily.map(d => d.in);
          outData = this.emailHistory.daily.map(d => d.out);
          break;
          
        case 'Weekly':
          labels = this.emailHistory.weekly.map((w, i) => 
            `Week ${i + 1} (${format(w.weekStart, 'MMM dd')} - ${format(w.weekEnd, 'MMM dd')})`
          );
          inData = this.emailHistory.weekly.map(w => w.in);
          outData = this.emailHistory.weekly.map(w => w.out);
          break;
          
        case 'Monthly':
          labels = this.emailHistory.monthly.map(m => 
            format(m.monthStart, 'MMM yyyy')
          );
          inData = this.emailHistory.monthly.map(m => m.in);
          outData = this.emailHistory.monthly.map(m => m.out);
          break;
          
        case 'Yearly':
          labels = this.emailHistory.yearly.map(y => 
            format(y.yearStart, 'yyyy')
          );
          inData = this.emailHistory.yearly.map(y => y.in);
          outData = this.emailHistory.yearly.map(y => y.out);
          break;
      }

      this.barData = {
        labels: labels,
        datasets: [
          {
            label: 'Incoming',
            backgroundColor: primary,
            borderColor: primary,
            data: inData
          },
          {
            label: 'Outgoing',
            backgroundColor: secondary,
            borderColor: secondary,
            data: outData
          }
        ]
      };

      this.barOptions = {
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        plugins: {
          legend: {
            labels: {
              color: textColor
            }
          }
        },
        scales: {
          x: {
            ticks: {
              color: textColorSecondary,
              font: {
                weight: 500
              }
            },
            grid: {
              display: false,
              drawBorder: false
            }
          },
          y: {
            ticks: {
              color: textColorSecondary,
              stepSize: 1,
            },
            grid: {
              color: surfaceBorder,
              drawBorder: false
            }
          }
        }
      };
    }

    ngOnDestroy() {
        this.subscription?.unsubscribe();
    }
}