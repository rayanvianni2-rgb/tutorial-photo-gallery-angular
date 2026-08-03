import { Component, OnDestroy, OnInit } from '@angular/core';

type QuizCategory = 'Football' | 'Histoire' | 'WWE' | 'Mélange' | 'Informatique' | 'Acteurs' | 'DBZ Sagas' | 'Minecraft' | 'Roblox';
type Difficulty = 'facile' | 'moyen' | 'difficile' | 'expert';

interface QuizQuestion {
  id: string;
  category: string;
  difficulty: string;
  question: string;
  answers: string[];
  correctAnswer: number;
  explanation?: string;
}

interface QuizData {
  questions: QuizQuestion[];
}

interface CategoryCard {
  name: QuizCategory;
  icon: string;
  color: string;
  description: string;
}

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page implements OnInit, OnDestroy {

  readonly categories: CategoryCard[] = [
    {
      name: 'Football',
      icon: 'football',
      color: 'football',
      description: 'Stades, joueurs et records'
    },
    {
      name: 'Histoire',
      icon: 'library',
      color: 'history',
      description: 'Époques et civilisations'
    },
    {
      name: 'WWE',
      icon: 'flash',
      color: 'wwe',
      description: 'Superstars et grands matchs'
    },
    {
      name: 'Mélange',
      icon: 'color-wand',
      color: 'mixed',
      description: 'Un peu de tout'
    },
    {
      name: 'Informatique',
      icon: 'code-slash',
      color: 'tech',
      description: 'Web, code et numérique'
    },
    {
      name: 'Acteurs',
      icon: 'videocam',
      color: 'movies',
      description: 'Cinéma et acteurs célèbres'
    },
    {
      name: 'DBZ Sagas',
      icon: 'flame',
      color: 'dbz',
      description: 'Dragon Ball Z et ses sagas'
    },
    {
      name: 'Minecraft',
      icon: 'cube',
      color: 'minecraft',
      description: 'Blocs, mobs et aventures'
    },
    {
      name: 'Roblox',
      icon: 'game-controller',
      color: 'roblox',
      description: 'Expériences, créateurs et gameplay'
    }
  ];

  readonly difficulties: { name: Difficulty; label: string; color: string; icon: string }[] = [
    { name: 'facile', label: 'Facile', color: 'easy', icon: 'leaf' },
    { name: 'moyen', label: 'Moyen', color: 'medium', icon: 'flame' },
    { name: 'difficile', label: 'Difficile', color: 'hard', icon: 'thunderstorm' },
    { name: 'expert', label: 'Expert', color: 'expert', icon: 'diamond' },
  ];

  questions: QuizQuestion[] = [];
  isLoading = true;
  loadingError = false;
  isDifficultySheetOpen = false;
  selectedCategory: QuizCategory | null = null;
  selectedDifficulty: Difficulty | null = null;
  isPlaying = false;
  isFinished = false;
  roundQuestions: QuizQuestion[] = [];
  currentQuestionIndex = 0;
  score = 0;
  timeLeft = 15;
  selectedAnswer: number | null = null;
  answered = false;
  feedback = '';

  private timer?: ReturnType<typeof setInterval>;
  private nextQuestionTimeout?: ReturnType<typeof setTimeout>;

  async ngOnInit(): Promise<void> {
    try {

      const response =
        await fetch('assets/data/quiz-questions.json');


      if (!response.ok) {
        throw new Error();
      }


      const data =
        await response.json() as QuizData;

      this.questions = data.questions
    } catch(error) {
      this.loadingError = true;
    }
    finally {

      this.isLoading = false;

    }

  }

  ngOnDestroy(): void {
    this.stopTimer();
    this.clearNextQuestionTimeout();
  }

  get activeQuestion(): QuizQuestion | null {
    return this.roundQuestions[this.currentQuestionIndex] ?? null;
  }

  get progress(): number {
    if (!this.roundQuestions.length) {
      return 0;
    }
    return ((this.currentQuestionIndex + 1) / this.roundQuestions.length) * 100;
  }

  openDifficultySheet(category: QuizCategory): void {
    if (this.isLoading || this.loadingError) {
      return;
    }
    this.selectedCategory = category;
    this.isDifficultySheetOpen = true;
  }

  closeDifficultySheet(): void {
    this.isDifficultySheetOpen = false;
  }

  startQuiz(difficulty: Difficulty): void {

    if (!this.selectedCategory) {
      return;
    }


    const selectedQuestions = this.questions.filter((q) => {

      return (
        q.category === this.selectedCategory &&
        q.difficulty === difficulty
      );

    });

    if (selectedQuestions.length === 0) {
      return;
    }


    this.selectedDifficulty = difficulty;


    // Mélange et prend 10 questions
    this.roundQuestions =
    this.shuffle(selectedQuestions)
      .slice(0, 10)
      .map(question => this.shuffleAnswers(question));


    this.currentQuestionIndex = 0;
    this.score = 0;

    this.selectedAnswer = null;
    this.answered = false;
    this.feedback = "";


    this.isDifficultySheetOpen = false;
    this.isPlaying = true;
    this.isFinished = false;


    this.prepareQuestion();

  }

  chooseAnswer(answerIndex: number): void {
    const question = this.activeQuestion;
    if (!question || this.answered) {
      return;
    }

    this.selectedAnswer = answerIndex;
    this.answered = true;
    this.stopTimer();

    if (answerIndex === question.correctAnswer) {
      this.score++;
      this.feedback = question.explanation ? 'Bonne réponse ! ' + question.explanation : 'Bonne réponse !';
    } else {
      this.feedback = 'La bonne réponse était : ' + question.answers[question.correctAnswer] + '.';
    }
    this.scheduleNextQuestion();
  }

  answerClass(answerIndex: number): string {
    const question = this.activeQuestion;
    if (!this.answered || !question) {
      return '';
    }
    if (answerIndex === question.correctAnswer) {
      return 'is-correct';
    }
    if (answerIndex === this.selectedAnswer) {
      return 'is-wrong';
    }
    return 'is-muted';
  }

  restartQuiz(): void {
    this.stopTimer();
    this.clearNextQuestionTimeout();
    this.isFinished = false;
    this.isPlaying = false;
    this.selectedCategory = null;
    this.selectedDifficulty = null;
    this.roundQuestions = [];
    this.selectedAnswer = null;
    this.answered = false;
    this.feedback = '';
  }

  private prepareQuestion(): void {
    this.clearNextQuestionTimeout();
    this.selectedAnswer = null;
    this.answered = false;
    this.feedback = '';
    this.startTimer();
  }

  private startTimer(): void {
    this.stopTimer();
    this.timeLeft = 15;
    this.timer = setInterval(() => {
      if (this.timeLeft > 1) {
        this.timeLeft--;
        return;
      }
      this.timeLeft = 0;
      this.timeExpired();
    }, 1000);
  }

  private timeExpired(): void {
    const question = this.activeQuestion;
    if (!question || this.answered) {
      return;
    }
    this.answered = true;
    this.stopTimer();
    this.feedback = 'Temps écoulé ! La bonne réponse était : ' + question.answers[question.correctAnswer] + '.';
    this.scheduleNextQuestion();
  }

  private scheduleNextQuestion(): void {
    this.clearNextQuestionTimeout();
    this.nextQuestionTimeout = setTimeout(() => this.nextQuestion(), 1600);
  }

  private nextQuestion(): void {
    if (this.currentQuestionIndex < this.roundQuestions.length - 1) {
      this.currentQuestionIndex++;
      this.prepareQuestion();
      return;
    }
    this.isPlaying = false;
    this.isFinished = true;
    this.stopTimer();
  }

  private stopTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  private clearNextQuestionTimeout(): void {
    if (this.nextQuestionTimeout) {
      clearTimeout(this.nextQuestionTimeout);
      this.nextQuestionTimeout = undefined;
    }
  }

  private shuffle<T>(array: T[]): T[] {
    const result = [...array];

    for (let index = result.length - 1; index > 0; index--) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [result[index], result[randomIndex]] = [
        result[randomIndex],
        result[index]
      ];
    }

    return result;
  }

  private buildTenQuestionRound(questions: QuizQuestion[]): QuizQuestion[] {
    const round = this.shuffle(questions).slice(0, 10);
    let previousQuestionId = '';

    if (round.length) {
      previousQuestionId = round[round.length - 1].id;
    }

    while (round.length < 10) {
      const availableQuestions = questions.filter((question) => question.id !== previousQuestionId);
      const source = this.shuffle(availableQuestions.length ? availableQuestions : questions)[0];

      round.push({
        ...source,
        id: source.id + '-round-' + (round.length + 1),
      });
      previousQuestionId = source.id;
    }

    return round;
  }

  getQuestionsByDifficulty(category: QuizCategory, difficulty: Difficulty): QuizQuestion[] {
    return this.questions
      .filter((question) =>
        question.category === category &&
        (question.difficulty === difficulty ||
        question.difficulty === 'all')
      )
      .slice(0, 10);
  }

  private shuffleAnswers(question: QuizQuestion): QuizQuestion {
    const answersWithIndex = question.answers.map((answer, index) => ({
      answer,
      index
    }));

    const shuffledAnswers = this.shuffle(answersWithIndex);

    return {
      ...question,
      answers: shuffledAnswers.map(item => item.answer),
      correctAnswer: shuffledAnswers.findIndex(
        item => item.index === question.correctAnswer
      )
    };
  }
}
