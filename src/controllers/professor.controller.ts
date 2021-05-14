import Professor from '../entities/professor.entity';
import ProfessorRepository from '../repositories/professor.repository';
import { FilterQuery } from '../utils/database/database';
import Mensagem from '../utils/mensagem';
import { Validador } from '../utils/utils';
import UsuarioRepository from '../repositories/usuario.repository';
import Exception from '../utils/exceptions/exception';
import UnauthorizedException from '../utils/exceptions/unauthorized.exception';
import CursoRepository from '../repositories/curso.repository'; 

export default class ProfessorController {
  async obterPorId(id: number): Promise<Professor> {
    Validador.validarParametros([{ id }]);

    return await ProfessorRepository.obterPorId(id);
  }

  async obter(filtro: FilterQuery<Professor> = {}): Promise<Professor> {
    return await ProfessorRepository.obter(filtro);
  }

  // #pegabandeira
  async listar(filtro: FilterQuery<Professor> = {tipo: {$eq: 1}}): Promise<Professor[]> {
   
    return await ProfessorRepository.listar(filtro);
  }

  // #pegabandeira
  async incluir(professor: Professor) {
    const { nome, email, senha } = professor;

    Validador.validarParametros([{ nome }, { email }, { senha }]);
    professor.tipo = 1;
    const prof = await UsuarioRepository.obter({ email });
    if (prof){
      throw new Exception('Esse e-mail ja se encontra cadastrado!');
    }

    const id = await ProfessorRepository.incluir(professor);

    return new Mensagem('Professor incluido com sucesso!', {
      id,
    });
  }

  async alterar(id: number, professor: Professor, req) {
    const { nome, email, senha } = professor;

    Validador.validarParametros([{ id }, { nome }, { email }, { senha }]);
    const user = await ProfessorRepository.obterPorId(id);
    
    Validador.verificarAuthEdit(req, user, professor);

    await ProfessorRepository.alterar({ id }, professor);

    return new Mensagem('Professor alterado com sucesso!', {
      id,
    });
  }

  async excluir(id: number, req) {
    Validador.validarParametros([{ id }]);

    const user = await ProfessorRepository.obterPorId(id);
    const cursos = await CursoRepository.listar();

    for (let x = 0; x < cursos.length; x++){
     if (cursos[x].idProfessor == user.id){
       throw new Exception("Não é possivel excluir um professor que esteja lecionando algum curso!");
     }
    }

    Validador.verificarAuthDel(req, user);



    await ProfessorRepository.excluir({ id });

    return new Mensagem('Professor excluido com sucesso!', {
      id,
    });
  }
}
