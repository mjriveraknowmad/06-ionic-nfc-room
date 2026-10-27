import { Component, inject } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent
} from '@ionic/angular/standalone';
import { FingerprintAIO } from '@awesome-cordova-plugins/fingerprint-aio/ngx'

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent
  ],
  providers: [
    FingerprintAIO
  ]
})
export class Tab2Page {

  private fingerprint: FingerprintAIO = inject(FingerprintAIO);

  public ready: boolean = false;

  ionViewWillEnter(){

    this.ready = false;
    this.fingerprint.isAvailable({
      requireStrongBiometrics: true
    }).then(() => {
      this.fingerprint.show({
        title: 'Usa biometria para autenticarte',
        cancelButtonTitle: 'Cancelar'
      }).then(() => {
        this.ready = true;
      })
    }).catch(err => {

    })

  }


}
