import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { CurrencyService, CurrencyData } from '../currency.service';

export interface SelectedCurrencyData extends Partial<CurrencyData> {
  code?: string;
  value?: string;
}

const DEFAULT_SELECTED_CURRENCY = 'UAH';

@Component({
  selector: 'app-currency-input',
  templateUrl: './currency-input.component.html',
  styleUrls: ['./currency-input.component.scss'],
})
export class CurrencyInputComponent implements OnChanges {
  @ViewChild('selectButton')
  selectButtonRef: ElementRef<HTMLElement> | undefined;

  @Input() currencyService!: CurrencyService;
  @Input() currencyToConvertTo: string | undefined;
  @Input() selectedCurrencyCode: string = DEFAULT_SELECTED_CURRENCY;
  @Input() currencyValue: string | undefined;
  @Input() conversionInfo: string = '';
  @Input() favoriteCurrencies: string[] = [];

  @Output() onCurrencyChange = new EventEmitter<string>();
  @Output() onCurrencyValueChange = new EventEmitter<string>();
  @Output() onFavoriteCurrenciesUpdate = new EventEmitter<string[]>();

  isSelectListVisible = false;

  selectedCurrencyData: SelectedCurrencyData = {
    value: '',
  };

  formControlCurrencyValue = new FormControl('');

  constructor() {}

  ngOnChanges(changes: SimpleChanges) {
    if ('currencyValue' in changes) {
      this.updateCurrencyValue();
    }

    if ('selectedCurrencyCode' in changes || 'currencyToConvertTo' in changes) {
      this.updateCurrencyData();
    }
  }

  async updateCurrencyData() {
    await this.loadCurrencyData();
  }

  async loadCurrencyData() {
    const currencyCode = this.selectedCurrencyCode;
    const currencyData = await this.currencyService.getCurrencyData(
      currencyCode
    );
    this.selectedCurrencyData = {
      ...this.selectedCurrencyData,
      ...currencyData[currencyCode],
      code: currencyCode,
    };
  }

  updateCurrencyValue() {
    this.handleInputChange(this.currencyValue);
  }

  handleSelectButtonClick() {
    this.isSelectListVisible = !this.isSelectListVisible;
  }

  handlePopupEscape() {
    this.isSelectListVisible = false;
  }

  handleCurrencySelect(currencyData: CurrencyData) {
    this.selectedCurrencyData = {
      ...this.selectedCurrencyData,
      ...currencyData,
    };
    this.onCurrencyChange.emit(currencyData.code);
  }

  handleInputChange(value?: string) {
    const re = /^(\d*|\d+\.\d{0,2})$/;

    value = value ?? this.formControlCurrencyValue.value ?? '';
    value = value.replace(/\s+/g, '');

    if (value.startsWith('.')) {
      value = `0${value}`;
    }

    if (!re.test(value)) {
      this.formControlCurrencyValue.setValue(
        this.selectedCurrencyData.value ?? ''
      );
      return;
    }

    this.onCurrencyValueChange.emit(value);
    value = this.styleCurrencyValue(value);

    this.selectedCurrencyData.value = value;
    this.formControlCurrencyValue.setValue(value);
  }

  handleFavoriteListUpdate(favList: string[]) {
    this.onFavoriteCurrenciesUpdate.emit(favList);
  }

  private styleCurrencyValue(value: string) {
    const GROUP_SIZE = 3;

    const dotIndex = value.indexOf('.');
    const intPart = value.includes('.') ? value.slice(0, dotIndex) : value;
    const floatPart = value.includes('.') ? value.slice(dotIndex) : '';

    const incompleteGroupSize = intPart.length % GROUP_SIZE;

    let styledValue = value.slice(0, incompleteGroupSize);

    for (let i = incompleteGroupSize; i < intPart.length; i += GROUP_SIZE) {
      styledValue = `${styledValue} ${value.slice(i, i + GROUP_SIZE)}`;
    }

    styledValue += floatPart;

    return styledValue;
  }
}
