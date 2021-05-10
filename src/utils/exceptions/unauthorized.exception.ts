import Exception from './exception';

export default class UnauthorizedException extends Exception {
  constructor(message: string, status: number = 401) {
    super(message, status);
  }
}
