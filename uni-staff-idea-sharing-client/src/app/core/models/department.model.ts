export interface DepartmentModel {
    departmentID: number;
    departmentName: string;
    created_at: string;
    updated_at: string;
    qa_coordinator: QACoordinator | null;
}

export interface QACoordinator {
    staffID: number;
    staffName: string;
    staffEmail: string;
}