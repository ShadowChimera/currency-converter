import { Component, Input } from '@angular/core';
import { CurrencyData } from '../currency.service';

export interface MatchParts {
  left: string;
  match: string;
  right: string;
}

export interface SearchResult extends CurrencyData {
  codeMatchParts?: MatchParts;
  nameMatchParts?: MatchParts;
}

export interface SearchResults {
  [code: string]: SearchResult;
}

@Component({
  selector: 'app-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.scss'],
})
export class SearchResultComponent {
  @Input() match!: MatchParts;
}
