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

import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, of } from 'rxjs';

import { AppConfigService, imx_SessionService, ImxTranslationProviderService, ExtService, AuthenticationService } from 'qbm';
import { AppService } from './app.service';

describe('AppService', () => {
  class Mocks {
    translate = {
      addLangs: jasmine.createSpy('addLangs'),
      getBrowserCultureLang: jasmine.createSpy('getBrowserCultureLang').and.returnValue(''),
      setDefaultLang: jasmine.createSpy('setDefaultLang'),
      get: x => { return { toPromise: () => Promise.resolve(x) }; },
      use: jasmine.createSpy('use').and.returnValue(of({})),
    };

    translationProvider = {
      init: jasmine.createSpy('init').and.returnValue(Promise.resolve())
    };

    session = { };

    title = {
      setTitle: jasmine.createSpy('setTitle')
    };

    appConfigService = {
      client: {
        imx_config_get: jasmine.createSpy('imx_config_get').and.returnValue(Promise.resolve({ProductName: null}))
      },
      init: jasmine.createSpy('init'),
      Config: { Translation: {} }
    };

    ext = {
      register: jasmine.createSpy('register')
    };

    authentication = {
      onSessionResponse: new BehaviorSubject({})
    };

    reset(): void {
      this.translate.addLangs.calls.reset();
      this.translate.getBrowserCultureLang.calls.reset();
      this.translate.setDefaultLang.calls.reset();
      this.translate.use.calls.reset();
      this.translationProvider.init.calls.reset();
      this.title.setTitle.calls.reset();
      this.appConfigService.init.calls.reset();
      this.ext.register.calls.reset();
    }

    check(): void {
      expect(this.translate.addLangs).toHaveBeenCalled();
      expect(this.translate.getBrowserCultureLang).toHaveBeenCalled();
      expect(this.translate.setDefaultLang).toHaveBeenCalled();
      expect(this.translate.use).toHaveBeenCalled();
      expect(this.translationProvider.init).toHaveBeenCalled();
      expect(this.title.setTitle).toHaveBeenCalled();
      expect(this.appConfigService.init).toHaveBeenCalled();
      expect(this.ext.register).toHaveBeenCalled();
    }
  }

  const mocks = new Mocks();

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [LoggerTestingModule],
      providers: [
        {
          provide: TranslateService,
          useValue: mocks.translate
        },
        {
          provide: AppConfigService,
          useValue: mocks.appConfigService
        },
        {
          provide: ExtService,
          useValue: mocks.ext
        },
        {
          provide: imx_SessionService,
          useValue: mocks.session
        },
        {
          provide: Title,
          useValue: mocks.title
        },
        {
          provide: ImxTranslationProviderService,
          useValue: mocks.translationProvider
        },
        {
          provide: AuthenticationService,
          useValue: mocks.authentication
        }
      ]
    });
  });

  beforeEach(() => {
    mocks.reset();
  });

  it('should be created', () => {
    const service: AppService = TestBed.get(AppService);
    expect(service).toBeDefined();
  });

  it('has an init method', async () => {
    const service: AppService = TestBed.get(AppService);
    await AppService.init(service)();
    mocks.check();
  });
});
