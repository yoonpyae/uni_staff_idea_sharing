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
        label: 'User Roles',
        icon: 'pi pi-fw pi-cog',
        routerLink: ['/user-roles'],
      },
      {
        label: 'User Accounts',
        icon: 'pi pi-fw pi-users',
        routerLink: ['/user-accounts'],
      },
      {
        label: 'Closure Dates',
        icon: 'pi pi-fw pi-calendar',
        routerLink: ['/closure-dates'],
      },
      {
        label: 'Submit Ideas',
        icon: 'pi pi-fw pi-lightbulb',
        routerLink: ['/submit-ideas'],
      },
    ],
  },
];