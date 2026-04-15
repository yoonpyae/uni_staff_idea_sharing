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

  getApprovedIdeas(page: number = 1): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/ideas/approved?page=${page}`);
  }

  getById(id: number): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/ideas/${id}`);
  }

  increaseViewCount(id: number): Observable<RootModel> {
    return this.httpClient.post<RootModel>(`${environment.main_url}/ideas/${id}/increase-view`, {});
  }

  create(model: IdeaModel): Observable<RootModel> {
    return this.httpClient.post<RootModel>(`${environment.main_url}/ideas`, model);
  }

  update(id: number, model: Partial<IdeaModel>): Observable<RootModel> {
    return this.httpClient.post<RootModel>(`${environment.main_url}/ideas/${id}`, model);
  }

  updateStatus(id: number, payload: { status: string, settingID?: number }): Observable<RootModel> {
    return this.httpClient.post<RootModel>(`${environment.main_url}/ideas/${id}/status`, payload);
  }

  updateOnlyStatus(id: number, payload: { status: string }): Observable<RootModel> {
    return this.httpClient.post<RootModel>(`${environment.main_url}/ideas/${id}/only-status`, payload);
  }

  delete(id: number): Observable<RootModel> {
    return this.httpClient.delete<RootModel>(`${environment.main_url}/ideas/${id}`);
  }

  hide(id: number): Observable<RootModel> {
    return this.httpClient.patch<RootModel>(`${environment.main_url}/ideas/${id}/hide`, {});
  }
}