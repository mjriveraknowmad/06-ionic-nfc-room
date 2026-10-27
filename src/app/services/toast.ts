import { inject, Service } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Service()
export class Toast {
  private toastController = inject(ToastController);

  async showToast(message: string, position: 'top' | 'middle' | 'bottom' = 'top', duration: number = 2000) {
    const toast = await this.toastController.create({
      message,
      position,
      duration,
    });
    await toast.present();
  }
}
