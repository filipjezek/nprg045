export enum ToastLevel {
  normal,
  warning,
  danger,
  success,
}

export class Toast {
  constructor(public message: string, public level: ToastLevel = ToastLevel.normal) {}

  public static warning(message: string) {
    return new this(message, ToastLevel.warning);
  }
  public static danger(message: string) {
    return new this(message, ToastLevel.danger);
  }
  public static success(message: string) {
    return new this(message, ToastLevel.success);
  }
}
