export interface MenuItem {
  label: string;
  icon?: string;
  routerLink?: string[];
  items?: MenuItem[];
  roles?: string[];
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
        roles: ['Administrator']
      },
      {
        label: 'User Roles',
        icon: 'pi pi-fw pi-cog',
        routerLink: ['/role'],
        roles: ['Administrator']
      },
      {
        label: 'User Accounts',
        icon: 'pi pi-fw pi-users',
        routerLink: ['/user-accounts'],
        roles: ['Administrator']
      },
      {
        label: 'Closure Settings',
        icon: 'pi pi-fw pi-calendar',
        routerLink: ['/closure-settings'],
        roles: ['Administrator']
      },
      {
        label: 'Categories',
        icon: 'pi pi-fw pi-list',
        routerLink: ['/idea-categories'],
        roles: ['QA Manager']
      },
      {
        label: 'Ideas',
        icon: 'pi pi-fw pi-lightbulb',
        routerLink: ['/submit-ideas'],
      },
      {
        label: 'Staff Management',
        icon: 'pi pi-fw pi-users',
        routerLink: ['/staff-management'],
        roles: ['QA Manager']
      },
      {
        label: 'Pending Ideas',
        icon: 'pi pi-fw pi-hourglass',
        routerLink: ['/pending-ideas'],
        roles: ['QA Coordinator']
      },
    ],
  },
];