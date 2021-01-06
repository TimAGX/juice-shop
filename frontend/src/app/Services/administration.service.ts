/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import { environment } from '../../environments/environment'
import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { catchError, map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class AdministrationService {
  private readonly hostServer = environment.hostServer
  private readonly host = this.hostServer + '/rest/admin'

  constructor (private readonly http: HttpClient) { }

  getApplicationVersion () {
    return this.http.get(this.host + '/application-version').pipe(
      map((response: any) => response.version),
      catchError(error => { throw error })
    )
  }
}
