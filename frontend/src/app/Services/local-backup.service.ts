/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import { Injectable } from '@angular/core'
import { Backup } from '../Models/backup.model'
import { CookieService } from 'ngx-cookie'
import { saveAs } from 'file-saver'
import { SnackBarHelperService } from './snack-bar-helper.service'
import { MatSnackBar } from '@angular/material/snack-bar'
import { from } from 'rxjs'
import { ChallengeService } from './challenge.service'

@Injectable({
  providedIn: 'root'
})
export class LocalBackupService {
  private readonly VERSION = 1

  constructor (private readonly cookieService: CookieService, private readonly challengeService: ChallengeService, private readonly snackBarHelperService: SnackBarHelperService, private readonly snackBar: MatSnackBar) { }

  save (fileName: string = 'owasp_juice_shop') {
    const backup: Backup = { version: this.VERSION }

    backup.scoreBoard = {
      displayedDifficulties: localStorage.getItem('displayedDifficulties') ? JSON.parse(String(localStorage.getItem('displayedDifficulties'))) : undefined,
      showSolvedChallenges: localStorage.getItem('showSolvedChallenges') ? JSON.parse(String(localStorage.getItem('showSolvedChallenges'))) : undefined,
      showDisabledChallenges: localStorage.getItem('showDisabledChallenges') ? JSON.parse(String(localStorage.getItem('showDisabledChallenges'))) : undefined,
      showOnlyTutorialChallenges: localStorage.getItem('showOnlyTutorialChallenges') ? JSON.parse(String(localStorage.getItem('showOnlyTutorialChallenges'))) : undefined,
      displayedChallengeCategories: localStorage.getItem('displayedChallengeCategories') ? JSON.parse(String(localStorage.getItem('displayedChallengeCategories'))) : undefined
    }
    backup.banners = {
      welcomeBannerStatus: this.cookieService.get('welcomebanner_status') ? this.cookieService.get('welcomebanner_status') : undefined,
      cookieConsentStatus: this.cookieService.get('cookieconsent_status') ? this.cookieService.get('cookieconsent_status') : undefined
    }
    backup.language = this.cookieService.get('language') ? this.cookieService.get('language') : undefined
    backup.continueCode = this.cookieService.get('continueCode') ? this.cookieService.get('continueCode') : undefined
    backup.continueCodeFindIt = this.cookieService.get('continueCodeFindIt') ? this.cookieService.get('continueCodeFindIt') : undefined
    backup.continueCodeFixIt = this.cookieService.get('continueCodeFixIt') ? this.cookieService.get('continueCodeFixIt') : undefined

    const blob = new Blob([JSON.stringify(backup)], { type: 'text/plain;charset=utf-8' })
    saveAs(blob, `${fileName}-${new Date().toISOString().split('T')[0]}.json`)
  }

  restore (backupFile: File) {
    return from(backupFile.text().then((backupData) => {
      const backup: Backup = JSON.parse(backupData)

      if (backup.version === this.VERSION) {
        this.restoreLocalStorage('displayedDifficulties', backup.scoreBoard?.displayedDifficulties)
        this.restoreLocalStorage('showSolvedChallenges', backup.scoreBoard?.showSolvedChallenges)
        this.restoreLocalStorage('showDisabledChallenges', backup.scoreBoard?.showDisabledChallenges)
        this.restoreLocalStorage('showOnlyTutorialChallenges', backup.scoreBoard?.showOnlyTutorialChallenges)
        this.restoreLocalStorage('displayedChallengeCategories', backup.scoreBoard?.displayedChallengeCategories)
        this.restoreCookie('welcomebanner_status', backup.banners?.welcomeBannerStatus)
        this.restoreCookie('cookieconsent_status', backup.banners?.cookieConsentStatus)
        this.restoreCookie('language', backup.language)
        this.restoreCookie('continueCodeFindIt', backup.continueCodeFindIt)
        this.restoreCookie('continueCodeFixIt', backup.continueCodeFixIt)
        this.restoreCookie('continueCode', backup.continueCode)

        const snackBarRef = this.snackBar.open('Backup has been restored from ' + backupFile.name, 'Apply changes now', {
          duration: 10000
        })
        snackBarRef.onAction().subscribe(() => {
          if (backup.continueCode) {
            this.challengeService.restoreProgress(encodeURIComponent(backup.continueCode)).subscribe(() => {
            }, (error) => {
              console.log(error)
            })
            this.challengeService.restoreProgressFindIt(encodeURIComponent(backup.continueCodeFindIt)).subscribe(() => {
              this.challengeService.restoreProgressFixIt(encodeURIComponent(backup.continueCodeFixIt)).subscribe(() => {
              }, (error) => {
                console.log(error)
              })
            }, (error) => {
              console.log(error)
            })
          }
          location.reload()
        })
      } else {
        this.snackBarHelperService.open(`Version ${backup.version} is incompatible with expected version ${this.VERSION}`, 'errorBar')
      }
    }).catch((err: Error) => {
      this.snackBarHelperService.open(`Backup restore operation failed: ${err.message}`, 'errorBar')
    }))
  }

  private restoreCookie (cookieName: string, cookieValue: string) {
    if (cookieValue) {
      const expires = new Date()
      expires.setFullYear(expires.getFullYear() + 1)
      this.cookieService.put(cookieName, cookieValue, { expires })
    } else {
      this.cookieService.remove(cookieName)
    }
  }

  private restoreLocalStorage (propertyName: string, propertyValue: any) {
    if (propertyValue) {
      localStorage.setItem(propertyName, JSON.stringify(propertyValue))
    } else {
      localStorage.removeItem(propertyName)
    }
  }
}
