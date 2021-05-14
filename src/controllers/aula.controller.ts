import Aula from '../models/aula.model';
import CursoRepository from '../repositories/curso.repository';
import Mensagem from '../utils/mensagem';
import { Validador } from '../utils/utils';
import UnauthorizedException from '../utils/exceptions/unauthorized.exception';
import Exception from '../utils/exceptions/exception';

export default class AulaController {
  async obterPorId(id: number, idCurso: number): Promise<Aula> {
    Validador.validarParametros([{ id }, { idCurso }]);
    const curso = await CursoRepository.obterPorId(idCurso);
    return curso.aulas.find((a) => a.id === id);
  }

  async listar(idCurso: number): Promise<Aula[]> {
    Validador.validarParametros([{ idCurso }]);
    const curso = await CursoRepository.obterPorId(idCurso);
    return curso.aulas;
  }

  async incluir(aula: Aula, req: any) {
    const { nome, duracao, topicos, idCurso } = aula;
    Validador.validarParametros([{ nome }, { duracao }, { topicos }, { idCurso }]);
    
    if (req.uid.tipo !=1){
      throw new UnauthorizedException("Somente professores podem cadastrar aulas");
    }

    const curso = await CursoRepository.obterPorId(idCurso);

    for (let x = 0; x < curso.aulas.length; x++){
      if (curso.aulas[x].nome.toLowerCase() == nome.toLowerCase()){
        throw new Exception("Já existe uma aula com esse nome");
      }
    }

    const idAnterior = curso.aulas[curso.aulas.length - 1].id;
    aula.id = idAnterior ? idAnterior + 1 : 1;
    curso.aulas.push(aula);

    await CursoRepository.alterar({ id: idCurso }, curso);

    return new Mensagem('Aula incluida com sucesso!', {
      id: aula.id,
      idCurso,
    });
  }

  async alterar(id: number, aula: Aula, req) {
    const { nome, duracao, topicos, idCurso } = aula;
    Validador.validarParametros([{ id }, { idCurso }, { nome }, { duracao }, { topicos }]);

    if (req.uid.tipo !=1){
      throw new UnauthorizedException("Somente professores podem editar aulas");
    }

    const curso = await CursoRepository.obterPorId(idCurso);  

    for (let x = 0; x < curso.aulas.length; x++){
      if (curso.aulas[x].nome.toLowerCase() == nome.toLowerCase() && curso.aulas[x].id != id){
        throw new Exception("Já existe uma aula com esse nome");
      }
    }

    curso.aulas.map((a) => {
      if (a.id === id) {
        Object.keys(aula).forEach((k) => {
          a[k] = aula[k];
        });
      }
    });

    await CursoRepository.alterar({ id: idCurso }, curso);

    return new Mensagem('Aula alterada com sucesso!', {
      id,
      idCurso,
    });
  }

  async excluir(id: number, idCurso: number, req) {
    Validador.validarParametros([{ id }, { idCurso }]);

    const curso = await CursoRepository.obterPorId(idCurso);

    if (req.uid.tipo !=1){
      throw new UnauthorizedException("Somente professores podem excluir aulas");
    }

    if (curso.aulas.length < 2){
      throw new Exception("Não é possivel excluir todas as aulas de um curso!");
    }

    curso.aulas = curso.aulas.filter((a) => a.id !== id);

    await CursoRepository.alterar({ id: idCurso }, curso);

    return new Mensagem('Aula excluida com sucesso!');
  }
}
