import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RootModel } from '../models/root.model';
import { DepartmentModel } from '../models/department.model';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {

  constructor(private httpClient: HttpClient) { }

  get(): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/departments`);
  }

  getStaffByDepartment(departmentId: number): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/departments/${departmentId}/staffs`);
  }

  getById(id: number): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/departments/${id}`);
  }

  create(model: DepartmentModel): Observable<RootModel> {
    return this.httpClient.post<RootModel>(`${environment.main_url}/departments`, model);
  }

  update(id: number, model: DepartmentModel): Observable<RootModel> {
    return this.httpClient.post<RootModel>(`${environment.main_url}/departments/${id}`, model);
  }

  delete(id: number): Observable<RootModel> {
    return this.httpClient.delete<RootModel>(`${environment.main_url}/departments/${id}`);
  }
}
