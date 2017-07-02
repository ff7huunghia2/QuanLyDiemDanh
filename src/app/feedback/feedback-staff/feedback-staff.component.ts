import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AppService, FeedbackService } from '../../shared/shared.module';
declare var jQuery:any;
@Component({
    selector: 'app-feedback-staff',
    templateUrl: './feedback-staff.component.html'
})
export class FeedbackStaffComponent implements OnInit {
    
    public constructor(public  appService: AppService,public  feebackService: FeedbackService) {

    }
    public getFeedbacks(){
        this.feebackService.getFeedbacks(this.search_text,this.selected_role,this.pageNumber, this.itemsPerPage).subscribe(result=>{
            this.feedbacks = result.feedbacks;
            this.totalItems = result.total_items;
        },error=>{this.appService.showPNotify('failure', "Server Error! Can't get feedbacks", 'error');});
    }
    public ngOnInit() {
        this.getFeedbacks();
    }
    public feedbacks =[];
    public roles = [
        {
            id: 0,
            name: 'All'
        },
        {
            id: 1,
            name: 'Student' 
        },
        {
            id: 2,
            name: 'Teacher'
        },
        {
            id: 3,
            name: 'Anonymous'
        },
    ];

    public search_text = '';
    public selected_role = 0;
    public selected_feedback;
    public feedback_title = '';
    public feedback_content = '';
    public pageNumber: number = 1;
    public limit: number = 15;
    public currentPage: number = 1;
    public totalItems: number = 0;
    public itemsPerPage: number = 10;
     public onPageChanged(event: any) {
        this.pageNumber = event.page;
        this.getFeedbacks();
    }
    public onChangeRole(){
        this.getFeedbacks();
    }
    public onClickFeedback(index){
        this.selected_feedback = index;
        this.feedback_content = this.feedbacks[index].content;
        this.feedback_title = this.feedbacks[index].title;
        this.feebackService.readFeedbacks(this.feedbacks[index].id).subscribe(result=>{
            this.getFeedbacks();
            jQuery('#feedbackDetailModal').modal('show');
        },error=>{this.appService.showPNotify('failure', "Server Error! Can't read feedbacks", 'error');});
    }
    public onSearchChange(){
        if(this.search_text.length > 3 || this.search_text.length == 0){
            this.getFeedbacks();
        }
    }
}
