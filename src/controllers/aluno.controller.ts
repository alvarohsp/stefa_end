import Aluno from '../entities/aluno.entity';
import AlunoRepository from '../repositories/aluno.repository';
import { FilterQuery } from '../utils/database/database';
import Mensagem from '../utils/mensagem';
import { Validador } from '../utils/utils';
import Exception from '../utils/exceptions/exception';
import UsuarioRepository from '../repositories/usuario.repository';
import UnauthorizedException from '../utils/exceptions/unauthorized.exception';
import alunoRepository from '../repositories/aluno.repository';
import cursoRepository from '../repositories/curso.repository';

export default class AlunoController {
  async obterPorId(id: number): Promise<Aluno> {
    Validador.validarParametros([{ id }]);
    return await AlunoRepository.obterPorId(id);
  }

  async obter(filtro: FilterQuery<Aluno> = {}): Promise<Aluno> {
    return await AlunoRepository.obter(filtro);
  }

  // #pegabandeira
  async listar(filtro: FilterQuery<Aluno> = { tipo: {$eq: 2} }): Promise<Aluno[]> {
    return await AlunoRepository.listar(filtro);
  }

  // #pegabandeira
  async incluir(aluno: Aluno) {
    const { nome, formacao, idade, email, senha } = aluno;
    Validador.validarParametros([{ nome }, { formacao }, { idade }, { email }, { senha }]);
    const alun = await UsuarioRepository.obter({ email });
    if (alun){
      throw new Exception('Esse e-mail ja se encontra cadastrado!');
    }
    const id = await AlunoRepository.incluir(aluno);
    return new Mensagem('Aluno incluido com sucesso!', {
      id,
    });
  }

  async alterar(id: number, aluno: Aluno, req: any) {
    const { nome, formacao, idade, cursos } = aluno;
    Validador.validarParametros([{ id }, { nome }, { formacao }, { idade }, { cursos }]);
    const user = await AlunoRepository.obter({ id });
    Validador.verificarAuthEdit(req, user, aluno)
   
    console.log(aluno.cursos)
    console.log(user.cursos)

    try {
      var cursoFiltrado = cursos.filter((este, i) => cursos.indexOf(este) === i);
      aluno.cursos = cursoFiltrado;
    }catch{

      throw new Exception('Dados inválidos');

    }
     
    await AlunoRepository.alterar({ id }, aluno);
    return new Mensagem('Aluno alterado com sucesso!', {
      id,
    });
  }

  async excluir(id: number, req) {
    Validador.validarParametros([{ id }]);
    const user = await AlunoRepository.obterPorId(id);
    Validador.verificarAuthDel(req, user);


    if (user.cursos.length !== 0){
      throw new Exception('Não é possivel excluir um aluno que está vinculado a um curso!');
    }

    await AlunoRepository.excluir({ id });
    return new Mensagem('Aluno excluido com sucesso!', {
      id,
    });
  }
}
