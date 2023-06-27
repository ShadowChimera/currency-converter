import { Injectable } from '@angular/core';

@Injectable()
export class PopupService {
  constructor() {}

  handlePopupClose(
    relatedElements: HTMLElement | Array<HTMLElement | undefined>,
    onClose: () => void
  ) {
    const outsideClickListener = (event: MouseEvent) => {
      if (!Array.isArray(relatedElements)) {
        relatedElements = [relatedElements];
      }

      for (let el of relatedElements) {
        if (!el) {
          continue;
        }
        if (this.isVisible(el) && el.contains(event.target as Node)) {
          return;
        }
      }

      onClose();
      removeListeners();
    };

    const escapeButtonClickListener = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        removeListeners();
      }
    };

    const removeClickListener = () => {
      document.removeEventListener('click', outsideClickListener);
    };

    const removeEscapeButtonClickListener = () => {
      document.removeEventListener('keydown', escapeButtonClickListener);
    };

    const removeListeners = () => {
      removeClickListener();
      removeEscapeButtonClickListener();
    };

    document.addEventListener('click', outsideClickListener);
    document.addEventListener('keydown', escapeButtonClickListener);

    return removeListeners;
  }

  private isVisible(elem: HTMLElement) {
    return (
      !!elem &&
      !!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length)
    );
  }
}
