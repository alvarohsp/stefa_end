import Aula from '../models/aula.model';
import Entity from './entity';
import Nota from './nota.entity';

export default class Curso extends Entity {
  nome: string;
  descricao: string;
  idProfessor?: number;
  aulas?: Aula[];
  notas?: Nota[]; 

  constructor() {
    super();
  }
}
