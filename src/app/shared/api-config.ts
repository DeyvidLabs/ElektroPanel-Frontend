import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ApiConfigService {
  private readonly apiUrl = 'https://panel.deyvid.dev/api';

  constructor() {}

  getApiUrl(): string {
    return this.apiUrl;
  }
}
