import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

import { Observable, throwError, lastValueFrom } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

export interface CurrencyData {
  symbol: string;
  name: string;
  symbol_native: string;
  decimal_digits: number;
  rounding: number;
  code: string;
  name_plural: string;
}

export interface CurrenciesData {
  [currencyCode: string]: CurrencyData;
}

export interface ConversionData {
  base: string;
  rates: {
    [currencyCode: string]: number;
  };
  loadedFromApi?: boolean;
  [rest: string]: any;
}

interface FullConversionData {
  [currencyCode: string]: ConversionData;
}

interface CurrencyAPI {
  data: {
    [code: string]: {
      code: string;
      value: number;
    };
  };
  [rest: string]: any;
}

const fakeConversionAPI = (fromCurrency: string) => {
  const conversionData: FullConversionData = {
    UAH: {
      base: 'UAH',
      rates: {
        USD: 0.02729,
        EUR: 0.0248,
      },
    },
    USD: {
      base: 'USD',
      rates: {
        UAH: 36.65,
        EUR: 0.90898,
      },
    },
    EUR: {
      base: 'EUR',
      rates: {
        USD: 1.10014,
        UAH: 40.32,
      },
    },
  };

  return conversionData[fromCurrency];
};

@Injectable()
export class CurrencyService {
  apiKey = '8JUrAmxZwdBVwX5rXPpl6veXjkiXSPCJ7pVseRkb';
  currenciesDataUrl = 'assets/data/currencies-data.json';
  conversionDataUrl = 'https://api.currencyapi.com/v3/latest?base_currency=';

  currenciesData: CurrenciesData | undefined;
  conversionData: FullConversionData = {};

  constructor(private http: HttpClient) {}

  async loadConversionData(base: string) {
    if (
      base in this.conversionData &&
      this.conversionData[base].loadedFromApi
    ) {
      return;
    }

    // const apiData = fakeConversionAPI(base);
    // this.conversionData[base] = apiData;

    const source = this.http
      .get<CurrencyAPI>(`${this.conversionDataUrl}${base.toUpperCase()}`, {
        headers: { apikey: this.apiKey },
      })
      .pipe(retry(3), catchError(this.handleError));

    const apiData = await lastValueFrom(source);

    const rates = Object.fromEntries(
      Object.entries(apiData.data).map(([code, data]) => [code, data.value])
    );

    this.conversionData[base] = {
      base,
      rates,
    };

    this.conversionData[base].loadedFromApi = true;

    for (let [currency, rate] of Object.entries(rates)) {
      const data = this.conversionData[currency] ?? {
        base: currency,
        rates: {},
      };

      if (data.loadedFromApi) {
        continue;
      }

      data.rates[base] = Number.parseFloat((1.0 / rate).toFixed(5));
      this.conversionData[currency] = data;
    }
  }

  async getConversionData(
    baseCurrency: string,
    toCurrencies: string[] | string
  ) {
    if (!Array.isArray(toCurrencies)) {
      toCurrencies = [toCurrencies];
    }

    if (
      !(baseCurrency in this.conversionData) ||
      !toCurrencies.every(
        (toCurrency) => toCurrency in this.conversionData[baseCurrency].rates
      )
    ) {
      await this.loadConversionData(baseCurrency);
    }

    const data: ConversionData = {
      base: baseCurrency,
      rates: {},
    };

    for (let toCurrency of toCurrencies) {
      data.rates[toCurrency] =
        this.conversionData[baseCurrency].rates[toCurrency];
    }

    return data;
  }

  async getCurrencyData(...currenciesCodes: string[]) {
    await this.getCurrenciesData();

    const currenciesData: CurrenciesData = {};
    for (let currencyCode of currenciesCodes) {
      currenciesData[currencyCode] = this.currenciesData![currencyCode];
    }

    return currenciesData;
  }

  async getCurrenciesData() {
    if (!this.currenciesData) {
      const source = this.http
        .get<CurrenciesData>(this.currenciesDataUrl)
        .pipe(retry(3), catchError(this.handleError));

      this.currenciesData = await lastValueFrom(source);
    }

    return this.currenciesData;
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      console.error('An error occurred:', error.error);
    } else {
      console.error(
        `Backend returned code ${error.status}, body was: `,
        error.error
      );
    }
    return throwError(
      () => new Error('Something bad happened; please try again later.')
    );
  }
}
