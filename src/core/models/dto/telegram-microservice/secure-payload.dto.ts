export interface SecurePayloadDto<T> {
  hash: string;
  lt: number;
  payload: T;
}
