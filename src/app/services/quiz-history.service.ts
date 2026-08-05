export interface QuizResult {
  category: string;
  icon: string;
  money: number;
  difficulty: string;
  questions: number;
  date: string;
  time: string;
}


import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class QuizHistoryService {

  private history: QuizResult[] = [];


  addResult(result: QuizResult) {
    console.log('Adding result to history:', result);
    this.history.unshift(result);
  }


  getHistory(): QuizResult[] {
    return this.history;
  }

}