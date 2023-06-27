import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AngularSvgIconModule } from 'angular-svg-icon';

import { PopupService } from './popup.service';
import { CurrencyService } from './currency.service';
import { CookieModule } from 'ngx-cookie';

import { AppComponent } from './app.component';
import { CurrencyConverterComponent } from './currency-converter/currency-converter.component';
import { CurrencyInputComponent } from './currency-input/currency-input.component';
import { CurrencyFlagComponent } from './currency-flag/currency-flag.component';
import { HeaderComponent } from './header/header.component';
import { LoadingIconComponent } from './loading-icon/loading-icon.component';
import { CurrenciesSelectListComponent } from './currencies-select-list/currencies-select-list.component';
import { CurrenciesSelectListSectionComponent } from './currencies-select-list-section/currencies-select-list-section.component';
import { SearchResultComponent } from './search-result/search-result.component';

@NgModule({
  declarations: [
    AppComponent,
    CurrencyConverterComponent,
    CurrencyInputComponent,
    CurrencyFlagComponent,
    HeaderComponent,
    LoadingIconComponent,
    CurrenciesSelectListComponent,
    CurrenciesSelectListSectionComponent,
    SearchResultComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AngularSvgIconModule.forRoot(),
    CookieModule.withOptions(),
  ],
  providers: [CurrencyService, PopupService],
  bootstrap: [AppComponent],
})
export class AppModule {}
