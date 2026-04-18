export interface StaffModel {
    staffID: number;
    staffName: string;
    staffPhNo: string;
    staffEmail: string;
    staffDOB: string;
    staffAddress: string;
    staffProfile: string;
    termsAccepted: number;
    termsAcceptedDate: null;
    createdDateTime: string;
    departmentID: number;
    roleID: number;
}

export interface ViewStaffModel {
    staffID: number;
    staffName: string;
    staffPhNo: string;
    staffEmail: string;
    staffDOB: string;
    staffAddress: string;
    staffProfile: string;
    termsAccepted: number;
    termsAcceptedDate: null;
    createdDateTime: string;
    last_login_at: null;
    account_status: string;
    departmentID: number;
    roleID: number;
    department: Department;
    role: Role;
}

export interface Role {
    roleID: number;
    roleName: string;
    created_at: string;
    updated_at: string;
    permissions: Permission[];
}


export interface Permission {
    permissionID: number;
    permission: string;
    created_at: null | string | string;
    updated_at: null;
    pivot: Pivot;
}

export interface Pivot {
    roleID: number;
    permissionID: number;
}

export interface Department {
    departmentID: number;
    departmentName: string;
    created_at: null | string;
    updated_at: null | string;
}