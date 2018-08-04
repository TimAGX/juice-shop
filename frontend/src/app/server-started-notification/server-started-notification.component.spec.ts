import { CookieModule, CookieService } from 'ngx-cookie'
import { HttpClientModule } from '@angular/common/http'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { async, ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing'

import { ServerStartedNotificationComponent } from './server-started-notification.component'
import { ChallengeService } from '../Services/challenge.service'
import { of, throwError } from 'rxjs'
import { EventEmitter } from '@angular/core'

class MockSocket {
  on (str: string, callback) {
    callback()
  }
}

describe('ServerStartedNotificationComponent', () => {
  let component: ServerStartedNotificationComponent
  let fixture: ComponentFixture<ServerStartedNotificationComponent>
  let challengeService
  let translateService
  let cookieService
  let mockSocket

  beforeEach(async(() => {

    challengeService = jasmine.createSpyObj('ChallengeService', ['restoreProgress'])
    challengeService.restoreProgress.and.returnValue(of({}))
    translateService = jasmine.createSpyObj('TranslateService', ['get'])
    translateService.get.and.returnValue(of({}))
    translateService.onLangChange = new EventEmitter()
    translateService.onTranslationChange = new EventEmitter()
    translateService.onDefaultLangChange = new EventEmitter()
    mockSocket = new MockSocket()

    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        CookieModule.forRoot(),
        HttpClientModule,
        MatCardModule,
        MatButtonModule
      ],
      declarations: [ ServerStartedNotificationComponent ],
      providers: [
        { provide: ChallengeService, useValue: challengeService },
        { provide: TranslateService, useValue: translateService },
        CookieService
      ]
    })
    .compileComponents()

    cookieService = TestBed.get(CookieService)
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ServerStartedNotificationComponent)
    component = fixture.componentInstance
    spyOn(component.io,'connect').and.returnValue(mockSocket)
    cookieService.remove('continueCode', { domain: document.domain })
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should keep continue code cookie after successfully restoring progress on server start', () => {
    spyOn(component.socket,'on')
    cookieService.put('continueCode', 'CODE')
    component.ngOnInit()
    let callback = component.socket.on.calls.argsFor(0)[1]
    callback()
    expect(component.socket.on.calls.argsFor(0)[0]).toBe('server started')
    expect(cookieService.get('continueCode')).toBe('CODE')
  })

  it('should set auto-restore success-message when progress restore succeeds', () => {
    spyOn(component.socket,'on')
    translateService.get.and.returnValue(of('AUTO_RESTORED_PROGRESS'))
    cookieService.put('continueCode', 'CODE')
    component.ngOnInit()
    let callback = component.socket.on.calls.argsFor(0)[1]
    callback()
    expect(component.socket.on.calls.argsFor(0)[0]).toBe('server started')
    expect(component.hackingProgress.autoRestoreMessage).toBeDefined()
  })

  it('should translate AUTO_RESTORED_PROGRESS message', () => {
    spyOn(component.socket,'on')
    translateService.get.and.returnValue(of('Translation of AUTO_RESTORED_PROGRESS'))
    cookieService.put('continueCode', 'CODE')
    component.ngOnInit()
    let callback = component.socket.on.calls.argsFor(0)[1]
    callback()
    expect(component.socket.on.calls.argsFor(0)[0]).toBe('server started')
    expect(component.hackingProgress.autoRestoreMessage).toBe('Translation of AUTO_RESTORED_PROGRESS')
  })

  it('should log errors during automatic progress restore directly to browser console', fakeAsync(() => {
    spyOn(component.socket,'on')
    challengeService.restoreProgress.and.returnValue(throwError('Error'))
    cookieService.put('continueCode', 'CODE')
    console.log = jasmine.createSpy('log')
    component.ngOnInit()
    let callback = component.socket.on.calls.argsFor(0)[1]
    callback()
    expect(component.socket.on.calls.argsFor(0)[0]).toBe('server started')
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should set auto-restore error-message when progress restore failed', fakeAsync(() => {
    spyOn(component.socket,'on')
    challengeService.restoreProgress.and.returnValue(throwError('Error'))
    translateService.get.and.returnValue(of('AUTO_RESTORE_PROGRESS_FAILED'))
    cookieService.put('continueCode', 'CODE')
    component.ngOnInit()
    let callback = component.socket.on.calls.argsFor(0)[1]
    callback()
    expect(component.socket.on.calls.argsFor(0)[0]).toBe('server started')
    expect(component.hackingProgress.autoRestoreMessage).toBeDefined()
  }))

  it('should translate AUTO_RESTORE_PROGRESS_FAILED message including the returned error', fakeAsync(() => {
    spyOn(component.socket,'on')
    challengeService.restoreProgress.and.returnValue(throwError('Error'))
    translateService.get.and.returnValue(of('Translation of AUTO_RESTORE_PROGRESS_FAILED: error'))
    cookieService.put('continueCode', 'CODE')
    component.ngOnInit()
    let callback = component.socket.on.calls.argsFor(0)[1]
    callback()
    expect(component.socket.on.calls.argsFor(0)[0]).toBe('server started')
    expect(component.hackingProgress.autoRestoreMessage).toBe('Translation of AUTO_RESTORE_PROGRESS_FAILED: error')
  }))

  it('do nothing if continueCode cookie is not present', () => {
    spyOn(component.socket,'on')
    component.ngOnInit()
    let callback = component.socket.on.calls.argsFor(0)[1]
    callback()
    expect(component.socket.on.calls.argsFor(0)[0]).toBe('server started')
    expect(component.hackingProgress.autoRestoreMessage).toBeUndefined()
  })

  it('should remove the restore message when closing the notification', () => {
    component.closeNotification()
    expect(component.hackingProgress.autoRestoreMessage).toBeNull()
  })

  it('should remove the continue code cookie when clearing the progress', () => {
    component.clearProgress()
    expect(cookieService.get('continueCode')).toBeUndefined()
    expect(component.hackingProgress.cleared).toBe(true)
  })
})
