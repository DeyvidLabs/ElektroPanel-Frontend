import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { ConfirmationService, MessageService } from 'primeng/api';
import { provideSocketIo, SocketIoConfig } from 'ngx-socket-io';

// app.config.ts
const socketConfig = {
  url: 'https://panel.deyvid.dev', // Your domain
  options: {
    path: '/api/socket.io',       // Must match NestJS path
    transports: ['websocket'],     // Force WebSocket transport
    secure: true,                  // Required for HTTPS
    autoConnect: true,             // Connect immediately
    withCredentials: true          // Send cookies if needed
  }
};
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes, withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }), withEnabledBlockingInitialNavigation()),
    provideHttpClient(),
    provideAnimationsAsync(),
    providePrimeNG({ theme: { preset: Aura, options: { darkModeSelector: '.app-dark' } } }),
    provideSocketIo(socketConfig),
    MessageService,
    ConfirmationService
    
  ]
};
