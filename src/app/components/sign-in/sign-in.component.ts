import { Component, OnInit, NgZone } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit {
  user = {
    username: '',
    password: ''
  };

  constructor(
    private us: UserService,
    public zone: NgZone,
    private router: Router
  ) {}

  ngOnInit(): void {}

  onSubmit() {
    this.us.signIn(this.user).subscribe(data => {
      switch (data['code']) {
        case 1:
          alert('Wrong password. Please try again');
          break;
        case 0:
          this.us.setUserInstance(data['data']);
          this.zone.run(() => this.router.navigate(['/dashboard']));
          break;
      }
    });
  }
}
