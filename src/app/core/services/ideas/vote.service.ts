import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { RootModel } from '../../models/root.model';

@Injectable({
  providedIn: 'root'
})
export class VoteService {

  constructor(private http: HttpClient) { }

  store(model: { voteType: string, staffID: number, ideaID: number }): Observable<RootModel> {
    return this.http.post<RootModel>(`${environment.main_url}/votes`, model);
  }

  update(id: number, model: any): Observable<RootModel> {
    return this.http.post<RootModel>(`${environment.main_url}/votes/${id}`, model);
  }

  delete(id: number): Observable<RootModel> {
    return this.http.delete<RootModel>(`${environment.main_url}/votes/${id}`);
  }
}

