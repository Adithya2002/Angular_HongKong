import { Component, Input, OnInit, ViewChild, Inject } from '@angular/core';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service'
import { switchMap } from 'rxjs/operators';
import { FormGroup } from '@angular/forms';
import { DishFeedback } from '../shared/dishFeedback';
import { FormBuilder,  Validators } from '@angular/forms';
import { flyInOut, visibility, expand } from '../animations/app.animation';

import { ValueTransformer } from '@angular/compiler/src/util';








@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss'],
  host: {
    '[@flyInOut]': 'true',
    'style': 'display: block;'
    },
    
  animations: [
   visibility(),
   flyInOut(),
   expand()
  ]
})





export class DishdetailComponent implements OnInit {

  @ViewChild('fform') feedbackFormDirective;

  feedbackForm : FormGroup;
  feedback : DishFeedback;
  newDishRating = [{
  }];
  presentDate = new Date();
  visibility = 'shown';
  
    
  //  @Input()
  //  dish: Dish;
  dish:Dish;
  dishcopy:Dish;
  //dish1 = DISHES;
  newArray;

  dishIds: string[];
  prev: string;
  next: string;
  errMess: String;

  constructor(private dishService:DishService, 
    private route:ActivatedRoute, 
    private location:Location, 
    private fb: FormBuilder,  
    @Inject('BaseURL') private BaseURL) {
    this.createForm();
   }

   formErrors = {
    'author': '',
    'comment': '',
    'rating': '',
    'date': ''
  };

  validationMessages = {
    'author': {
      'required':      'Author name is required.',
      'minlength':     'Author name must be at least 2 characters long.',
      'maxlength':     'Author name cannot be more than 25 characters long.'
    },
    'comment': {
      'required':      'comment is required.',
      'minlength':     'comment must be at least 6 characters long.',
      'maxlength':     'comment cannot be more than 25 characters long.'
    },
    'rating': {
      'required':      'rating is required.',
      'pattern':       'rating must contain only numbers.'
    },
    
  };

 

   
  

   createForm(){
     this.feedbackForm = this.fb.group({
       author : ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
       comment : ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
       rating : ['',[Validators.required]],
       date : ['']

     })
     this.feedbackForm.valueChanges.subscribe(data =>this.onValueChanged(data));
     this.onValueChanged();

   }

   onSubmit() {
    this.feedback = this.feedbackForm.value;
    this.feedback.date = new Date().toISOString();
    console.log(this.feedback);
    console.log(this.presentDate);
    this.newDishRating.push({author: this.feedback.author, comment: this.feedback.comment, rating: this.feedback.rating, date: this.presentDate})
    this.dishcopy.comments.push(this.feedback);
    this.dishService.putDish(this.dishcopy)
      .subscribe(dish => {
        this.dish = dish; 
      },
      errmess => { this.dish = null; this.dishcopy = null; this.errMess = <any>errmess; });

    this.feedbackForm.reset({
      author: '',
      comment: '',
      rating: '',
      date: '',
     
    });
    this.feedbackFormDirective.resetForm();
  }

   onValueChanged(data?: any) {
    if (!this.feedbackForm) { return; }
    const form = this.feedbackForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }

  ngOnInit() {
    this.dishService.getDishIds().subscribe(dishIds => 
      {
        this.dishIds = dishIds;
      }
      );

    this.route.params.pipe(switchMap((params: Params) =>{ this.visibility = 'hidden'; return this.dishService.getDish(params['id'])})
    )
    .subscribe(dish => { this.dish = dish;this.newArray = new Array(this.dish.comments.length);this.dishcopy = dish; this.setPrevNext(dish.id); this.visibility = 'shown';}, errmess => this.errMess = <any>errmess);
    
    console.log('hello');
    
    
  }

  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }

  goBack(): void{
    this.location.back();
  }

}
