import { Component, Input, OnChanges, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { ModalService } from "../../services/modal.service";
import { IClip } from "../../models/clip.model";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ClipService } from "../../services/clip.service";

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit, OnChanges, OnDestroy {
  @Input()
  activeClip: IClip | null = null;
  inUploading = false;
  showAlert = false;
  alertColor = 'blue';
  alertMsg = 'Please wait! Updating clip. . . ';
  @Output()
  update = new EventEmitter();


  title = new FormControl('', {
    validators: [Validators.required, Validators.minLength(3)],
  });

  clipId = new FormControl('')
  editForm = new FormGroup({
    title: this.title,
    id: this.clipId
  }, [])

  constructor(
    private modal: ModalService,
    private clipService: ClipService
  ) {
  }

  ngOnInit(): void {
    this.modal.register('editClip')
  }

  ngOnChanges() {
    if (!this.activeClip) {
      return;
    }

    this.inUploading = false;
    this.showAlert = false;
    this.clipId.setValue(this.activeClip.docID);
    this.title.setValue(this.activeClip.title);
  }

  ngOnDestroy() {
    this.modal.unregister('editClip')
  }

  async submit() {
    if (!this.activeClip) {
      return;
    }
    this.inUploading = true;
    this.showAlert = true;
    this.alertColor = 'blue';
    this.alertMsg = 'Please wait! Updating clip. . . ';
    try {
      await this.clipService.updateClip(this.clipId.value, this.title.value)
    }
    catch (e) {
      this.inUploading = false;
      this.alertColor = 'red';
      this.alertMsg = 'Something went wrong. Try again later!';

      return;
    }

    this.activeClip.title = this.title.value;
    this.update.emit(this.activeClip)

    this.inUploading = false;
    this.alertColor = 'green';
    this.alertMsg = 'Success!';
  }
}
