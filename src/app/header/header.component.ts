import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import {
  CurrencyService,
  CurrenciesData,
  ConversionData,
} from '../currency.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnChanges {
  @Input() currencyService!: CurrencyService;

  CONVERT_FROM_CURRENCY = 'UAH';
  CONVERT_TO_CURRENCIES = ['USD', 'EUR'];
  conversionData: ConversionData | undefined;
  currenciesData: CurrenciesData | undefined;

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if ('currencyService' in changes) {
      this.loadConversionData();
      this.loadCurrenciesData();
    }
  }

  async loadConversionData() {
    this.conversionData = await this.currencyService.getConversionData(
      this.CONVERT_FROM_CURRENCY,
      this.CONVERT_TO_CURRENCIES
    );

    const rates = this.conversionData.rates;
    for (let currency of this.CONVERT_TO_CURRENCIES) {
      rates[currency] = Number.parseFloat((1.0 / rates[currency]).toFixed(2));
    }
  }

  async loadCurrenciesData() {
    this.currenciesData = await this.currencyService.getCurrencyData(
      this.CONVERT_FROM_CURRENCY,
      ...this.CONVERT_TO_CURRENCIES
    );
  }
}
