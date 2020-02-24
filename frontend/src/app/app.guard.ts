/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import { CanActivate, Router } from '@angular/router'
import * as jwtDecode from 'jwt-decode'
import { roles } from './roles'
import { Injectable, NgZone } from '@angular/core'

@Injectable()
export class LoginGuard implements CanActivate {
  constructor (private router: Router, private ngZone: NgZone) {}

  canActivate () {
    if (localStorage.getItem('token')) {
      return true
    } else {
      this.forbidRoute('UNAUTHORIZED_ACCESS_ERROR')
      return false
    }
  }

  forbidRoute (error = 'UNAUTHORIZED_PAGE_ACCESS_ERROR') {
    this.ngZone.run(() => this.router.navigate(['403'], {
      skipLocationChange: true,
      queryParams: { error }
    }))
  }

  tokenDecode () {
    let payload: any = null
    const token = localStorage.getItem('token')
    if (token) {
      try {
        payload = jwtDecode(token)
      } catch (err) {
        console.log(err)
      }
    }
    return payload
  }
}

@Injectable()
export class AdminGuard implements CanActivate {
  constructor (private loginGuard: LoginGuard) {}

  canActivate () {
    let payload = this.loginGuard.tokenDecode()
    if (payload && payload.data && payload.data.role === roles.admin) {
      return true
    } else {
      this.loginGuard.forbidRoute()
      return false
    }
  }
}

@Injectable()
export class AccountingGuard implements CanActivate {
  constructor (private router: Router, private loginGuard: LoginGuard) {}

  canActivate () {
    let payload = this.loginGuard.tokenDecode()
    if (payload && payload.data && payload.data.role === roles.accounting) {
      return true
    } else {
      this.loginGuard.forbidRoute()
      return false
    }
  }
}

@Injectable()
export class DeluxeGuard {
  constructor (private loginGuard: LoginGuard) {}

  isDeluxe () {
    let payload = this.loginGuard.tokenDecode()
    return payload && payload.data && payload.data.role === roles.deluxe
  }
}
