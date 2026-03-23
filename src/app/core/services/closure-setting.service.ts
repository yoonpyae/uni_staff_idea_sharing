import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RootModel } from '../models/root.model';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ClosureSettingModel } from '../models/closureSetting.model';

@Injectable({
  providedIn: 'root'
})
export class ClosureSettingService {

  constructor(private httpClient: HttpClient) { }

  get(): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/closure-settings`);
  }

  getById(id: number): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/closure-settings/${id}`);
  }

  create(model: ClosureSettingModel): Observable<RootModel> {
    return this.httpClient.post<RootModel>(`${environment.main_url}/closure-settings`, model);
  }

  update(id: number, model: ClosureSettingModel): Observable<RootModel> {
    return this.httpClient.post<RootModel>(`${environment.main_url}/closure-settings/${id}`, model);
  }

  delete(id: number): Observable<RootModel> {
    return this.httpClient.delete<RootModel>(`${environment.main_url}/closure-settings/${id}`);
  }
}
