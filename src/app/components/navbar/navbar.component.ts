import { Component, OnInit, NgZone } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  constructor(
    public us: UserService,
    public zone: NgZone,
    private router: Router
  ) {}

  ngOnInit(): void {}

  signOut() {
    this.us.signOut().subscribe(() => {
      this.us.deleteUserInstance();
      this.zone.run(() => this.router.navigate(['/signin']));
    });
  }
}
