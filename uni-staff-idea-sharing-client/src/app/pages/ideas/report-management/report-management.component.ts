import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { ReportService } from '../../../core/services/ideas/report.service';
import { ReportModel } from '../../../core/models/ideas/report.model';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { StaffService } from '../../../core/services/staff.service';
import { IdeaService } from '../../../core/services/ideas/idea.service';
import { CommentService } from '../../../core/services/ideas/comment.service';
@Component({
  selector: 'app-report-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    ConfirmDialogModule,
    ToastModule,
    DropdownModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './report-management.component.html',
  styleUrl: './report-management.component.scss'
})
export class ReportManagementComponent implements OnInit {
  @ViewChild('dt') table!: Table;

  reports: ReportModel[] = [];
  selectedReport: ReportModel | null = null;
  displayDetailsModal: boolean = false;

  // Pagination
  rows: number = 10;
  rowsPerPageOptions = [5, 10, 20, 50];

  // Filters
  statusFilterOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'Resolved', value: 'resolved' },
    { label: 'Dismissed', value: 'dismissed' }
  ];

  typeFilterOptions = [
    { label: 'Idea', value: 'idea' },
    { label: 'Comment', value: 'comment' }
  ];
  currentAdminId: number = 0;
  departmentID: number = 0;

  constructor(
    private reportService: ReportService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private cookieService: CookieService,
    private router: Router,
    private staffService: StaffService,
    private ideaService: IdeaService,
    private commentService: CommentService
  ) { }

  ngOnInit(): void {
    const staffIDStr = this.cookieService.get('staffID');
    this.currentAdminId = staffIDStr ? Number(staffIDStr) : 0;

    const deptIDStr = this.cookieService.get('departmentID');
    this.departmentID = deptIDStr ? Number(deptIDStr) : 0; 

    this.loadReports();
  }

  loadReports(): void {
    this.reportService.getReportsByDepartment(this.departmentID).subscribe({
      next: (res) => {
        let fetchedReports = res.data as ReportModel[];
        this.reports = fetchedReports.sort((a, b) => {
          if (a.status === 'pending' && b.status !== 'pending') return -1;
          if (a.status !== 'pending' && b.status === 'pending') return 1;
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        });
      },
      error: (err) => {
        console.error('Error loading department reports:', err);
        this.reports = [];
        this.messageService.add({
          severity: 'info',
          summary: 'Info',
          detail: 'No reports found for your department.'
        });
      }
    });
  }

  onGlobalFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.table.filterGlobal(value, 'contains');
  }

  viewDetails(report: ReportModel): void {
    this.selectedReport = report;
    this.displayDetailsModal = true;
  }

  updateReportStatus(report: ReportModel, newStatus: 'resolved' | 'dismissed', event?: Event): void {
    if (event) event.stopPropagation();

    const actionText = newStatus === 'resolved' ? 'resolve' : 'dismiss';

    this.confirmationService.confirm({
      target: event?.target as EventTarget,
      message: `Are you sure you want to ${actionText} this report?`,
      header: 'Confirm Action',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        // Payload based on Laravel validation rules
        const payload = {
          report_type: report.report_type,
          reason: report.reason,
          reporter_id: report.reporter_id,
          ideaID: report.ideaID,
          commentID: report.commentID,
          status: newStatus,
          resolved_by: this.currentAdminId
        };

        this.reportService.update(report.report_id!, payload).subscribe({
          next: (res) => {
            report.status = newStatus; // Update UI instantly
            this.displayDetailsModal = false;
            this.messageService.add({ severity: 'success', summary: 'Success', detail: `Report marked as ${newStatus}` });
          },
          error: (err) => {
            console.error(`Failed to ${actionText} report:`, err);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update status' });
          }
        });
      }
    });
  }

  getStatusColor(status: string | undefined): string {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      case 'resolved': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'dismissed': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  goToLiveContent(report: ReportModel): void {
    const ideaIdToNavigate = report.report_type === 'idea' ? report.ideaID : report.comment?.ideaID;

    if (ideaIdToNavigate) {
      this.displayDetailsModal = false; // close modal
      this.router.navigate(['/submit-ideas/idea-detail', ideaIdToNavigate]);
    } else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Cannot find the original post ID.' });
    }
  }

  hideContentAndResolve(report: ReportModel, event: Event): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `This will hide the ${report.report_type} from everyone and resolve the report. Continue?`,
      header: 'Hide Content',
      icon: 'pi pi-eye-slash',
      accept: () => {

        // Define what happens on success
        const handleSuccess = () => {
          this.messageService.add({ severity: 'success', summary: 'Content Hidden', detail: `The ${report.report_type} was successfully hidden.` });
          this.updateReportStatus(report, 'resolved');
        };

        const handleError = (err: any) => {
          this.messageService.add({ severity: 'error', summary: 'Action Failed', detail: 'Could not hide the content.' });
          console.error(err);
        };

        if (report.report_type === 'idea' && report.ideaID) {
          this.ideaService.delete(report.ideaID).subscribe({ next: handleSuccess, error: handleError });

        } else if (report.report_type === 'comment' && report.commentID) {
          this.commentService.delete(report.commentID).subscribe({ next: handleSuccess, error: handleError });
        }
      }
    });
  }

  disableAuthorAndResolve(report: ReportModel, event: Event): void {
    const authorId = report.report_type === 'idea' ? report.idea?.staffID : report.comment?.staffID;

    if (!authorId) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not identify the author.' });
      return;
    }

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `This will completely DISABLE the author's account and resolve the report. Continue?`,
      header: 'Disable User Account',
      icon: 'pi pi-user-minus',
      accept: () => {
        this.staffService.updateStatus(authorId, 'disabled').subscribe();

        this.updateReportStatus(report, 'resolved');
      }
    });
  }
}