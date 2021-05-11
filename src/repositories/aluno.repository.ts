import Aluno from '../entities/aluno.entity';
import { FilterQuery } from '../utils/database/database';
import { Tables } from '../utils/tables.enum';
import { TipoUsuario } from '../utils/tipo-usuario.enum';
import { Validador } from '../utils/utils';
import Repository from './repository';
import Exception from '../utils/exceptions/exception';

class AlunoRepository extends Repository<Aluno> {
  constructor() {
    super(Tables.USUARIO);
  }

  async obterPorId(id: number): Promise<Aluno> {
    return super.obterPorId(id);
  }

  async incluir(aluno: Aluno) {
    aluno.senha = Validador.criptografarSenha(aluno.senha);
    aluno.tipo = TipoUsuario.ALUNO;
    return super.incluir(aluno);
  }

  async alterar(filtro: FilterQuery<Aluno>, aluno: Aluno) {
    if (aluno.senha) {
      aluno.senha = Validador.criptografarSenha(aluno.senha);
    }
    return super.alterar(filtro, aluno);
  }
}

export default new AlunoRepository();
