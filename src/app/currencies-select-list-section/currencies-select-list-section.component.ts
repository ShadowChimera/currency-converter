import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CurrenciesData } from '../currency.service';
import { SearchResults } from '../search-result/search-result.component';

@Component({
  selector: 'app-currencies-select-list-section',
  templateUrl: './currencies-select-list-section.component.html',
  styleUrls: ['./currencies-select-list-section.component.scss'],
})
export class CurrenciesSelectListSectionComponent implements OnChanges {
  @Input() title: string | undefined;
  @Input() items: SearchResults | undefined;
  @Input() favoriteItems: string[] = [];
  @Output() onItemClick = new EventEmitter<string>();
  @Output() onFavoriteToggle = new EventEmitter<string>();

  constructor() {}

  ngOnChanges(changes: SimpleChanges) {}

  handleItemClick(currencyCode: string) {
    this.onItemClick.emit(currencyCode);
  }

  handleFavoriteToggle(currencyCode: string) {
    this.onFavoriteToggle.emit(currencyCode);
  }
}
