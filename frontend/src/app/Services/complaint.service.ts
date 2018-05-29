import { environment } from './../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, catchError } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class ComplaintService {

  private hostServer = environment.hostServer;
  private host = this.hostServer + '/api/Complaints';
  constructor(private http: HttpClient) { }

  save (params) {
    return this.http.post(this.host + '/', params).pipe(map((response: any) => response.data), catchError((err) => { throw err; }));
  }

}
