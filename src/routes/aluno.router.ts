import express, { NextFunction, Request, Response } from 'express';
import AlunoController from '../controllers/aluno.controller';
import Aluno from '../entities/aluno.entity';
import Mensagem from '../utils/mensagem';
import { Validador } from '../utils/utils';
import Exception from '../utils/exceptions/exception';

const router = express.Router();

router.post('/aluno', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const mensagem: Mensagem = await new AlunoController().incluir(req.body);
    res.json(mensagem);
  } catch (e) {
    next(e);
  }
});

router.put('/aluno/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const mensagem: Mensagem = await new AlunoController().alterar(Number(id), req.body);
    res.json(mensagem);
  } catch (e) {
    next(e);
  }
});

router.delete('/aluno/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const mensagem: Mensagem = await new AlunoController().excluir(Number(id));
    res.json(mensagem);
  } catch (e) {
    next(e);
  }
});

router.get('/aluno/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const aluno: Aluno = await new AlunoController().obterPorId(Number(id));
    if (!aluno || aluno.tipo != 2){
      throw new Exception('Não existe aluno com esse ID!'); 
    }
    res.json(Validador.removerSenha(aluno));
  } catch (e) {
    next(e);
  }
});

router.get('/aluno', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const alunos: Aluno[] = await new AlunoController().listar();
    res.json(Validador.removerSenhaTodos(alunos));
  } catch (e) {
    next(e);
  }
});

export default router;
