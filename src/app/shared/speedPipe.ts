import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'speed'
})
export class SpeedPipe implements PipeTransform {
  transform(bytesPerSecond: number): string {
    if (!bytesPerSecond || bytesPerSecond <= 0) return '0 B/s';

    const units = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
    let i = 0;

    while (bytesPerSecond >= 1024 && i < units.length - 1) {
      bytesPerSecond /= 1024;
      i++;
    }

    return `${bytesPerSecond.toFixed(1)} ${units[i]}`;
  }
}
