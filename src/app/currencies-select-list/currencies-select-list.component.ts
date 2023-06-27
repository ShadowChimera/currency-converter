import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostBinding,
  ViewChild,
  OnChanges,
  ElementRef,
  SimpleChanges,
} from '@angular/core';
import {
  CurrencyService,
  CurrenciesData,
  CurrencyData,
} from '../currency.service';
import { PopupService } from '../popup.service';
import { SearchResults } from '../search-result/search-result.component';
import { FormControl } from '@angular/forms';

enum SectionsTitles {
  favorite = 'Favorite',
  all = 'All',
}

@Component({
  selector: 'app-currencies-select-list',
  templateUrl: './currencies-select-list.component.html',
  styleUrls: ['./currencies-select-list.component.scss'],
})
export class CurrenciesSelectListComponent implements OnChanges {
  @Input() @HostBinding('class.visible') isVisible = false;
  @Input() relatedElement: HTMLElement | undefined;
  @Input() favoriteCurrencies: string[] = [];
  @Output() onCurrencySelect = new EventEmitter<CurrencyData>();
  @Output() onFavoriteListUpdate = new EventEmitter<string[]>();
  @Output() onPopupEscape = new EventEmitter();
  @HostBinding('class.first-render') isFirstRender = true;
  @ViewChild('container')
  containerRef: ElementRef<HTMLElement> | undefined;
  @ViewChild('searchInput')
  searchInputRef: ElementRef<HTMLElement> | undefined;
  formControlSearch = new FormControl('');

  currenciesData: CurrenciesData | undefined;
  searchResults: SearchResults | null = null;
  favoriteCurrenciesList: string[] = [];
  listSections: Array<{
    title: SectionsTitles;
    data: CurrenciesData;
  }> = [
    {
      title: SectionsTitles.favorite,
      data: {},
    },
    {
      title: SectionsTitles.all,
      data: {},
    },
  ];

  clearPopupCloseListener: (() => void) | null = null;

  constructor(
    private service: CurrencyService,
    private popupService: PopupService,
    private hostRef: ElementRef
  ) {
    this.loadCurrenciesData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if ('favoriteCurrencies' in changes) {
      this.updateFavorite();
    }

    if ('isVisible' in changes) {
      if (changes['isVisible'].currentValue) {
        this.openSelectList();
      } else {
        this.closeSelectList();
      }
    }
  }

  openSelectList() {
    this.isFirstRender = false;

    if (this.clearPopupCloseListener) {
      this.clearPopupCloseListener();
    }

    this.clearPopupCloseListener = this.popupService.handlePopupClose(
      [this.relatedElement, this.containerRef!.nativeElement],
      () => this.closeSelectList()
    );

    this.doOnToggleAnimationEnd(() =>
      this.searchInputRef?.nativeElement.focus()
    );
  }

  closeSelectList() {
    if (this.clearPopupCloseListener) {
      this.clearPopupCloseListener();
      this.clearPopupCloseListener = null;
    }

    this.onPopupEscape.emit();
    this.clearSearch();
  }

  handleCurrencySelect(currencyCode: string) {
    const currencyData = {
      ...this.currenciesData![currencyCode],
      code: currencyCode,
    };
    this.closeSelectList();
    this.onCurrencySelect.emit(currencyData);
  }

  handleToggleFavorite(currencyCode: string) {
    const favorite = this.listSections.find(
      (section) => section.title === SectionsTitles.favorite
    )!.data;

    if (currencyCode in favorite) {
      delete favorite[currencyCode];
      this.favoriteCurrenciesList = Object.keys(favorite);
      this.onFavoriteListUpdate.emit(this.favoriteCurrenciesList);
      return;
    }

    favorite[currencyCode] = this.currenciesData![currencyCode];
    this.favoriteCurrenciesList.push(currencyCode);
    this.onFavoriteListUpdate.emit(this.favoriteCurrenciesList);
  }

  handleSearchInput(searchValue: string) {
    searchValue = searchValue.trim().toLowerCase();

    if (!searchValue) {
      this.searchResults = null;
      return;
    }

    this.searchResults = Object.fromEntries(
      Object.entries(this.currenciesData!)
        .filter(
          ([currencyCode, currencyData]) =>
            currencyCode.toLowerCase().includes(searchValue) ||
            currencyData.name.toLowerCase().includes(searchValue)
        )
        .map(([currencyCode, currencyData]) => [
          currencyCode,
          {
            ...currencyData,
            codeMatchParts: this.getMatchParts(currencyCode, searchValue),
            nameMatchParts: this.getMatchParts(currencyData.name, searchValue),
          },
        ])
    );
  }

  private clearSearch() {
    this.doOnToggleAnimationEnd(() => {
      this.formControlSearch.setValue('');
      this.searchResults = null;
    });
  }

  private doOnToggleAnimationEnd(action: () => void) {
    const el = this.containerRef?.nativeElement;

    if (!el) {
      action();
      return;
    }

    const animationEndListener = () => {
      action();
      clearListener();
    };

    const clearListener = () =>
      el.removeEventListener('animationend', animationEndListener);

    el.addEventListener('animationend', animationEndListener);
  }

  private getMatchParts(fullString: string, subString: string) {
    const fullStringLC = fullString.toLowerCase();

    if (!fullStringLC.includes(subString)) {
      return { left: fullString, match: '', right: '' };
    }

    const matchIndexStart = fullStringLC.indexOf(subString);
    const matchIndexEnd = matchIndexStart + subString.length;

    return {
      left: fullString.slice(0, matchIndexStart),
      match: fullString.slice(matchIndexStart, matchIndexEnd),
      right: fullString.slice(matchIndexEnd),
    };
  }

  private async updateFavorite() {
    this.favoriteCurrenciesList = [...this.favoriteCurrencies];

    if (!this.currenciesData) {
      await this.loadCurrenciesData();
    }

    this.listSections.find(
      (section) => section.title === SectionsTitles.favorite
    )!.data = Object.fromEntries(
      Object.entries(this.currenciesData!).filter(
        ([currencyCode, currencyData]) =>
          this.favoriteCurrenciesList.includes(currencyCode)
      )
    );
  }

  private async loadCurrenciesData() {
    this.currenciesData = await this.service.getCurrenciesData();
    this.listSections.find(
      (section) => section.title === SectionsTitles.all
    )!.data = { ...this.currenciesData };
  }
}
