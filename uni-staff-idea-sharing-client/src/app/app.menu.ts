export interface MenuItem {
  label: string;
  icon?: string;
  routerLink?: string[];
  items?: MenuItem[];
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
      },
      {
        label: 'Staff Accounts',
        icon: 'pi pi-fw pi-users',
        routerLink: ['/staff-accounts'],
      },
      {
        label: 'Submit Ideas',
        icon: 'pi pi-fw pi-lightbulb',
        routerLink: ['/submit-ideas'],
      },
      {
        label: 'Closure Dates',
        icon: 'pi pi-fw pi-calendar',
        routerLink: ['/closure-dates'],
      },
    ],
  },
  {
    label: 'Settings',
    items: [
      {
        label: 'System Settings',
        icon: 'pi pi-fw pi-cog',
        routerLink: ['/system-settings'],
      },
    ],
  },
];