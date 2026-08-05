import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { QuizHistoryService, QuizResult } from '../services/quiz-history.service';


@Component({
  selector: 'app-tab3',
  templateUrl: './tab3.page.html',
  styleUrls: ['./tab3.page.scss'],
  standalone: false,
})
export class Tab3Page {


  history: QuizResult[] = [];


  constructor(
    private historyService: QuizHistoryService
  ) {}

  get totalMoney(): number {
    return this.history.reduce(
      (total, quiz) => total + quiz.money,
      0
    );
  }

  get bestMoney(): number {
    if(this.history.length === 0){
      return 0;
    }
    return Math.max(
      ...this.history.map(
        quiz => quiz.money
      )
    );
  }

  get averageMoney(): number {
    if(this.history.length === 0){
      return 0;
    }
    return Math.round(
      this.totalMoney / this.history.length
    );
  }

  ionViewWillEnter(){
    this.history = this.historyService.getHistory();
    console.log(this.history);
  }
}