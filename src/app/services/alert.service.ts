import { inject, Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular/standalone'

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  private alertController: AlertController = inject(AlertController)

  async alertMessage(
    header: string,
    message: string
  ) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });

    await alert.present();
  }

  async alertConfirm(
    header: string,
    message: string,
    functionOk: Function,
    cancelText: string = 'Cancelar',
    confirmText: string = 'Confirmar',
  ){
    const alert = await this.alertController.create({
      header,
      message,
      buttons: [
        {
          text: cancelText,
          role: 'cancel'
        },
        {
          text: confirmText,
          role: 'confirm',
          handler: () => {
            functionOk()
          },
        },
      ],
    });

    await alert.present();
  }

}
