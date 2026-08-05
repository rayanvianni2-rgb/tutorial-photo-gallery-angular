import { Injectable } from '@angular/core';

export interface QuizHistory {
  category: string;
  difficulty: string;
  money: number;
  date: string;
}

@Injectable({
  providedIn: 'root'
})
export class QuizHistoryService {

  private history: QuizHistory[] = [];

  constructor() {
    const saved = localStorage.getItem('quizHistory');

    if (saved) {
      this.history = JSON.parse(saved);
    }
  }

  addQuiz(result: QuizHistory) {
    console.log('Quiz ajouté :', result);

    this.history.unshift(result);

    localStorage.setItem(
      'quizHistory',
      JSON.stringify(this.history)
    );

    console.log(
      'LocalStorage :',
      localStorage.getItem('quizHistory')
    );
  }

  getHistory(): QuizHistory[] {
    return this.history;
  }

  clearHistory() {
    this.history = [];
    localStorage.removeItem('quizHistory');
  }
}