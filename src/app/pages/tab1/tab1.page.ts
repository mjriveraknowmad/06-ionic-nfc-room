import { Component, inject } from '@angular/core';
import { NdefEvent, NFC } from '@awesome-cordova-plugins/nfc/ngx';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonImg
} from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';
import { AlertService } from 'src/app/services/alert.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonText,
    IonImg
  ],
  providers: [
    NFC // Necesario para usar NFC
  ]
})
export class Tab1Page {

  private nfc: NFC = inject(NFC);
  private alertService: AlertService = inject(AlertService);

  // Usado para limpiar subscripciones
  private subscription: Subscription = new Subscription();

  ionViewWillEnter() {
    this.readCard();
  }

  ionViewWillLeave() {
    // Limpio la subscripcion
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  readCard() {

    // Comprobamos si el NFC esta habilitado
    this.nfc.enabled().then(() => {

      // Empezamos a detectar con NFC
      this.subscription = this.nfc.addNdefListener().subscribe({
        next: (event: NdefEvent) => {

          console.log("NdefEvent: ", event);

          // Obtenemos los records del tag
          const records = event.tag.ndefMessage;
          if (records?.length > 0) {

            // Obtenemos el payload con la informacion
            const payload = records[0].payload;

            // quitamos los 3 primeros bytes de control
            const text = this.nfc.bytesToString(payload).substring(3);

            try {
              // parseamos el objeto
              const data = JSON.parse(text);

              // Si tiene la info que necesitamos, mostramos un mensaje
              if (data.hotel && data.room) {
                this.alertService.alertMessage(
                  'Informacion de la tarjeta',
                  `Datos de la tarjeta:<br/><br/>
                    - Nombre del hotel: ${data.hotel}<br/><br/>
                    - Numero de habitacion: ${data.room}`
                );
              } else {
                this.alertService.alertMessage(
                  'Error',
                  'El formato no es correcto'
                );
              }
            } catch (error) {
              this.alertService.alertMessage(
                'Error',
                'Error al leer la tarjeta NFC'
              );
            }

          } else {
            this.alertService.alertMessage(
              'Error',
              'No se encoontro mensaje NDEF en el tag. Metadata: '+
              JSON.stringify(event.tag)
            );
          }

        }
      });

    }).catch(err => {
      this.alertService.alertMessage(
        'Error',
        'NFC no esta habilitado: ' + JSON.stringify(err)
      )
    })

  }

}
