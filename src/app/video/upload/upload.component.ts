import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { AngularFireStorage, AngularFireUploadTask } from "@angular/fire/compat/storage";
import { v4 } from "uuid";
import { last, switchMap, tap } from "rxjs";
import firebase from "firebase/compat/app";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { ClipService } from "../../services/clip.service";
import { IClip } from "../../models/clip.model";
import { Router } from "@angular/router";

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnDestroy {
  isDragover = false;
  file: File | null = null;
  nextStep = false;
  showAlert = false;
  alertMsg = 'Uploading. . . ';
  alertColor = 'blue';
  inUploading = false;
  percentage = 0;
  showPercentage = false;
  user: firebase.User | null = null;
  task?: AngularFireUploadTask

  title = new FormControl('', {
    validators: [Validators.required, Validators.minLength(3)],
  });

  uploadForm = new FormGroup({
      title: this.title,

    }, []
  )

  constructor(
    private storage: AngularFireStorage,
    private auth: AngularFireAuth,
    private clipsService: ClipService,
    private router: Router
  ) {
    auth.user.subscribe(user => this.user = user)
  }

  ngOnDestroy(): void {
    this.task?.cancel()
  }

  storeFile(event: Event) {
    this.isDragover = false;

    this.file = (event as DragEvent).dataTransfer
      ? (event as DragEvent).dataTransfer?.files.item(0) ?? null
      : (event.target as HTMLInputElement).files?.item(0) ?? null

    if (!this.file || this.file.type !== 'video/mp4') {
      return
    }
    this.title.setValue(this.file.name.replace(/\.[^/.]+$/, ''))
    this.nextStep = true;
  }

  uploadFile() {
    this.uploadForm.disable();

    this.showAlert = true;
    this.alertMsg = 'blue';
    this.alertMsg = 'Uploading . . .';
    this.inUploading = true;
    this.showPercentage = true;

    const clipFileName = v4();
    const clipPath = `clips/${ clipFileName }.mp4`

    this.task = this.storage.upload(clipPath, this.file);
    this.task.percentageChanges().subscribe(progress => {
      this.percentage = progress as number / 100
    })
    const clipReference = this.storage.ref(clipPath)

    this.task.snapshotChanges().pipe(
      last(),
      switchMap(() => clipReference.getDownloadURL()),
      tap(console.log)
    ).subscribe({
      next: async (url) => {
        const clip: IClip = {
          uid: this.user?.uid as string,
          displayName: this.user?.displayName as string,
          title: this.title.value,
          fileName: `${ clipFileName }.mp4`,
          url,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }

        const clipDocRef = await this.clipsService.createClip(clip)

        this.alertColor = 'green';
        this.alertMsg = "Success!";
        this.showPercentage = false;

        setTimeout(() => {
          this.router.navigate([
            'clip',
            clipDocRef.id
          ])
        }, 1000)

      },
      error: (error) => {
        this.uploadForm.enable();

        this.showPercentage = false;
        this.alertColor = 'red';
        this.alertMsg = 'Upload failed! Please try again';
        this.inUploading = true;
        console.log(error)
      }
    })
  }

}
