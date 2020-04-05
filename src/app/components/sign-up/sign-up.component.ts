import { Component, OnInit, NgZone } from '@angular/core';
import { NewUser } from 'src/app/interfaces/user';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {
  newUser = {
    name: '',
    password: '',
    username: '',
    confirmPass: ''
  };

  constructor(
    private us: UserService,
    public zone: NgZone,
    private router: Router
  ) {}

  ngOnInit(): void {}

  onSubmit() {
    this.us.signUp(this.newUser).subscribe(data => {
      switch (data['code']) {
        case 1:
          alert('Username already taken. Please try another');
          break;
        case 0:
          this.us.setUserInstance(data['data']);
          this.zone.run(() => this.router.navigate(['/dashboard']));
          break;
      }
    });
  }
}
