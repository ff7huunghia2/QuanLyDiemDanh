import { Component, OnInit,HostListener,OnDestroy } from '@angular/core';
import { LocalStorageService } from 'angular-2-local-storage';
import { Router } from '@angular/router';
import { StudentService, AppService, CourseService,AuthService,QuizService,SocketService } from '../../shared.module';
declare var jQuery:any;
@Component({
  selector: 'app-quiz-display',
  templateUrl: './quiz-display.component.html'
})
export class QuizDisplayComponent implements OnInit,OnDestroy {
	public quiz = {
        id: 0,
        code: '',
        is_randomize_questions: true,
        is_randomize_answers: true,
        type: 0,
        title: '',
        participants: [],
        questions: [{
            text: '',
            option_a: '',
            option_b: '',
            option_c: '',
            option_d: '',
            correct_option: null,
            timer: 10,
            answers: []
        }]
    };
	public quiz_code = null;
	public get_published_quiz_error;
	public is_started = false;
	public is_ended = false;
	public is_ready = false;
	public current_question_index = 0;
	public current_question = {};
	public current_question_timer = 0;
	public ready = 0;
	public ready_progress = 0;
	public interval;
	public ready_time = 5;

	@HostListener('window:unload', ['$event'])
	public onWindowUnload(event: Event) {
		if(this.quiz_code){
    		this.quizService.stopQuiz(this.quiz_code).subscribe(result=>{

			},error=>{this.appService.showPNotify('failure',"Server Error! Can't get quiz detail",'error');});
    	}
	}
	@HostListener('window:beforeunload', ['$event'])
	public onWindowBeforeUnload(event: Event) {
		return false;
	}

	public constructor(public  localStorage: LocalStorageService,public  router: Router,public quizService: QuizService,
		public appService: AppService,public socketService: SocketService) {
		socketService.consumeEventOnJoinedQuiz();
        socketService.invokeJoinedQuiz.subscribe(result => {
            if (this.quiz_code == result['quiz_code']) {
                this.getQuiz();
            }
        });
	}
	public ngOnInit() {
		if(this.localStorage.get('get_published_quiz_error')){
			this.get_published_quiz_error = this.localStorage.get('get_published_quiz_error');
		}
		else{
			if(!this.localStorage.get('quiz_code')){
				this.get_published_quiz_error = 'Quiz is stopped';
			}else{
				this.quiz_code = this.localStorage.get('quiz_code').toString();
				this.localStorage.remove('quiz_code');
				this.getQuiz();
			}
		}
	}
	public closeSocket(){
		this.socketService.stopEventOnJoinedQuiz();
		this.socketService.stopEventOnAnsweredQuiz();
	}
	public ngOnDestroy(){
		this.socketService.emitEventOnQuizStopped({'quiz_code':this.quiz_code});
		this.closeSocket();
	}
	
	public getQuiz(){
		this.quizService.getPublishedQuiz(this.quiz_code).subscribe(result=>{
			if(result.result == 'success'){
				this.quiz = result.quiz;
			}
			else{
				this.appService.showPNotify('failure',result.message,'error');
			}
		},error=>{this.appService.showPNotify('failure',"Server Error! Can't get quiz detail",'error');});
	}
	public onStartQuestion(){
		this.interval = setInterval(() => {
			this.quiz['questions'][this.current_question_index]['timer']--;
			if(this.quiz['questions'][this.current_question_index]['timer'] == 0){
				this.socketService.emitEventOnQuizQuestionEnded({'quiz_code': this.quiz_code});
				clearInterval(this.interval);
				this.current_question_index++;
				this.onReadyForNextQuestion(this.current_question_index);
			}
		}, 1000);
	}
	public onReadyForNextQuestion(next_question_index){
		if(next_question_index == this.quiz['questions'].length){
			this.is_ended = true;
			this.is_ready = this.is_started = false;
			this.socketService.emitEventOnQuizEnded({'quiz_code': this.quiz_code});
			this.closeSocket();
			return;
		}
		this.socketService.emitEventOnQuizQuestionReady({'quiz_code': this.quiz_code});
		this.is_started = false;
		this.is_ready = true;
		this.ready = 0;
		this.ready_progress = 0;
		this.interval = setInterval(() => {
			this.ready++;
			if(this.ready > this.ready_time){
				clearInterval(this.interval);
				this.is_started = true;
				this.is_ready = false;
				this.current_question_index = next_question_index;
				this.socketService.emitEventOnQuizQuestionLoaded({'quiz_code': this.quiz_code,'question_index': this.current_question_index});
				this.onStartQuestion();
			}
			this.ready_progress = this.ready * 20;
		}, 1000);
	}
	public onStartQuiz(){
		this.quizService.startQuiz(this.quiz_code).subscribe(result=>{
			if(result.result == 'success'){
				this.socketService.consumeEventOnAnsweredQuiz();
			    this.socketService.invokeAnsweredQuiz.subscribe(result => {
			        if (this.quiz_code == result['quiz_code']) {
			        	var question_index = result['question_index'];
			        	for(var i = 0 ; i < this.quiz['participants']['length'];i++){
			        		if(result['student_id'] == this.quiz['participants'][i]['id']){
			        			this.quiz['questions'][question_index]['answers'].push({
					        		answered_by : result['student_id'],
					        		answered_at : new Date(),
					        		selected_option : result['option'].toUpperCase(),
					        		name : this.quiz['participants'][i]['name'],
					        		code : this.quiz['participants'][i]['code']
					        	});
					        	break;
			        		}
			        	}
			            if(this.quiz['participants'].length == this.quiz['questions'][question_index]['answers'].length){
							this.socketService.emitEventOnQuizQuestionEnded({'quiz_code': this.quiz_code});
							clearInterval(this.interval);
							this.current_question_index++;
							this.onReadyForNextQuestion(this.current_question_index);
						}
			        }
			    });
		        this.onReadyForNextQuestion(this.current_question_index);
			}else{
				this.appService.showPNotify('failure',result.message,'error');
			}
		},error=>{this.appService.showPNotify('failure',"Server Error! Can't start quiz",'error');});
	}

	public onNextQuestion(){
		clearInterval(this.interval);
		this.onReadyForNextQuestion(this.current_question_index++);
	}
	public onStopQuiz(){
		this.quizService.stopQuiz(this.quiz_code).subscribe(result=>{
			clearInterval(this.interval);
			this.get_published_quiz_error = 'Quiz is stopped';
			this.socketService.emitEventOnQuizStopped({'quiz_code':this.quiz_code});
			this.closeSocket();
		},error=>{this.appService.showPNotify('failure',"Server Error! Can't get quiz detail",'error');});
	}
}