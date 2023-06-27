import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CurrencyService, ConversionData } from '../currency.service';
import { CookieService } from 'ngx-cookie';

const NO_CONVERSION_DATA_MESSAGE = 'No conversion data';

export interface CurrencyInputData {
  code: string;
  value: string;
  conversionInfo: string;
}

const DEFAULT_CURRENCIES = ['UAH', 'USD'];
enum CookiesKeys {
  favoriteCurrencies = 'favoriteCurrencies',
}

@Component({
  selector: 'app-currency-converter',
  templateUrl: './currency-converter.component.html',
  styleUrls: ['./currency-converter.component.scss'],
})
export class CurrencyConverterComponent implements OnChanges {
  @Input() currencyService!: CurrencyService;

  currencyInputsData: CurrencyInputData[] = [
    {
      code: DEFAULT_CURRENCIES[0],
      value: '',
      conversionInfo: NO_CONVERSION_DATA_MESSAGE,
    },
    {
      code: DEFAULT_CURRENCIES[1],
      value: '',
      conversionInfo: NO_CONVERSION_DATA_MESSAGE,
    },
  ];

  favoriteCurrencies: string[] = [];

  conversionData: ConversionData | undefined;

  constructor(private cookieService: CookieService) {
    this.favoriteCurrencies = JSON.parse(
      cookieService.get(CookiesKeys.favoriteCurrencies) ?? '[]'
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('currencyService' in changes) {
      this.updateConversionData();
    }
  }

  async handleCurrencyChange(currencyCode: string, srcInputIndex: number) {
    const srcInput = this.currencyInputsData[srcInputIndex];
    const prevCode = srcInput.code;
    srcInput.code = currencyCode;

    const rcvInputIndex = srcInputIndex === 0 ? 1 : 0;
    const rcvInput = this.currencyInputsData[rcvInputIndex];

    if (rcvInput.code === srcInput.code) {
      rcvInput.code = prevCode;
    }

    await this.updateConversionData();
    this.handleCurrencyValueChange(this.currencyInputsData[0].value, 0, true);
  }

  async handleCurrencyValueChange(
    currencyValue: string,
    srcInputIndex: number,
    currencyChanged = false
  ) {
    const srcInput = this.currencyInputsData[srcInputIndex];

    if (!currencyChanged && srcInput.value === currencyValue) {
      return;
    }

    srcInput.value = currencyValue;

    const rcvInputIndex = srcInputIndex === 0 ? 1 : 0;
    const rcvInput = this.currencyInputsData[rcvInputIndex];
    rcvInput.value = srcInput.value.length
      ? this.convert(
          { code: srcInput.code, value: srcInput.value },
          { code: rcvInput.code }
        )
      : '';
  }

  private convert(from: { code: string; value: string }, to: { code: string }) {
    if (!this.conversionData) {
      return '';
    }

    const rate =
      this.conversionData.base === from.code
        ? this.conversionData.rates[to.code]
        : 1.0 / this.conversionData.rates[from.code];

    const fromValue = Number.parseFloat(from.value);

    let convertedValue = (fromValue * rate).toFixed(2);

    if (convertedValue.endsWith('.00')) {
      convertedValue = convertedValue.slice(0, -3);
    }

    return convertedValue;
  }

  private async updateConversionData() {
    const curBase = this.currencyInputsData[0].code;
    const curTo = this.currencyInputsData[1].code;

    this.conversionData = await this.currencyService.getConversionData(
      curBase,
      curTo
    );

    if (!this.conversionData || !(curTo in this.conversionData.rates)) {
      this.currencyInputsData[0].conversionInfo = NO_CONVERSION_DATA_MESSAGE;
      this.currencyInputsData[1].conversionInfo = NO_CONVERSION_DATA_MESSAGE;
      return;
    }

    const invertedData = await this.currencyService.getConversionData(
      curTo,
      curBase
    );

    this.currencyInputsData[0].conversionInfo = `1 ${curBase} = ${this.conversionData.rates[curTo]} ${curTo}`;
    this.currencyInputsData[1].conversionInfo = `1 ${curTo} = ${invertedData.rates[curBase]} ${curBase}`;
  }

  handleSwapCurrency() {
    [this.currencyInputsData[0], this.currencyInputsData[1]] = [
      this.currencyInputsData[1],
      this.currencyInputsData[0],
    ];
  }

  handleFavoriteCurrenciesUpdate(newFavoriteCurrencies: string[]) {
    this.favoriteCurrencies = [...newFavoriteCurrencies];

    const cookieExpireDate = new Date();
    cookieExpireDate.setFullYear(cookieExpireDate.getFullYear() + 1);

    this.cookieService.put(
      CookiesKeys.favoriteCurrencies,
      JSON.stringify(this.favoriteCurrencies),
      { expires: cookieExpireDate }
    );
  }
}
