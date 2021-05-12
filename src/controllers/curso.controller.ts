import Curso from '../entities/curso.entity';
import CursoRepository from '../repositories/curso.repository';
import { FilterQuery } from '../utils/database/database';
import UnauthorizedException from '../utils/exceptions/unauthorized.exception';
import Mensagem from '../utils/mensagem';
import { Validador } from '../utils/utils';
import Exception from '../utils/exceptions/exception';
import professorRepository from '../repositories/professor.repository';


export default class CursoController {
  async obterPorId(id: number): Promise<Curso> {
    Validador.validarParametros([{ id }]);
    return await CursoRepository.obterPorId(id);
  }

  async obter(filtro: FilterQuery<Curso> = {}): Promise<Curso> {
    return await CursoRepository.obter(filtro);
  }

  async listar(filtro: FilterQuery<Curso> = {}): Promise<Curso[]> {
    return await CursoRepository.listar(filtro);
  }

  async incluir(curso: Curso, req: any) {
    let { nome, descricao, aulas, idProfessor } = curso;
    Validador.validarParametros([{ nome }, { descricao }, { aulas }, { idProfessor }]);

    const cur = await CursoRepository.obter({ nome });

    const prof = await professorRepository.obterPorId(idProfessor)

    
    if (req.uid.tipo !=1 || prof.tipo !=1){
      throw new UnauthorizedException("Somente professores podem cadastrar cursos ou ser vinculado a um curso");
    }

    console.log(prof.tipo)
    
    if (cur){
      throw new Exception('Já existe um curso com esse nome!');
    }

    const id = await CursoRepository.incluir(curso);

    curso.aulas[0].idCurso = id;
    curso.aulas[0].id = 1

    await CursoRepository.alterar({ id: id }, curso);
  
    return new Mensagem('Curso incluido com sucesso!', {
      id,
    });
  }

  async alterar(id: number, curso: Curso) {
    const { nome, descricao, aulas, idProfessor } = curso;
    Validador.validarParametros([{ id }, { nome }, { descricao }, { aulas }, { idProfessor }]);

    await CursoRepository.alterar({ id }, curso);

    return new Mensagem('Curso alterado com sucesso!', {
      id,
    });
  }

  async excluir(id: number) {
    Validador.validarParametros([{ id }]);

    await CursoRepository.excluir({ id });

    return new Mensagem('Curso excluido com sucesso!', {
      id,
    });
  }
}
