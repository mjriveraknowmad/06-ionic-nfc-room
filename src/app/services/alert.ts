import { inject, Service } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Service()
export class Alert {
  private alertController = inject(AlertController);

  async alertMessage(header:string,message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
