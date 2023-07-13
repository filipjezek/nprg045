import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from './http.service';
import { FolderInfo } from '../store/reducers/filesystem.reducer';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class FilesystemService {
  constructor(private http: HttpService) {}

  public loadRecursiveFilesystem(path?: string): Observable<FolderInfo> {
    let params = new HttpParams();
    if (path) params = params.append('path', path);
    return this.http.get<FolderInfo>('fs/recursive', params);
  }

  public loadDirectory(path?: string): Observable<FolderInfo> {
    let params = new HttpParams();
    if (path) params = params.append('path', path);
    return this.http.get<FolderInfo>('fs/directory', params);
  }
}
