import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RootModel } from '../models/root.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private httpClient: HttpClient) { }

  getUsageStats(): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/system-reports/usage`);
  }
}
