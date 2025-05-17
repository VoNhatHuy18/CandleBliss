export interface ViewHistory {
   productId: number;
   viewCount: number;
   lastViewed: number; // timestamp
}

export interface SearchHistory {
   term: string;
   count: number;
   lastSearched: number; // timestamp
}

class HybridCache {
   private viewHistory: ViewHistory[] = [];
   private searchHistory: SearchHistory[] = [];
   private isInitialized: boolean = false;

   constructor() {
      // Khởi tạo cache từ localStorage khi component được tạo
      if (typeof window !== 'undefined') {
         this.loadFromLocalStorage();
         this.isInitialized = true;
      }
   }

   private ensureInitialized(): void {
      if (!this.isInitialized && typeof window !== 'undefined') {
         this.loadFromLocalStorage();
         this.isInitialized = true;
      }
   }

   private loadFromLocalStorage(): void {
      try {
         // Tải lịch sử xem
         const viewHistoryStr = localStorage.getItem('viewHistory');
         if (viewHistoryStr) {
            this.viewHistory = JSON.parse(viewHistoryStr);
         }

         // Tải lịch sử tìm kiếm
         const searchHistoryStr = localStorage.getItem('searchHistory');
         if (searchHistoryStr) {
            this.searchHistory = JSON.parse(searchHistoryStr);
         }
      } catch (error) {
         console.error('Failed to load cache from localStorage:', error);
         // Khởi tạo mảng trống nếu có lỗi
         this.viewHistory = [];
         this.searchHistory = [];
      }
   }

   private saveToLocalStorage(): void {
      try {
         localStorage.setItem('viewHistory', JSON.stringify(this.viewHistory));
         localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
      } catch (error) {
         console.error('Failed to save cache to localStorage:', error);
      }
   }

   saveProductView(productId: number): void {
      this.ensureInitialized();

      const existingView = this.viewHistory.find((v) => v.productId === productId);

      if (existingView) {
         existingView.viewCount++;
         existingView.lastViewed = Date.now();
      } else {
         this.viewHistory.push({
            productId: productId,
            viewCount: 1,
            lastViewed: Date.now(),
         });
      }

      this.viewHistory = this.viewHistory.sort((a, b) => b.lastViewed - a.lastViewed).slice(0, 50);

      this.saveToLocalStorage();
   }

   saveSearchTerm(term: string): void {
      this.ensureInitialized();

      if (!term.trim()) return;

      const existingSearch = this.searchHistory.find(
         (s) => s.term.toLowerCase() === term.toLowerCase(),
      );

      if (existingSearch) {
         existingSearch.count++;
         existingSearch.lastSearched = Date.now();
      } else {
         this.searchHistory.push({
            term: term,
            count: 1,
            lastSearched: Date.now(),
         });
      }

      this.searchHistory = this.searchHistory
         .sort((a, b) => b.lastSearched - a.lastSearched)
         .slice(0, 20);

      this.saveToLocalStorage();
   }

   getViewHistory(): ViewHistory[] {
      this.ensureInitialized();
      return this.viewHistory;
   }

   getSearchHistory(): SearchHistory[] {
      this.ensureInitialized();
      return this.searchHistory;
   }

   clearHistory(type?: 'view' | 'search'): void {
      this.ensureInitialized();

      if (!type || type === 'view') {
         this.viewHistory = [];
         localStorage.removeItem('viewHistory');
      }

      if (!type || type === 'search') {
         this.searchHistory = [];
         localStorage.removeItem('searchHistory');
      }
   }
}

export const hybridCache = new HybridCache();
