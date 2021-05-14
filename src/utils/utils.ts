import bcrypt from 'bcryptjs';
import BusinessException from '../utils/exceptions/business.exception';
import UnauthorizedException from '../utils/exceptions/unauthorized.exception';
import jwt from 'jsonwebtoken';
import config from '../utils/config/config';
import Exception from './exceptions/exception';


export const Validador = {
  validarParametros: (parametros: any[]) => {
    if (!parametros) return true;

    const parametrosInvalidos = parametros
      .filter((p) => {
        const attr = Object.keys(p)[0];
        return (
          p[attr] === null ||
          p[attr] === undefined ||
          (typeof p[attr] === 'number' && isNaN(p[attr])) ||
          (typeof p[attr] === 'string' && p[attr] === '')
        );
      })
      .map((p) => Object.keys(p)[0]);

    if (parametrosInvalidos.length) {
      throw new BusinessException(`Os seguintes parametros são obrigatórios: ${parametrosInvalidos.join(', ')}`);
    }
    return true;
  },

  validarSenha: (senha: string, senhaAtual: string) => {
    const isValid = bcrypt.compareSync(senha, senhaAtual);

    if (!isValid) {
      throw new UnauthorizedException('Usuário ou senha inválida.');
    }
  },

  criptografarSenha: (senha: string): string => {
    return bcrypt.hashSync(senha, 8);
  },

  removerSenhaTodos(arrayObj) {
    for (let x = 0; x < arrayObj.length; x++){
      arrayObj[x].senha = undefined;
    }
    return arrayObj;
  },

  removerSenha(obj) {
    obj.senha = undefined;
    return obj;
  },

  pegarToken(req){

    const authorization = req.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedException('Token não informado.');
    }

    try{
    const decoded = jwt.verify(authorization, config.auth.secret);
    // @ts-ignore
    req.uid = decoded;

    }catch{
      throw new UnauthorizedException('Token inválido.');
    }
  },

  verificarAuthDel(req, user) {

    if (req.uid.tipo != 1){
      throw new UnauthorizedException('Permissão negada!');
    }

    if (req.uid.email == user.email){
      throw new Exception("Não é possivel excluir a si mesmo")
    }

  },

  verificarAuthEdit(req, user, editedUser) {

    if (!user) {
      throw new Exception('Não existe usuário com esse ID!');
    }

    editedUser.tipo = user.tipo

    if (user.email != editedUser.email) {
      throw new Exception('Não é permitido a alteração do email!');
    }

    if (editedUser.id != user.id || editedUser.tipo != user.tipo) {
      console.log(editedUser)
      console.log(user)
      throw new Exception('Não é permitido a alteração de ID ou tipo!');
    }

    if (req.uid.tipo == 2) {
      if (user.tipo == 1 || req.uid.email != user.email) {
        throw new UnauthorizedException('Você não tem permissão para alterar esse usuario.');
      }
    }

    if (req.uid.tipo == 1 && user.tipo == 1 && req.uid.email != user.email) {
      throw new UnauthorizedException('Você não tem permissão para alterar esse usuario.');
    }

    if (!editedUser.senha){
      editedUser.senha = user.senha
    }

  }

};