import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DocumentModel } from '../../models/ideas/document.model';
import { RootModel } from '../../models/root.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  constructor(private http: HttpClient) { }

  get(): Observable<RootModel> {
    return this.http.get<RootModel>(`${environment.main_url}/documents`);
  }

  store(model: Partial<DocumentModel>): Observable<RootModel> {
    return this.http.post<RootModel>(`${environment.main_url}/documents`, model);
  }

  delete(id: number): Observable<RootModel> {
    return this.http.delete<RootModel>(`${environment.main_url}/documents/${id}`);
  }
}