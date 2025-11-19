declare module 'bcrypt' {
  interface Bcrypt {
    hash(data: string | Buffer, saltOrRounds: string | number): Promise<string>;
    compare(data: string | Buffer, encrypted: string): Promise<boolean>;
  }

  const bcrypt: Bcrypt;
  export = bcrypt;
}
