import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { IonModal, IonicModule } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';
import { Note, NoteService } from '../services/note/note.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class HomePage implements OnInit, OnDestroy {

  @ViewChild(IonModal) modal!: IonModal;
  noteSub!: Subscription;
  model: any = {};
  notes: Note[] = [];
  isOpen: boolean = false;
  
  constructor(private note: NoteService) {}

  ngOnInit(): void {
    this.note.getNotes();
    this.noteSub = this.note.notes.subscribe({
      next: (notes) => {
        this.notes = notes;
      },
      error: (e) => {
        console.log(e);
      }
    });
  }

  onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    this.model = {};
    this.isOpen = false;
  }

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  async save(form: NgForm) {
    try {
      if(!form.valid) {
        // alert
        return;
      }
      console.log(form.value);
      if(this.model?.id) await this.note.updateNote(this.model.id, form.value);
      else await this.note.addNote(form.value);
      this.modal.dismiss();
    } catch(e) {
      console.log(e);
    }
  }

  async deleteNote(note: Note) {
    try {
      await this.note.deleteNote(note?.id!);
    } catch(e) {
      console.log(e);
    }
  }

  async editNote(note: Note) {
    try {
      this.isOpen = true;
      this.model = { ...note };
      // const data: Note = await this.note.getNoteById(note?.id!);
      // console.log('data: ', data);
      // this.model = { ...data };
    } catch(e) {
      console.log(e);
    }
  }

  ngOnDestroy(): void {
      if(this.noteSub) this.noteSub.unsubscribe();
  }

}
