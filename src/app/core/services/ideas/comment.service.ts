import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { RootModel } from '../../models/root.model';

@Injectable({
  providedIn: 'root'
})
export class CommentService {

  constructor(private http: HttpClient) { }

  get(): Observable<RootModel> {
    return this.http.get<RootModel>(`${environment.main_url}/comments`);
  }

  create(model: any): Observable<RootModel> {
    return this.http.post<RootModel>(`${environment.main_url}/comments`, model);
  }

  update(id: number, model: any): Observable<RootModel> {
    return this.http.post<RootModel>(`${environment.main_url}/comments/${id}`, model);
  }

  delete(id: number): Observable<RootModel> {
    return this.http.delete<RootModel>(`${environment.main_url}/comments/${id}`);
  }
}
