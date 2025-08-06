import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    standalone: true,
    imports: [CommonModule],
    selector: 'clickable-tag',
    template: `
      <a *ngIf="target" class="p-tag p-tag-{{type}} p-tag-clickable cursor-pointer" [attr.data-user-id]="target.id" (click)="handleClick(target)">
          {{target.displayName || target.name || target.id}}
      </a>

      <a *ngIf="actor" class="p-tag p-tag-{{type}} p-tag-clickable cursor-pointer" [attr.data-user-id]="actor.id" (click)="handleClick(actor)">
          {{actor.displayName || actor.name || actor.id}}
      </a>

      <a *ngIf="vm" class="p-tag p-tag-{{type}} p-tag-clickable cursor-pointer" [attr.data-vm-id]="vm.id" (click)="handleClick(vm)">
          {{vm.id}}
      </a>

      <a *ngIf="node" class="p-tag p-tag-{{type}} p-tag-clickable cursor-pointer" [attr.data-node-name]="node.name" (click)="handleClick(node)">
          {{node.name}}
      </a>

      <a *ngIf="ipAddress" class="p-tag p-tag-{{type}} p-tag-clickable cursor-pointer" [attr.data-ipAddress-id]="ipAddress.id" (click)="handleClick(ipAddress)">
        {{ipAddress.id}}
      </a>

      <a *ngIf="oldEmail" class="p-tag p-tag-{{type}} p-tag-clickable cursor-pointer" [attr.data-user-id]="oldEmail.changedBy" (click)="handleClick(oldEmail)">
        {{oldEmail.oldEmail}}
      </a>

      <a *ngIf="newEmail" class="p-tag p-tag-{{type}} p-tag-clickable cursor-pointer" [attr.data-user-id]="newEmail.changedBy" (click)="handleClick(newEmail)">
        {{newEmail.newEmail}}
      </a>

      <a *ngIf="torrent" class="p-tag p-tag-{{type}} p-tag-clickable cursor-pointer" [attr.data-torrent-name]="torrent.target.name" (click)="handleClick(torrent)">
        {{torrent.metadata.name}} ( {{torrent.metadata.size}} )
      </a>

    `

})
export class ClickableTagComponent {
  @Input() actor: any;
  @Input() target: any;
  @Input() vm: any;
  @Input() node: any;
  @Input() ipAddress: any;
  @Input() oldEmail: any;
  @Input() newEmail: any;
  @Input() torrent: any;
  @Input() type: 'info' | 'success' = 'info';
  @Output() tagClicked = new EventEmitter<any>();

  // onClick() {
  //   if (this.actor?.id) {
  //     // emit event or call service
  //     console.log(`User tag clicked: ${this.actor.id}`);
  //   }
  //   if (this.target?.id) {
  //     // emit event or call service
  //     console.log(`User tag clicked: ${this.target.id}`);
  //   }
  // }

  handleClick(clicked: any) {
    this.tagClicked.emit(clicked);
  }
}