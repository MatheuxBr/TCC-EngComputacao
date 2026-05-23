import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UsuarioDTO {
  id: number;
  email: string;
  username: string;
  idNivel: number;
  nomeNivel: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = '/api/usuarios';

  constructor(private http: HttpClient) {}

  listarUsuarios(): Observable<UsuarioDTO[]> {
    return this.http.get<UsuarioDTO[]>(this.apiUrl);
  }

  promoverParaAdmin(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/promover`, {});
  }
}
