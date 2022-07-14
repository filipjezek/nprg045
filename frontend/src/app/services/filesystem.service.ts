import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from './http.service';
import { FolderInfo } from '../store/reducers/filesystem.reducer';

@Injectable({
  providedIn: 'root',
})
export class FilesystemService {
  constructor(private http: HttpService) {}

  public loadFilesystem(): Observable<FolderInfo> {
    return this.http.get<FolderInfo>('filesystem');
  }
}
