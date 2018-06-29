import { environment } from './../../environments/environment'
import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { map, catchError } from 'rxjs/operators'
import { Subject } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class UserService {

  public isLoggedIn = new Subject<any>()
  private hostServer = environment.hostServer
  private host = this.hostServer + '/api/Users'

  constructor (private http: HttpClient) { }

  find (params?: any) {
    return this.http.get(this.hostServer + '/rest/user/authentication-details/', { headers: { 'authorization' : `Bearer ${localStorage.getItem('token')}` } , params: params }).pipe(map((response: any) =>
    response.data),catchError((err) => { throw err }))
  }

  get (id) {
    return this.http.get(this.host + '/' + id, { headers: { 'authorization' : `Bearer ${localStorage.getItem('token')}` } }).pipe(map((response: any) => response.data), catchError((err) => { throw err }))
  }

  save (params) {
    return this.http.post(this.host + '/', params).pipe(
      map((response: any) => response.data),
      catchError((err) => { throw err })
    )
  }

  login (params) {
    this.isLoggedIn.next(true)
    return this.http.post(this.hostServer + '/rest/user/login', params).pipe(map((response: any) => response.authentication), catchError((err) => { throw err }))
  }

  getLoggedInState () {
    return this.isLoggedIn.asObservable()
  }

  changePassword (passwords) {
    return this.http.get(this.hostServer + '/rest/user/change-password?current=' + passwords.current + '&new=' +
    passwords.new + '&repeat=' + passwords.repeat, { headers: { 'authorization' : `Bearer ${localStorage.getItem('token')}` } }).pipe(map((response: any) => response.user), catchError((err) => { throw err.error }))
  }

  resetPassword (params) {
    return this.http.post(this.hostServer + '/rest/user/reset-password', params).pipe(map((response: any) => response.user), catchError((err) => { throw err }))
  }

  whoAmI () {
    return this.http.get(this.hostServer + '/rest/user/whoami',{ headers: { 'authorization' : `Bearer ${localStorage.getItem('token')}` } }).pipe(map((response: any) => response.user), catchError((err) => { throw err }))
  }

  oauthLogin (accessToken) {
    return this.http.get('https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=' + accessToken)
  }

}
