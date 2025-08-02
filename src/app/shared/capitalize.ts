import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalize'
})
export class CapitalizeFirstWordPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return value;

    const [firstWord, ...rest] = value.trim().split(/\s+/);
    return [
      firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase(),
      ...rest
    ].join(' ');
  }
}
