import { ChallengeService } from './../Services/challenge.service'
import { SearchResultComponent } from './../search-result/search-result.component'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { UserService } from './../Services/user.service'
import { ConfigurationService } from './../Services/configuration.service'
import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing'
import { HttpClientModule } from '@angular/common/http'
import { NavbarComponent } from './navbar.component'
import { Location } from '@angular/common'

import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { MatSelectModule } from '@angular/material/select'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatButtonModule } from '@angular/material/button'
import { AdministrationService } from './../Services/administration.service'
import { RouterTestingModule } from '@angular/router/testing'
import { MatMenuModule } from '@angular/material/menu'
import { MatTooltipModule } from '@angular/material/tooltip'
import { CookieModule, CookieService } from 'ngx-cookie'
import { of, throwError } from 'rxjs'
import { MatCardModule } from '@angular/material/card'
import { MatInputModule } from '@angular/material/input'
import { MatTableModule } from '@angular/material/table'
import { MatPaginatorModule } from '@angular/material/paginator'
import { MatDialogModule } from '@angular/material/dialog'
import { MatDividerModule } from '@angular/material/divider'
import { SocketIo } from 'ng-io'

class MockSocket {
  on (str: string, callback) {
    callback(str)
  }
}

describe('NavbarComponent', () => {
  let component: NavbarComponent
  let fixture: ComponentFixture<NavbarComponent>
  let administrationService
  let configurationService
  let userService
  let challengeService
  let translateService
  let cookieService
  let mockSocket
  let location

  beforeEach(async(() => {

    administrationService = jasmine.createSpyObj('AdministrationService',['getApplicationVersion'])
    administrationService.getApplicationVersion.and.returnValue(of(undefined))
    configurationService = jasmine.createSpyObj('ConfigurationService',['getApplicationConfiguration'])
    configurationService.getApplicationConfiguration.and.returnValue(of({}))
    userService = jasmine.createSpyObj('UserService',['whoAmI','getLoggedInState'])
    userService.whoAmI.and.returnValue(of({}))
    userService.getLoggedInState.and.returnValue(of(true))
    userService.isLoggedIn = jasmine.createSpyObj('userService.isLoggedIn',['next'])
    userService.isLoggedIn.next.and.returnValue({})
    challengeService = jasmine.createSpyObj('ChallengeService',['find'])
    challengeService.find.and.returnValue(of([{ solved: false }]))
    cookieService = jasmine.createSpyObj('CookieService',['remove', 'get', 'put'])
    mockSocket = new MockSocket()

    TestBed.configureTestingModule({
      declarations: [ NavbarComponent, SearchResultComponent ],
      imports: [
        RouterTestingModule.withRoutes([
          { path: 'search', component: SearchResultComponent }
        ]),
        HttpClientModule,
        TranslateModule.forRoot(),
        CookieModule.forRoot(),
        BrowserAnimationsModule,
        MatToolbarModule,
        MatIconModule,
        MatFormFieldModule,
        MatSelectModule,
        MatButtonModule,
        MatMenuModule,
        MatTooltipModule,
        MatCardModule,
        MatInputModule,
        MatTableModule,
        MatPaginatorModule,
        MatDialogModule,
        MatDividerModule
      ],
      providers: [
        { provide: AdministrationService, useValue: administrationService },
        { provide: ConfigurationService, useValue: configurationService },
        { provide: UserService, useValue: userService },
        { provide: ChallengeService, useValue: challengeService },
        { provide: CookieService, useValue: cookieService },
        { provide: SocketIo, useValue: mockSocket },
        TranslateService
      ]
    })
    .compileComponents()

    location = TestBed.get(Location)
    translateService = TestBed.get(TranslateService)
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbarComponent)
    component = fixture.componentInstance
    localStorage.removeItem('token')
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should hold application version', () => {
    administrationService.getApplicationVersion.and.returnValue(of('x.y.z'))
    component.ngOnInit()
    expect(component.version).toBe('vx.y.z')
  })

  it('should show nothing on missing application version', () => {
    administrationService.getApplicationVersion.and.returnValue(of(undefined))
    component.ngOnInit()
    expect(component.version).toBe('')
  })

  it('should show nothing on error retrieving application version', fakeAsync(() => {
    administrationService.getApplicationVersion.and.returnValue(throwError('Error'))
    component.ngOnInit()
    expect(component.version).toBe('')
  }))

  it('should log errors directly to browser console', fakeAsync(() => {
    administrationService.getApplicationVersion.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.ngOnInit()
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should use default application name if not customized', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({}))
    component.ngOnInit()
    expect(component.applicationName).toBe('OWASP Juice Shop')
  })

  it('should use custom application name URL if configured', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ application: { name: 'name' } }))
    component.ngOnInit()
    expect(component.applicationName).toBe('name')
  })

  it('should set user email on page reload if user is authenticated', () => {
    userService.whoAmI.and.returnValue(of({ email: 'dummy@dummy.com' }))
    localStorage.setItem('token','token')
    component.ngOnInit()
    expect(component.userEmail).toBe('dummy@dummy.com')
  })

  it('should set user email on getting logged in', () => {
    localStorage.removeItem('token')
    userService.getLoggedInState.and.returnValue(of(true))
    userService.whoAmI.and.returnValue(of({ email: 'dummy@dummy.com' }))
    component.ngOnInit()
    expect(component.userEmail).toBe('dummy@dummy.com')
  })

  it('should log errors directly to browser console when getting user failed', fakeAsync(() => {
    userService.whoAmI.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.ngOnInit()
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should show GitHub button by default', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({}))
    component.ngOnInit()
    expect(component.gitHubRibbon).toBe(true)
  })

  it('should hide GitHub ribbon if so configured', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ application: { gitHubRibbon: false } }))
    component.ngOnInit()
    expect(component.gitHubRibbon).toBe(false)
  })

  it('should log error while getting application configuration from backend API directly to browser console', fakeAsync(() => {
    configurationService.getApplicationConfiguration.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.ngOnInit()
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should hide Score Board menu item when corresponding challenge was not solved yet', () => {
    challengeService.find.and.returnValue(of([{ solved: false }]))
    component.ngOnInit()
    expect(component.scoreBoardVisible).toBeFalsy()
  })

  it('should show Score Board menu item if corresponding challenge has been solved', () => {
    challengeService.find.and.returnValue(of([{ solved: true }]))
    component.ngOnInit()
    expect(component.scoreBoardVisible).toBe(true)
  })

  it('forwards to search result with search query as URL parameter', fakeAsync(() => {
    component.search('lemon juice')
    tick()
    expect(location.path()).toBe(encodeURI('/search?q=lemon juice'))
  }))

  it('forwards to search result with empty search criteria if no search query is present', fakeAsync(() => {
    component.search('')
    tick()
    expect(location.path()).toBe(encodeURI('/search'))
  }))

  it('should remove authentication token from localStorage', () => {
    spyOn(localStorage,'removeItem')
    component.logout()
    expect(localStorage.removeItem).toHaveBeenCalledWith('token')
  })

  it('should remove authentication token from cookies', () => {
    component.logout()
    expect(cookieService.remove).toHaveBeenCalledWith('token', { domain: `${document.domain}` })
  })

  it('should remove basket id from session storage', () => {
    spyOn(sessionStorage,'removeItem')
    component.logout()
    expect(sessionStorage.removeItem).toHaveBeenCalledWith('bid')
  })

  it('should set the login status to be false via UserService', () => {
    component.logout()
    expect(userService.isLoggedIn.next).toHaveBeenCalledWith(false)
  })

  it('should forward to main page', fakeAsync(() => {
    component.logout()
    tick()
    expect(location.path()).toBe('/')
  }))

  it('should set selected a language', () => {
    spyOn(translateService,'use').and.callFake((lang) => lang)
    component.changeLanguage('xx')
    expect(translateService.use).toHaveBeenCalledWith('xx')
  })
})
