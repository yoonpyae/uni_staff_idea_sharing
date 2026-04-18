import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RootModel } from '../models/root.model';
import { CategoryModel } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(private httpClient: HttpClient) { }

  get(): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/categories`);
  }

  getById(id: number): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/categories/${id}`);
  }

  create(model: CategoryModel): Observable<RootModel> {
    return this.httpClient.post<RootModel>(`${environment.main_url}/categories`, model);
  }

  update(id: number, model: CategoryModel): Observable<RootModel> {
    return this.httpClient.post<RootModel>(`${environment.main_url}/categories/${id}`, model);
  }

  delete(id: number): Observable<RootModel> {
    return this.httpClient.delete<RootModel>(`${environment.main_url}/categories/${id}`);
  }
}
