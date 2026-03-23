export interface ClosureSettingModel {
    settingID?: number;
    title: string;
    closureDate: string | Date;
    finalclosureDate: string | Date;
    academicYear: string;
    status: string;
    created_at?: string;
    updated_at?: string;
}