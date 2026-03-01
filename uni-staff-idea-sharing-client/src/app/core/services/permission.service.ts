import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RootModel } from '../models/root.model';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  constructor(private httpClient: HttpClient) { }

  get(): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/permissions`);
  }

  
}
