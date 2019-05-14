import { ChallengeService } from '../Services/challenge.service'
import { Component, OnInit, EventEmitter, NgZone, Output }from '@angular/core'
import { SocketIoService } from '../Services/socket-io.service'
import { AdministrationService } from '../Services/administration.service'
import { Router } from '@angular/router'
import { UserService } from '../Services/user.service'
import { CookieService } from 'ngx-cookie'

@Component({
  selector: 'sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit {

  public applicationName = 'OWASP Juice Shop'
  public gitHubRibbon = true
  public userEmail = ''
  public scoreBoardVisible: boolean = false
  public version: string = ''
  public isExpanded = true
  public showSubmenu: boolean = false
  public isShowing = false
  public sizeOfMail: number = 0

  @Output() public sidenavToggle = new EventEmitter()

  constructor (private administrationService: AdministrationService, private challengeService: ChallengeService,
    private ngZone: NgZone, private io: SocketIoService, private userService: UserService, private cookieService: CookieService,
    private router: Router) { }

  ngOnInit () {

    this.administrationService.getApplicationVersion().subscribe((version: any) => {
      if (version) {
        this.version = 'v' + version
      }
    },(err) => console.log(err))

    this.getScoreBoardStatus()

    if (localStorage.getItem('token')) {
      this.getUserDetails()
    } else {
      this.userEmail = ''
    }

    this.userService.getLoggedInState().subscribe((isLoggedIn) => {
      if (isLoggedIn) {
        this.getUserDetails()
      } else {
        this.userEmail = ''
      }
    })

    this.ngZone.runOutsideAngular(() => {
      this.io.socket().on('challenge solved', () => {
        this.getScoreBoardStatus()
      })
    })

  }

  isLoggedIn () {
    return localStorage.getItem('token')
  }

  logout () {
    this.userService.saveLastLoginIp().subscribe((user: any) => { this.noop() }, (err) => console.log(err))
    localStorage.removeItem('token')
    this.cookieService.remove('token', { domain: document.domain })
    sessionStorage.removeItem('bid')
    this.userService.isLoggedIn.next(false)
    this.router.navigate(['/'])
  }

  goToProfilePage () {
    window.location.replace('/profile')
  }

  // tslint:disable-next-line:no-empty
  noop () { }

  getScoreBoardStatus () {
    this.challengeService.find({ name: 'Score Board' }).subscribe((challenges: any) => {
      this.ngZone.run(() => {
        this.scoreBoardVisible = challenges[0].solved
      })
    }, (err) => console.log(err))
  }

  getUserDetails () {
    this.userService.whoAmI().subscribe((user: any) => {
      this.userEmail = user.email
      this.sizeOfMail = (""+user.email).length
    }, (err) => console.log(err))
  }

  onToggleSidenav = () => {
    this.sidenavToggle.emit()
  }
}
