import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IdeaCategoryModel } from '../../models/ideas/idea-category.model';
import { RootModel } from '../../models/root.model';

@Injectable({
  providedIn: 'root'
})
export class IdeaCategoryService {

  constructor(private http: HttpClient) { }

  store(model: Partial<IdeaCategoryModel>): Observable<RootModel> {
    return this.http.post<RootModel>(`${environment.main_url}/idea-categories`, model);
  }
}