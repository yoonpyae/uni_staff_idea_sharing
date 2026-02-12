import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { filter, map, startWith } from 'rxjs';
import { TitleService } from './Shared/services/title.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule],
  providers: [TitleService],
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'uni-staff-idea-sharing-client';


  constructor(
    private titleService: TitleService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    this.router.events
    .pipe(
      filter((event) => event instanceof NavigationEnd),
      startWith(true), // Ensure execution on refresh
      map(() => this.activatedRoute),
      map((route) => {
        const titles: string[] = [];
        while (route) {
          if (route.snapshot.data['title']) {
            titles.unshift(route.snapshot.data['title']);
          }
          route = route.firstChild!;
        }
        return titles;
      })
    )
    .subscribe((titles) => {
      this.titleService.setTitle(titles);
    });
  }
}
