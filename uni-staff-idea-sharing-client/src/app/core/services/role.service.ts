import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RootModel } from '../models/root.model';
import { RoleModel } from '../models/role.model';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  constructor(private httpClient: HttpClient) { }

  get(): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/roles`);
  }

  getById(id: number): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/roles/${id}`);
  }

  create(model: RoleModel): Observable<RootModel> {
    return this.httpClient.post<RootModel>(`${environment.main_url}/roles`, model);
  }

  update(id: number, model: RoleModel): Observable<RootModel> {
    return this.httpClient.post<RootModel>(`${environment.main_url}/roles/${id}`, model);
  }

  assignPermissions(roleId: number, payload: any): Observable<any> {
    return this.httpClient.post(`${environment.main_url}/roles/${roleId}/permissions`, payload);
  }

  delete(id: number): Observable<RootModel> {
    return this.httpClient.delete<RootModel>(`${environment.main_url}/roles/${id}`);
  }
}
