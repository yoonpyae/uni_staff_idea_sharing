import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RootModel } from '../models/root.model';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StaffModel } from '../models/staff.model';

@Injectable({
  providedIn: 'root'
})
export class StaffService {

  constructor(private httpClient: HttpClient) { }

  get(): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/staffs`);
  }

  getById(id: number): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/staffs/${id}`);
  }

  create(model: StaffModel): Observable<RootModel> {
    return this.httpClient.post<RootModel>(`${environment.main_url}/staffs`, model);
  }

  update(id: number, model: StaffModel): Observable<RootModel> {
    return this.httpClient.post<RootModel>(`${environment.main_url}/staffs/${id}`, model);
  }

  delete(id: number): Observable<RootModel> {
    return this.httpClient.delete<RootModel>(`${environment.main_url}/staffs/${id}`);
  }
}
