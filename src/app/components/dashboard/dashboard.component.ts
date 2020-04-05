import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
  NgZone,
} from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { first, map, take } from 'rxjs/operators';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  newMessage: string = '';
  file: File = null;
  profilePic$;
  userInstance$;
  chatMsgs$;
  @ViewChild('history', { static: true }) history: ElementRef;
  @ViewChild('textarea') textarea: CdkTextareaAutosize;
  constructor(
    public us: UserService,
    private ref: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  triggerResize() {
    this.zone.onStable
      .pipe(take(1))
      .subscribe(() => this.textarea.resizeToFitContent(true));
  }

  ngOnInit(): void {
    this.profilePic$ = this.us.userInstance.pipe(
      map((res) => (res ? res.profilePic : res))
    );
    this.us.connectWebsocket();
    const h = this.history?.nativeElement;
    this.us.chatMsgs.subscribe((res) => {
      this.scroller(h);
    });
  }

  sendMsg() {
    if (!!!this.newMessage.trim().length) {
      this.newMessage = '';
      return;
    }

    this.us.sendChatMessage(this.newMessage);
    this.newMessage = '';
  }

  handleFileInput(ev) {
    if (ev.target.files && ev.target.files[0]) {
      this.file = ev.target.files.item(0);

      if (
        this.file.type == 'image/png' ||
        this.file.type == 'image/jpg' ||
        this.file.type == 'image/jpeg'
      ) {
        if (this.file.size > 32 << 20) {
          alert('File too large. Add a file smaller than 32 MB');
          return;
        }
        this.us.uploadImage(this.file).subscribe((data) => {
          if (this.us.sessionExpired(data)) return;
          switch (data['code']) {
            case 1:
              alert(data['message']);
              break;
            case 0:
              let user;
              this.us.userInstance
                .pipe(first())
                .subscribe((res) => (user = res));
              user.profilePic = data['message'];
              this.us.setUserInstance(user);
              break;
          }
        });
        return;
      }
      alert('Choose a PNG or JPG image.');
    }
  }

  scroller(h) {
    let flag = true;
    const margin = 0.02 * window.innerHeight;
    if (h.lastElementChild.clientHeight < h.clientHeight) {
      flag = false;
      this.ref.detectChanges();
      let style = window.getComputedStyle(h.lastElementChild);
      let top =
        parseInt(style.getPropertyValue('top')) -
        h.lastElementChild.lastElementChild?.scrollHeight;
      let newWrapperHeight =
        parseInt(style.getPropertyValue('top')) +
        h.lastElementChild.lastElementChild?.scrollHeight;
      if (top < 0) {
        h.lastElementChild.style.top = '2vh';
      } else {
        h.lastElementChild.style.top = top - margin + 'px';
      }
    }

    if (flag) {
      this.ref.detectChanges();
    }

    h.scrollTop = h.scrollHeight;
  }

  deleteProfilePic() {
    this.us.deleteProfilePic().subscribe((res) => {
      if (this.us.sessionExpired(res)) return;
    });
  }

  getTime(time) {
    return time.month + ' ' + time.day + ' @ ' + time.hour + ':' + time.minute;
  }
}
