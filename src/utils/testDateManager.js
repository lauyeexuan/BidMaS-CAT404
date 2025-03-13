import { Timestamp } from 'firebase/firestore';

class TestDateManager {
  constructor() {
    this._testDate = null;
    // Initialize from localStorage on creation
    const storedDate = localStorage.getItem('bidmas_test_date');
    if (storedDate) {
      this._testDate = new Date(storedDate);
    }
  }

  getTestDate() {
    // If we have a cached value, use it, otherwise check localStorage
    if (this._testDate) return this._testDate;
    
    const storedDate = localStorage.getItem('bidmas_test_date');
    if (storedDate) {
      this._testDate = new Date(storedDate);
      return this._testDate;
    }
    return null;
  }

  setTestDate(date) {
    this._testDate = date;
    // No need to update localStorage here as the component will do it
  }

  getCurrentTime() {
    const testDate = this.getTestDate();
    return testDate ? Timestamp.fromDate(testDate) : Timestamp.now();
  }
}

export const testDateManager = new TestDateManager(); 