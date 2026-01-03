import { defineStore } from 'pinia'

export const useModalStore = defineStore('modal', {
  state: () => ({
    modal: null,
  }),
  actions: {
    openModal(data) {
      this.modal = data
      this.modal.open = true
    },
    closeModal() {
      this.modal = null
    }
  },
})