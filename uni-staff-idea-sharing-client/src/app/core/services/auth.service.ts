import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Observable, tap } from 'rxjs';
import { RootModel } from '../models/root.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly tokenKey = 'access_token';
  private readonly refreshTokenKey = 'refresh_token';

  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) { }

  login(email: string, password: string): Observable<RootModel> {
    const url = `${environment.main_url}/staff/login`;

    return this.http.post<RootModel>(url, {
      staffEmail: email,
      staffPassword: password
    }).pipe(
      tap(res => {
        if (res.success) {
          this.storeSession(res);
        }
      })
    );
  }

  private storeSession(res: RootModel): void {
    const data: any = res?.data || {};

    const accessToken = data.token || data.access_token;
    const refreshToken = data.refresh_token || data.refreshToken;

    if (accessToken) {
      localStorage.setItem(this.tokenKey, accessToken);
    }

    if (refreshToken) {
      localStorage.setItem(this.refreshTokenKey, refreshToken);
    }

    const staff = data.staffs || data.user || data;

    if (staff) {
      const id = staff.staffID || staff.id;
      const name = staff.staffName || staff.name;
      const role = staff.role.roleName || staff.role;
      const profilePicture = staff.staffProfile;
      const deptId = staff.departmentID || (staff.department ? staff.department.departmentID : null);
      const deptName = staff.department?.departmentName || staff.departmentName;

      if (deptName) this.cookieService.set('departmentName', String(deptName));
      if (id) this.cookieService.set('staffID', String(id));
      if (name) this.cookieService.set('staffName', String(name));
      if (role) this.cookieService.set('roleName', String(role));
      if (profilePicture) this.cookieService.set('staffProfile', String(profilePicture));
      if (deptId) this.cookieService.set('departmentID', String(deptId));
    }

    this.cookieService.set('authorized_status', 'true');

    if (staff && staff.role && staff.role.permissions) {
      // Extract permission names into a comma-separated string for the cookie
      const permissionNames = staff.role.permissions.map((p: any) => p.permission).join(',');
      this.cookieService.set('userPermissions', permissionNames);
    }
  }

  me(): Observable<RootModel> {
    return this.http.get<RootModel>(`${environment.main_url}/staff/me`);
  }

  hasPermission(permission: string): boolean {
    const cookieValue = this.cookieService.get('userPermissions');
    if (!cookieValue) return false;

    // URL-decode the cookie string to handle spaces/special characters correctly
    const permissions = decodeURIComponent(cookieValue).split(',');
    return permissions.includes(permission);
  }

  refreshToken(): Observable<RootModel> {
    return this.http.post<RootModel>(`${environment.main_url}/staff/refresh`, {})
      .pipe(
        tap(res => {
          if (res.success && res.data?.token) {
            localStorage.setItem(this.tokenKey, res.data.token);
          }
        })
      );
  }

  logout(): Observable<RootModel> {
    const token = this.getToken();

    const headers = token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : undefined;

    return this.http.post<RootModel>(
      `${environment.main_url}/staff/logout`,
      {},
      { headers }
    );
  }

  logoutForce(): void {
    this.cookieService.deleteAll();

    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
