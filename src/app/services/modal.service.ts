import {Injectable} from '@angular/core';

interface IModal {
  id: string;
  visible: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modals: IModal[] = [];

  constructor() {
  }

  isModalOpen(id: string): boolean {
    return !!this.modals.find(modal => modal.id === id)?.visible;
  }

  toggleModal(id: string) {
    const currentModal = this.modals.find(modal => modal.id === id);
    if (currentModal) {
      currentModal.visible = !currentModal.visible;
    }
    // this.visible = !this.visible;
  }

  register(id: string) {
    this.modals.push({
      id,
      visible: false,
    })
  }

  unregister(id: string) {
    this.modals = this.modals.filter(modal => modal.id !== id);
  }
}
