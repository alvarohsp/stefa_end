import express, { NextFunction, Request, Response } from 'express';
import ProfessorController from '../controllers/professor.controller';
import Professor from '../entities/professor.entity';
import Mensagem from '../utils/mensagem';
import { Validador } from '../utils/utils';
import Exception from '../utils/exceptions/exception';

const router = express.Router();

router.post('/professor', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const mensagem: Mensagem = await new ProfessorController().incluir(req.body);
    res.json(mensagem);
  } catch (e) {
    next(e);
  }
});

router.put('/professor/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const mensagem: Mensagem = await new ProfessorController().alterar(Number(id), req.body);
    res.json(mensagem);
  } catch (e) {
    next(e);
  }
});

router.delete('/professor/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const mensagem: Mensagem = await new ProfessorController().excluir(Number(id));
    res.json(mensagem);
  } catch (e) {
    next(e);
  }
});

router.get('/professor/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const professor: Professor = await new ProfessorController().obterPorId(Number(id));
    if (!professor || professor.tipo !=1){
      throw new Exception('Não existe professor com esse ID!'); 
    }
    res.json(Validador.removerSenha(professor));
  } catch (e) {
    next(e);
  }
});

router.get('/professor', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const professores: Professor[] = await new ProfessorController().listar();
    res.json(Validador.removerSenhaTodos(professores));
  } catch (e) {
    next(e);
  }
});

export default router;
