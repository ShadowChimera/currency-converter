import { Component, Input } from '@angular/core';

const BASE_CLASS_NAME = 'currency-flag';

@Component({
  selector: 'app-currency-flag',
  templateUrl: './currency-flag.component.html',
  styleUrls: ['./currency-flag.component.scss'],
})
export class CurrencyFlagComponent {
  @Input() currencyCode: string = '';
  @Input() flagClassName: string = '';
}
