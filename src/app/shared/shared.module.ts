import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ShortDescriptionPipe } from './pipes/short-description.pipe';
import { CurrencyFormatPipe } from './pipes/currency-format.pipe';
import { ClickLoggerDirective } from './directives/click-logger.directive';
import { NotificationComponent } from '../core/components/notification.component';

@NgModule({
  declarations: [
    ShortDescriptionPipe,
    CurrencyFormatPipe,
    ClickLoggerDirective,
    NotificationComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    ShortDescriptionPipe,
    CurrencyFormatPipe,
    ClickLoggerDirective,
    NotificationComponent
  ]
})
export class SharedModule { }