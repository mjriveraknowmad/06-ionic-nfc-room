import { Component, inject } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  AlertInput,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonImg
} from '@ionic/angular/standalone';
import { FingerprintAIO } from '@awesome-cordova-plugins/fingerprint-aio/ngx'
import { AlertService } from 'src/app/services/alert.service';
import { environment } from 'src/environments/environment.prod';
import { Ndef, NFC } from '@awesome-cordova-plugins/nfc/ngx'
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
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
    FingerprintAIO, // Necesario para biometria
    NFC, // Necesario para usar NFC
    Ndef
  ]
})
export class Tab2Page {

  private fingerprint: FingerprintAIO = inject(FingerprintAIO);
  private alertService: AlertService = inject(AlertService);
  private nfc: NFC = inject(NFC);
  private nDef: Ndef = inject(Ndef);

  public ready: boolean = false;
  private unsubscribe$!: Subject<void>;

  ionViewWillEnter() {

    // reinicio de propiedades
    this.ready = false;
    this.unsubscribe$ = new Subject<void>();
    // Comprobamos si la biometria esta disponible
    this.fingerprint.isAvailable({
      requireStrongBiometrics: true
    }).then(() => {
      // Mostramos las opciones disponibles para autenticarse
      this.fingerprint.show({
        title: 'Usa biometria para autenticarte',
        cancelButtonTitle: 'Cancelar'
      }).then(() => {
        this.ready = true;
        this.writeCard();
      })
    }).catch(err => {
      // Codigo secreto en caso de que no exista
      this.checkPasswordCode();
    })

  }

  ionViewWillLeave() {
    // Limpieza de variables
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  async checkPasswordCode() {

    // Input password
    const alertInputs: AlertInput[] = [
      {
        type: 'password',
        placeholder: 'Introduce la contraseña secreta',
        name: 'password'
      }
    ]

    // Pido la contraseña secreta
    const result = await this.alertService.alertInput(
      'Introducción de datos',
      alertInputs
    )

    // si coincide, podemos escribir en la tarjeta
    if (result && result.password == environment.passwordCode) {
      this.ready = true;
      this.writeCard();
    }

  }

  writeCard() {
    this.nfc.enabled().then(() => {
      this.nfc.addNdefListener()
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: async () => {
            const alertInputs: AlertInput[] = [
              {
                type: 'number',
                placeholder: 'Numero habitacion',
                name: 'room'
              }
            ];

            const result = await this.alertService.alertInput(
              'Introduccion de datos',
              alertInputs
            );

            if (result && result['room']) {
              await this.performNfcWrite(result['room']);
            }
          }
        });
    }).catch(err => {
      this.alertService.alertMessage(
        'Error',
        'NFC no esta habilitado: ' + JSON.stringify(err)
      );
    });
  }

  private async performNfcWrite(room: string) {
    try {
      const data = {
        hotel: environment.hotelName,
        room: room
      };

      const jsonString = JSON.stringify(data);

      // Validar tamaño para NTAG203 (max ~140 bytes de datos útiles)
      if (jsonString.length > 140) {
        await this.alertService.alertMessage(
          'Advertencia',
          'Los datos son demasiado grandes para NTAG203. Intenta con datos más cortos.'
        );
        return;
      }

      const message = this.nDef.textRecord(jsonString);
      
      await this.nfc.write([message]);
      
      await this.alertService.alertMessage(
        'Éxito',
        'Datos escritos correctamente en la tarjeta'
      );
    } catch (err: any) {
      this.handleNfcWriteError(err);
    }
  }

  private async handleNfcWriteError(err: any) {
    const errorString = JSON.stringify(err);
    const errorMessage = err?.toString() || '';

    console.error('Error al escribir NFC:', err);

    // Diagnosticar el tipo de error específico
    if (errorMessage.includes('IOException') || errorString.includes('IOException')) {
      await this.alertService.alertMessage(
        'Error de E/S (IOException)',
        'No se puede escribir en la etiqueta. Posibles causas:\n\n' +
        '✗ La etiqueta no está formateada como NDEF\n' +
        '✗ La etiqueta está protegida contra escritura\n' +
        '✗ NTAG203 no tiene suficiente espacio disponible\n\n' +
        'Solución: Usa NFC Tools para formatear la etiqueta como NDEF y reintenta.'
      );
    } else if (errorMessage.includes('TagLostException') || errorString.includes('TagLost')) {
      await this.alertService.alertMessage(
        'Error',
        'La etiqueta se perdió durante la escritura. Acerca la etiqueta nuevamente al dispositivo.'
      );
    } else if (errorMessage.includes('FormatException') || errorString.includes('Format')) {
      await this.alertService.alertMessage(
        'Error de Formato',
        'La etiqueta no tiene un formato NDEF válido. Formatea la etiqueta con NFC Tools.'
      );
    } else if (errorMessage.includes('Read-only') || errorString.includes('readonly')) {
      await this.alertService.alertMessage(
        'Etiqueta Protegida',
        'La etiqueta está protegida contra escritura. Desprotégela con NFC Tools.'
      );
    } else {
      await this.alertService.alertMessage(
        'Error desconocido',
        'Error al escribir en la tarjeta NFC:\n\n' + errorString
      );
    }
  }


}
