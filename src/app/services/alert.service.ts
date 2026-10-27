import { inject, Injectable } from '@angular/core';
import { AlertController, AlertInput } from '@ionic/angular/standalone'

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

  async alertInput(
    header: string,
    inputs: AlertInput[],
    cancelText: string = 'Cancelar',
    confirmText: string = 'Confirmar',
  ){
    const alert = await this.alertController.create({
      header,
      buttons: [
        {
          text: cancelText,
          role: 'cancel'
        },
        {
          text: confirmText,
          role: 'confirm',
          handler: (data: any) => {
            return data;
          },
        },
      ],
      inputs
    });

    await alert.present();
    const result = await alert.onDidDismiss();
    if(result.role == 'confirm'){
      return result.data;
    }
    return null;
  }

}
