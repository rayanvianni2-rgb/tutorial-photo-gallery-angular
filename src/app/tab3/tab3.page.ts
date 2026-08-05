import { Component } from '@angular/core';
import { QuizHistoryService, QuizHistory } from '../services/quiz-history.service';

@Component({
  selector: 'app-tab3',
  templateUrl: './tab3.page.html',
  styleUrls: ['./tab3.page.scss'],
  standalone: false
})
export class Tab3Page {

  history: QuizHistory[] = [];

  constructor(
    private quizHistory: QuizHistoryService
  ) {}

  ionViewWillEnter() {
    this.history = this.quizHistory.getHistory();

    console.log('Historique Tab3 :', this.history);
  }

}