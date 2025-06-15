import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

    constructor(private service: MessageService) {}

    info(summary: string = 'Info Message', detail: string = 'Sample info message', duration: number = 3000) {
        this.service.add({ severity: 'info', summary: summary, detail, life: duration });
    }

    warn(summary: string = 'Warn Message', detail: string = 'There are unsaved changes', duration: number = 3000) {
        this.service.add({ severity: 'warn', summary: summary, detail: detail, life: duration });
    }

    error(summary: string = 'Error Message', detail: string = 'Validation failed', duration: number = 3000) {
        this.service.add({ severity: 'error', summary: summary, detail: detail, life: duration });
    }

    success(summary: string = 'Success Message', detail: string = 'Message sent', duration: number = 3000) {
        this.service.add({ severity: 'success', summary: summary, detail: detail, life: duration });
    }
}
