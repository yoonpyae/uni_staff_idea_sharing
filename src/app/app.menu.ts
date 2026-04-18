export interface MenuItem {
  label: string;
  icon?: string;
  routerLink?: string[];
  items?: MenuItem[];
  permissions?: string[];
}

export const NAVIGATION_MENU: Readonly<MenuItem[]> = [
  {
    label: 'Home',
    items: [
      {
        label: 'Dashboard',
        icon: 'pi pi-fw pi-chart-pie',
        routerLink: ['/dashboard'],
      },
    ],
  },
  {
    label: 'Management',
    items: [
      {
        label: 'Departments',
        icon: 'pi pi-fw pi-building',
        routerLink: ['/department'],
        permissions: ['Manage Departments']
      },
      {
        label: 'User Roles',
        icon: 'pi pi-fw pi-cog',
        routerLink: ['/role'],
        permissions: ['Manage Roles']
      },
      {
        label: 'User Accounts',
        icon: 'pi pi-fw pi-users',
        routerLink: ['/user-accounts'],
        permissions: ['Manage User Accounts']
      },
      {
        label: 'Closure Settings',
        icon: 'pi pi-fw pi-calendar',
        routerLink: ['/closure-settings'],
        permissions: ['Manage Closure Dates']
      },
      {
        label: 'Categories',
        icon: 'pi pi-fw pi-list',
        routerLink: ['/idea-categories'],
        permissions: ['Manage Idea Categories']
      },
      {
        label: 'Ideas',
        icon: 'pi pi-fw pi-lightbulb',
        routerLink: ['/submit-ideas'],
        permissions: ['Submit Ideas']
      },
      {
        label: 'Staff Management',
        icon: 'pi pi-fw pi-users',
        routerLink: ['/staff-management'],
        permissions: ['Manage Staff']
      },
      {
        label: 'Pending Ideas',
        icon: 'pi pi-fw pi-hourglass',
        routerLink: ['/pending-ideas'],
        permissions: ['Manage Pending Ideas']
      },
      {
        label: 'Report Management',
        icon: 'pi pi-fw pi-flag',
        routerLink: ['/report-management'],
        permissions: ['Manage Reports']
      },
    ],
  },
];