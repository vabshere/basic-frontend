import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  baseUrl = '/api/';
  private socketConnection: WebSocketSubject<any> = webSocket(
    'ws://localhost:8080/ws'
  );
  chatMsgs: BehaviorSubject<any> = new BehaviorSubject([]);
  private chatMsgsArr = [];

  updateChatMsgs(msg) {
    if (this.sessionExpired(msg)) {
      this.chatMsgs.next(this.chatMsgsArr);
      this.chatMsgsArr = [];
      this.router.navigate['/signin'];
      return;
    } else if (!!msg) {
      this.chatMsgsArr.push(msg);
    } else {
      this.chatMsgsArr = [];
    }
    this.chatMsgs.next(this.chatMsgsArr);
  }

  connectWebsocket() {
    this.socketConnection.subscribe(
      (msg) => {
        this.updateChatMsgs(msg);
      },
      (err) => console.log('Ws Closed with err'),
      () => {
        console.log('closed connection');
        this.updateChatMsgs(null);
      }
    );
  }

  sendChatMessage(msg) {
    this.socketConnection.next(msg);
  }

  uploadImage(file) {
    const url = this.baseUrl + 'profilePic';
    let formData: FormData = new FormData();
    formData.append('image', file, file.name);
    return this.http.post(url, formData);
  }

  constructor(
    private http: HttpClient,
    private zone: NgZone,
    private router: Router
  ) {}

  public userInstance: BehaviorSubject<any> = new BehaviorSubject(undefined);

  setUserInstance(user) {
    this.userInstance.next(user);
  }

  deleteUserInstance() {
    this.userInstance.next(null);
  }

  signUp(newUser) {
    const url = this.baseUrl + 'signUp';
    var u = { ...newUser };
    delete u.confirmPass;
    u.password = this.stringToByteArray(u.password);
    console.log(u.password);

    return this.http.post(url, u);
  }

  signIn(user) {
    const url = this.baseUrl + 'signIn';
    var u = { ...user };
    u.password = this.stringToByteArray(u.password);
    return this.http.post(url, u);
  }

  getUser() {
    const url = this.baseUrl + 'getUser';
    return this.http.get('/api/getUser');
  }

  signOut() {
    const url = this.baseUrl + 'signOut';
    return this.http.delete(url);
  }

  deleteProfilePic() {
    const url = this.baseUrl + 'delProfilePic';
    return this.http.delete(url);
  }

  private stringToByteArray(str) {
    let utf8 = [];
    for (let i = 0; i < str.length; i++) {
      let charcode = str.charCodeAt(i);
      if (charcode < 0x80) utf8.push(charcode);
      else if (charcode < 0x800) {
        utf8.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f));
      } else if (charcode < 0xd800 || charcode >= 0xe000) {
        utf8.push(
          0xe0 | (charcode >> 12),
          0x80 | ((charcode >> 6) & 0x3f),
          0x80 | (charcode & 0x3f)
        );
      } else {
        i++;
        charcode =
          0x10000 + (((charcode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
        utf8.push(
          0xf0 | (charcode >> 18),
          0x80 | ((charcode >> 12) & 0x3f),
          0x80 | ((charcode >> 6) & 0x3f),
          0x80 | (charcode & 0x3f)
        );
      }
    }
    return utf8;
  }

  sessionExpired(res) {
    if (res.code == 10) {
      alert('Your session has expired. PLease signin again.');
      this.signOut().subscribe(() => {
        this.deleteUserInstance();
        this.zone.run(() => this.router.navigate(['/signin']));
      });
      return true;
    }
    return false;
  }
}
