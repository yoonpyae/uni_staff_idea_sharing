import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IdeaModel } from '../../models/ideas/idea.model';
import { RootModel } from '../../models/root.model';

@Injectable({
  providedIn: 'root'
})
export class IdeaService {

  constructor(private httpClient: HttpClient) { }

  get(): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/ideas`);
  }

  getById(id: number): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/ideas/${id}`);
  }

  create(model: IdeaModel): Observable<RootModel> {
    return this.httpClient.post<RootModel>(`${environment.main_url}/ideas`, model);
  }

  update(id: number, model: Partial<IdeaModel>): Observable<RootModel> {
    return this.httpClient.put<RootModel>(`${environment.main_url}/ideas/${id}`, model);
  }

  delete(id: number): Observable<RootModel> {
    return this.httpClient.delete<RootModel>(`${environment.main_url}/ideas/${id}`);
  }
}