import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { RootModel } from '../../models/root.model';
import { ReportModel } from '../../models/ideas/report.model';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor(private httpClient: HttpClient) { }

  get(): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/reports`);
  }

  getById(id: number): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/reports/${id}`);
  }

  create(model: ReportModel | any): Observable<RootModel> {
    return this.httpClient.post<RootModel>(`${environment.main_url}/reports`, model);
  }

  update(id: number, model: ReportModel | any): Observable<RootModel> {
    return this.httpClient.put<RootModel>(`${environment.main_url}/reports/${id}`, model);
  }

  delete(id: number): Observable<RootModel> {
    return this.httpClient.delete<RootModel>(`${environment.main_url}/reports/${id}`);
  }
}
