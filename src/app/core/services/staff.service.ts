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

  create(model: any): Observable<RootModel> {
    return this.httpClient.post<RootModel>(`${environment.main_url}/staffs`, model);
  }

  update(id: number, model: any): Observable<RootModel> {
    return this.httpClient.post<RootModel>(`${environment.main_url}/staffs/${id}`, model);
  }

  updateStatus(id: number, status: string): Observable<RootModel> {
    return this.httpClient.patch<RootModel>(`${environment.main_url}/staffs/${id}/status`, {
      account_status: status
    });
  }

  delete(id: number): Observable<RootModel> {
    return this.httpClient.delete<RootModel>(`${environment.main_url}/staffs/${id}`);
  }

  hideContent(id: number): Observable<RootModel> {
    return this.httpClient.patch<RootModel>(`${environment.main_url}/staffs/${id}/hide-content`, {});
  }

  unhideContent(id: number): Observable<RootModel> {
    return this.httpClient.patch<RootModel>(`${environment.main_url}/staffs/${id}/unhide-content`, {});
  }

  changePassword(data: any): Observable<RootModel> {
    return this.httpClient.post<RootModel>(`${environment.main_url}/staff/change-password`, data);
  }

  resetPassword(id: number): Observable<RootModel> {
    return this.httpClient.patch<RootModel>(`${environment.main_url}/staffs/${id}/reset-password`, {});
  }

  resetPasswordToDefault(staffID: number): Observable<RootModel> {
    return this.httpClient.post<RootModel>(`${environment.main_url}/staff/reset-password-default`, { staffID });
  }
}
