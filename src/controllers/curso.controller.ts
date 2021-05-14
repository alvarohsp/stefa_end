import Curso from '../entities/curso.entity';
import CursoRepository from '../repositories/curso.repository';
import { FilterQuery } from '../utils/database/database';
import UnauthorizedException from '../utils/exceptions/unauthorized.exception';
import Mensagem from '../utils/mensagem';
import { Validador } from '../utils/utils';
import Exception from '../utils/exceptions/exception';
import professorRepository from '../repositories/professor.repository';
import usuarioRepository from '../repositories/usuario.repository';
import alunoRepository from '../repositories/aluno.repository';


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

    if (!prof || prof.tipo !=1 ){
      throw new Exception('Professor inválido');
    }
    
    if (req.uid.tipo !=1 || prof.tipo !=1){
      throw new UnauthorizedException("Somente professores podem cadastrar cursos ou ser vinculado a um curso");
    }
    
    if (cur){
      throw new Exception('Já existe um curso com esse nome!');
    }

    if (curso.notas == undefined || curso.notas == null){
      curso.notas = []
    }

    const id = await CursoRepository.incluir(curso);

    curso.aulas[0].idCurso = id;
    curso.aulas[0].id = 1

    await CursoRepository.alterar({ id: id }, curso);
  
    return new Mensagem('Curso incluido com sucesso!', {
      id,
    });
  }

  async alterar(id: number, curso: Curso, req) {
    const { nome, descricao, aulas, idProfessor } = curso;
    Validador.validarParametros([{ id }, { nome }, { descricao }, { aulas }, { idProfessor }]);

    const cur = await CursoRepository.obter({ nome });
    const prof = await professorRepository.obterPorId(Number(idProfessor))

    if (!prof || prof.tipo !=1 ){
      throw new Exception('Professor inválido');
    }
    
    if (cur.id != id){
      throw new Exception('Já existe um curso com esse nome!');
    }

    if (!curso.notas || curso.notas == undefined){
      curso.notas = []
    }

    curso.idProfessor = Number(idProfessor)

    curso.aulas = cur.aulas

    if (req.uid.tipo == 2) {

      if (cur.descricao != curso.descricao || cur.idProfessor != curso.idProfessor || cur.nome != curso.nome){
        throw new UnauthorizedException("Somente professores podem editar cursos");
      }

      for (let x = 0; x < cur.notas.length; x++){
        if (cur.notas[x].idAluno == req.uid.id){
          throw new Exception('Esse curso já foi avaliado');
        }
      }

    } else {

      curso.notas = cur.notas
      
    }

    await CursoRepository.alterar({ id }, curso);

    return new Mensagem('Curso alterado com sucesso!', {
      id,
    });
  }

  async excluir(id: number, req) {
    Validador.validarParametros([{ id }]);
    const curso = await CursoRepository.obterPorId(id);
    const alunos = await alunoRepository.listar();

    if (req.uid.tipo !=1 ){
      throw new UnauthorizedException("Somente professores podem excluir cursos!");
    }

    for (let x = 0; x < alunos.length; x++){
      for (let y = 0; y < alunos[x].cursos.length; y++){
        if (curso.id == alunos[x].cursos[y]){
          throw new Exception("Não é possivel excluir cursos que tenham alunos vinculados!");
        }
      }
    }
    

    await CursoRepository.excluir({ id });

    return new Mensagem('Curso excluido com sucesso!', {
      id,
    });
  }
}
