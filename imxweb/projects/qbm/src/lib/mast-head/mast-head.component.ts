/*
 * ONE IDENTITY LLC. PROPRIETARY INFORMATION
 *
 * This software is confidential.  One Identity, LLC. or one of its affiliates or
 * subsidiaries, has supplied this software to you under terms of a
 * license agreement, nondisclosure agreement or both.
 *
 * You may not copy, disclose, or use this software except in accordance with
 * those terms.
 *
 *
 * Copyright 2021 One Identity LLC.
 * ALL RIGHTS RESERVED.
 *
 * ONE IDENTITY LLC. MAKES NO REPRESENTATIONS OR
 * WARRANTIES ABOUT THE SUITABILITY OF THE SOFTWARE,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 * TO THE IMPLIED WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE, OR
 * NON-INFRINGEMENT.  ONE IDENTITY LLC. SHALL NOT BE
 * LIABLE FOR ANY DAMAGES SUFFERED BY LICENSEE
 * AS A RESULT OF USING, MODIFYING OR DISTRIBUTING
 * THIS SOFTWARE OR ITS DERIVATIVES.
 *
 */

import { OverlayRef } from '@angular/cdk/overlay';
import { Component, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { EuiLoadingService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { AppConfigService } from '../appConfig/appConfig.service';
import { AboutComponent } from '../about/About.component';
import { AuthenticationService } from '../authentication/authentication.service';
import { ISessionState } from '../session/session-state';
import { MastHeadService } from './mast-head.service';
import { MessageDialogResult } from '../message-dialog/message-dialog-result.enum';
import { MessageDialogComponent } from '../message-dialog/message-dialog.component';

/**
 * Masthead of IMX web applications. It can contain dynamic menus or buttons, emitting menus/menu itmes when selected.
 *
 * @example
 * Template containing a masthead.
 *
 * <ng-container *ngIf="isLoggedIn">
 *  <imx-mast-head [menuList]="mastheadMenuList" (menuItemClicked)="onMenuItemClicked($event)"></imx-mast-head>
 *  <imx-menu [menuItems]="menuItems"></imx-menu>
 *  <imx-usermessage></imx-usermessage>
 * </ng-container>
 * <router-outlet></router-outlet>
 *
 * The supplied "mastheadMenuList" Input contains two menus and one button as follows:
 *
 *  this.mastheadMenuList =
 *     [{
 *       iconName: 'user',
 *       identifier: 'user-menu',
 *       type: 'menu',
 *       menuItems:
 *         [
 *           {
 *             identifier: 'user-menu-profile',
 *             caption: '#LDS#Menu Entry My profile'
 *           },
 *           {
 *             identifier: 'user-menu-addressbook',
 *             caption: '#LDS#Menu Entry Address book'
 *           }
 *         ]
 *     },
 *     {
 *       iconName: 'performance',
 *       identifier: 'performance-menu',
 *       type: 'menu',
 *       menuItems:
 *         [
 *           {
 *             identifier: 'performance-menu-item3',
 *             caption: '#LDS#Item 3'
 *           },
 *           {
 *             identifier: 'performance-menu-item4',
 *             caption: '#LDS#Item 4'
 *           }
 *         ]
 *     },
 *     {
 *       iconName: 'reports',
 *       identifier: 'reports-button',
 *       type: 'button',
 *       menuItems: []
 *     }];
 *
 * NOTE: If you want to use a button instead of a menu, the "type" field has to be set to "button" instead of "menu".
 *
 */
@Component({
  selector: 'imx-mast-head',
  templateUrl: './mast-head.component.html',
  styleUrls: ['./mast-head.component.scss']
})
export class MastHeadComponent implements OnDestroy {

  public sessionState: ISessionState;
  private readonly subscriptions: Subscription[] = [];

  constructor(
    public readonly appConfig: AppConfigService,
    private readonly router: Router,
    private readonly translate: TranslateService,
    private readonly dialog: MatDialog,
    private readonly busyService: EuiLoadingService,
    private readonly mastHeadService: MastHeadService,
    private readonly authentication: AuthenticationService
  ) {
    this.subscriptions.push(this.authentication.onSessionResponse.subscribe((sessionState: ISessionState) =>
      this.sessionState = sessionState
    ));
  }

  public get hasDocumentationConfig(): boolean {
    return !!this.appConfig.Config.LocalDocPath;
  }

  public get isMobile(): boolean {
    return document.body.offsetWidth <= 768;
  }

  public get isAuthenticated(): boolean {
    return this.sessionState?.IsLoggedIn;
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  /**
   * For navigating home, you know.
   */
  public goHome(): void {
    this.router.navigate([this.appConfig.Config.routeConfig.start], { queryParams: {} });
  }

    /**
   * Opens the About view.
   */
     public openAboutDialog(): void {
      this.dialog.open(AboutComponent, { panelClass: 'imx-AboutPanel' });
    }

    /**
     * Logs out and kills the session.
     */
    public async logout(): Promise<void> {
      if (await this.confirmLogout()) {
        let overlayRef: OverlayRef;
        setTimeout(() => (overlayRef = this.busyService.show()));
        try {
          await this.authentication.logout();
        } finally {
          setTimeout(() => this.busyService.hide(overlayRef));
        }
      }
    }

    /**
     * Logs out and kills the session.
     */
    public navigateToDocumentation(): void {
      this.mastHeadService.openDocumentationLink();
    }

    private async confirmLogout(): Promise<boolean> {
      const result = await this.dialog.open(MessageDialogComponent, {
        data: {
          ShowOk: true,
          ShowCancel: true,
          Title: await this.translate.get('#LDS#Log off').toPromise(),
          Message: await this.translate.get('#LDS#Are you sure you want to log off?').toPromise(),
          identifier: 'confirm-logout-'
        },
        panelClass: 'imx-messageDialog'
      }).afterClosed().toPromise();

      return result === MessageDialogResult.OkResult ? true : false;
    }

}
