import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, deleteDoc, doc, getDoc, getDocs, updateDoc } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';

export interface Note {
  title: string; 
  description: string;
  id?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NoteService {

  private _notes = new BehaviorSubject<Note[]>([]);

  get notes() {
    return this._notes.asObservable();
  }

  constructor(
    private firestore: Firestore,
  ) { }

  async addNote(data: Note) {
    try {
      const dataRef: any = collection(this.firestore, 'notes');
      const response = await addDoc(dataRef, data);
      console.log(response);
      const id = await response?.id;
      const currentNotes = this._notes.value;
      let notes: Note[] = [{...data, id}];
      notes = notes.concat(currentNotes);
      this._notes.next(notes);
      return notes; 
    } catch(e) {
      throw(e);
    }
  }

  async getNotes() {
    try {
      const dataRef: any = collection(this.firestore, 'notes');
      const querySnapshot = await getDocs(dataRef);
      const notes: Note[] = await querySnapshot.docs.map((doc) => {
        let item: any = doc.data();
        item.id = doc.id;
        return item;
      });
      console.log('notes: ', notes);
      this._notes.next(notes);
      return notes;
    } catch(e) {
      throw(e);
    }
  }

  async getNoteById(id: string) {
    try {
      const dataRef: any = doc(this.firestore, `notes/${id}`);
      const docSnap = await getDoc(dataRef);
      if (docSnap.exists()) {
        // return docSnap.data() as Note;
        let item: any = docSnap.data();
        item.id = docSnap.id;
        return {...item} as Note;
      } else {
        console.log("No such document!");
        throw("No such document!");
      }
    } catch(e) {
      throw(e);
    }
  }

  async updateNote(id: string, data: Note) {
    try {
      const dataRef: any = doc(this.firestore, `notes/${id}`);
      await updateDoc(dataRef, data);
      let currentNotes = this._notes.value;
      const index = currentNotes.findIndex(x => x.id == id);
      const latestData = {id, ...data};
      currentNotes[index] = latestData;
      this._notes.next(currentNotes);
      return latestData;
    } catch(e) {
      throw(e);
    }
  }

  async deleteNote(id: string) {
    try {
      const dataRef: any = doc(this.firestore, `notes/${id}`);
      await deleteDoc(dataRef);
      let currentNotes = this._notes.value;
      currentNotes = currentNotes.filter(x => x.id != id);
      this._notes.next(currentNotes);
    } catch(e) {
      throw(e);
    }
  }


}
