import { TranslateService } from '@ngx-translate/core'
import { ChallengeService } from '../Services/challenge.service'
import { ConfigurationService } from '../Services/configuration.service'
import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core'
import { CookieService } from 'ngx-cookie'
import { CountryMappingService } from 'src/app/Services/country-mapping.service'
import { SocketIoService } from '../Services/socket-io.service'

import { dom, library } from '@fortawesome/fontawesome-svg-core'
import { faClipboard, faFlagCheckered, faGlobe } from '@fortawesome/free-solid-svg-icons'

library.add(faGlobe, faFlagCheckered, faClipboard)
dom.watch()

interface ChallengeSolvedMessage {
  challenge: string,
  hidden?: any,
  isRestore?: any,
  flag: any,
  key?: any
}

interface ChallengeSolvedNotification {
  message: string,
  flag: string,
  country?: { code: string, name: string },
  copied: boolean
}

@Component({
  selector: 'app-challenge-solved-notification',
  templateUrl: './challenge-solved-notification.component.html',
  styleUrls: ['./challenge-solved-notification.component.scss']
})
export class ChallengeSolvedNotificationComponent implements OnInit {

  public notifications: ChallengeSolvedNotification[] = []
  public showCtfFlagsInNotifications: boolean = false
  public showCtfCountryDetailsInNotifications: string = 'none'
  public countryMap?: any

  constructor (private ngZone: NgZone, private configurationService: ConfigurationService, private challengeService: ChallengeService,private countryMappingService: CountryMappingService,private translate: TranslateService, private cookieService: CookieService, private ref: ChangeDetectorRef, private io: SocketIoService) {
  }

  ngOnInit () {
    this.ngZone.runOutsideAngular(() => {
      this.io.socket().on('challenge solved', (data: ChallengeSolvedMessage) => {
        if (data && data.challenge) {
          if (!data.hidden) {
            this.showNotification(data)
          }
          if (!data.isRestore) {
            this.saveProgress()
          }
          this.io.socket().emit('notification received', data.flag)
        }
      })
    })

    this.configurationService.getApplicationConfiguration().subscribe((config) => {
      if (config && config.ctf) {
        if (config.ctf.showFlagsInNotifications) {
          this.showCtfFlagsInNotifications = config.ctf.showFlagsInNotifications
        } else {
          this.showCtfFlagsInNotifications = false
        }

        if (config.ctf.showCountryDetailsInNotifications) {
          this.showCtfCountryDetailsInNotifications = config.ctf.showCountryDetailsInNotifications

          if (config.ctf.showCountryDetailsInNotifications !== 'none') {
            this.countryMappingService.getCountryMapping().subscribe((countryMap: any) => {
              this.countryMap = countryMap
            },(err) => console.log(err))
          }
        } else {
          this.showCtfCountryDetailsInNotifications = 'none'
        }
      }
    })
  }

  closeNotification (index: number, shiftKey: boolean = false) {
    if (shiftKey) {
      this.notifications = []
    } else {
      this.notifications.splice(index, 1)
    }
    this.ref.detectChanges()
  }

  showNotification (challenge: ChallengeSolvedMessage) {
    this.translate.get('CHALLENGE_SOLVED', { challenge: challenge.challenge }).toPromise().then((challengeSolved) => challengeSolved,
      (translationId) => translationId).then((message) => {
        let country
        if (this.showCtfCountryDetailsInNotifications && this.showCtfCountryDetailsInNotifications !== 'none') {
          country = this.countryMap[challenge.key]
        }
        this.notifications.push({
          message: message,
          flag: challenge.flag,
          country: country,
          copied: false
        })
        this.ref.detectChanges()
      })
  }

  saveProgress () {
    this.challengeService.continueCode().subscribe((continueCode) => {
      if (!continueCode) {
        throw (new Error('Received invalid continue code from the sever!'))
      }
      let expires = new Date()
      expires.setFullYear(expires.getFullYear() + 1)
      this.cookieService.put('continueCode', continueCode, { expires })
    },(err) => console.log(err))
  }

}
