import { Component, OnInit, NgZone } from '@angular/core';
import { UserService } from './services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'basicFront';

  constructor(
    private us: UserService,
    public zone: NgZone,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.us.getUser().subscribe(data => {
      if (!!!data['code']) {
        this.us.setUserInstance(data['data']);
        this.zone.run(() => this.router.navigate(['/dashboard']));
      }
    });
  }
}
