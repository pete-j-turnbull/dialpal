import { ConfirmData, ConfirmDataOpts } from './types';

let confirmCounter = 1;

class ConfirmObserver {
  subscribers: Array<(confirmData: ConfirmData) => void>;
  confirms: Array<ConfirmData>;

  constructor() {
    this.subscribers = [];
    this.confirms = [];
  }

  subscribe = (subscriber: (confirmData: ConfirmData) => void) => {
    this.subscribers.push(subscriber);

    return () => {
      const index = this.subscribers.indexOf(subscriber);
      this.subscribers.splice(index, 1);
    };
  };

  publish = (data: ConfirmData) => {
    this.subscribers.forEach((subscriber) => subscriber(data));
  };

  create = (message: string, opts?: ConfirmDataOpts) => {
    const id = confirmCounter++;
    const confirmPromise = new Promise<boolean>((resolve) => {
      this.addConfirm({ id, message, resolve, opts });
    });

    return confirmPromise;
  };

  addConfirm = (data: ConfirmData) => {
    this.publish(data);
    this.confirms = [...this.confirms, data];
  };

  resolveConfirm = (id: number, result: boolean) => {
    const confirm = this.confirms.find((c) => c.id === id);
    if (confirm) {
      confirm.resolve(result);
      this.confirms = this.confirms.filter((c) => c.id !== id);
    }
  };
}

export const ConfirmState = new ConfirmObserver();

export const confirm = (message: string, opts?: ConfirmDataOpts) => {
  return ConfirmState.create(message, opts);
};
